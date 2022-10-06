import * as dotenv from "dotenv";
dotenv.config();

import * as L from "./lucid";
import * as W from "./wallet";

import { errorTypes } from "./error.types";

import Logger from "../Logger";

import { memoryCache } from "./cache";

import { BlockFrostAPI, BlockfrostServerError } from "@blockfrost/blockfrost-js";

const BlockfrostAPI = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_APIKEY,
  isTestnet: process.env.CARDANO_NETWORK == 0 ? true : false,
});

export const MintNFT = async ({ assetName, metadata, options }) => {
  Logger.info("Start MintNFT");
  let policy = W.createLockingPolicyScript();
  policy.script = Buffer.from(policy.script.to_bytes(), "hex").toString("hex");
  
  if (options.policy && options.policy.id && options.policy.script && options.policy.ttl && options.policy.reuse && options.policy.reuse == true) {
    policy = options.policy;
  }

  metadata.timestamp = new Date().getTime();
  metadata.policy = policy.id;
  metadata.ttl = policy.ttl;

  // const utxos = await L.lucid.wallet.getUtxos();
  const asset = `${policy.id}${Buffer.from(assetName, "hex").toString("hex")}`;

  const address = await L.lucid.wallet.address();
  const utxo = await L.lucid.utxosAtWithUnit(address, asset);
  if (utxo.length > 0) {
    throw new Error(errorTypes.NFT_MINTED);
  }

  let mintToken = { 
    [asset]: 1n,
  };

  if (options.burn && options.burn == true) {
    mintToken[options.asset] = -1n;
  }

  if (options.policy && options.policy.reuse && options.policy.reuse == true && options.policy.id !== policy.id) {
    Logger.error("POLICY_ID_DIFFERENCT:", options.policy.id, policy.id);
    throw new Error(errorTypes.ERROR_WHILE_REUSING_POLICY_ID);
  }

  const tx = await L.lucid.newTx()
  // .collectFrom(utxos)
  .attachMintingPolicy(policy)
  .attachMetadata(721, {
    [policy.id]: {
      [Buffer.from(assetName, "hex").toString("hex")]: metadata,
    },
  })
  .mintAssets(mintToken)
  .validTo(L.lucid.utils.slotToUnixTime(policy.ttl))
  .payToAddress(address, mintToken)
  .complete();
  
  const signedTx = await tx.sign().complete();
  
  try {
    const txHash = await signedTx.submit();
    await L.lucid.awaitTx(txHash);
    Logger.info("Mint", txHash);
    await getAssetDetails(asset);
    // delay(10000);
  } catch (error) {
    Logger.error(error);
    throw new Error(errorTypes.TRANSACTION_REJECT);
  }

  return { policy, asset };
};

export const BurnNFT = async ({ config }) => {
  Logger.info("Start BurnNFT");
  // const utxos = await L.lucid.wallet.getUtxos();
  const address = await L.lucid.wallet.address();
  const utxo = await L.lucid.utxosAtWithUnit(address, config.asset);
  
  if (utxo.length > 0) {

    const tx = await L.lucid.newTx()
    .collectFrom(utxo)
    .attachMintingPolicy(config.policy)
    .mintAssets({
      [config.asset]: -1n
    })
    .validTo(L.lucid.utils.slotToUnixTime(config.policy.ttl))
    .complete();
    
    const signedTx = await tx.sign().complete();
    
    try {
      const txHash = await signedTx.submit();
      await L.lucid.awaitTx(txHash);
      Logger.info("Burn", txHash);
      // delay(10000);
      if (memoryCache.get(config.asset)) {
        memoryCache.ttl(config.asset, 0);
        memoryCache.del(config.asset);
      }
    } catch (error) {
      Logger.error(error);
      throw new Error(errorTypes.TRANSACTION_REJECT);
    }

  } else {
    throw new Error(errorTypes.NFT_COULD_NOT_BE_FOUND_IN_WALLET);
  }
};

export const getMintedAssets = async (policyId, { page = 1, count = 100, order = "asc" }) => {
  try {
    const response = await BlockfrostAPI.assetsPolicyByIdAll(policyId, { page, count, order });
    let newValue = response
      .filter((asset) => parseInt(asset.quantity) === 1)
      .map((asset) => asset.asset);
    newValue = await Promise.all(newValue.map(async (asset) => await getAssetDetails(asset)));
    return newValue;
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      return [];
    }
    throw new Error(errorTypes.COULD_NOT_FETCH_MINTED_ASSETS);
  }
};

export const getAssetDetails = async (asset) => {
  try {
    const address = await L.lucid.wallet.address();
    const utxo = await L.lucid.utxosAtWithUnit(address, asset);
    if (utxo.length > 0) {
      if (memoryCache.get(`${asset}`) !== undefined) {
        return memoryCache.get(`${asset}`);
      }
      const response = await BlockfrostAPI.assetsById(asset);
      if (parseInt(response.quantity) === 1 && response.onchain_metadata) {
        const assetDetails = {
          asset: response.asset,
          policyId: response.policy_id,
          assetName: response.asset_name,
          readableAssetName: Buffer.from(response.asset_name, "hex").toString(),
          fingerprint: response.fingerprint,
          quantity: parseInt(response.quantity),
          initialMintTxHash: response.initial_mint_tx_hash,
          mintOrBurnCount: parseInt(response.mint_or_burn_count),
          onchainMetadata: renameObjectKey(
            response.onchain_metadata,
            "Name",
            "name"
          ),
          metadata: response.metadata,
        };
        const newValue = deleteObjectKey(assetDetails, "");
        memoryCache.set(`${asset}`, newValue, 604800);
        return newValue;
      }
    }
    return {};
  } catch (error) {
    if (error instanceof BlockfrostServerError && error.status_code === 404) {
      return {};
    }
    throw new Error(errorTypes.COULD_NOT_FETCH_ASSET_DETAILS);
  }
};

export const fromLovelace = (lovelace) => lovelace / 1000000;
export const toLovelace = (ada) => ada * 1000000;

export const renameObjectKey = (object, oldKey, newKey) => {
  let newObject = { ...object };
  if (oldKey in newObject) {
    newObject[newKey] = newObject[oldKey];
    delete newObject[oldKey];
  }
  return newObject;
};

export const deleteObjectKey = (object, key) => {
  let newObject = {};
  if (object) {
    Object.keys(object).forEach((objectKey) => {
      if (typeof object[objectKey] === "object") {
        newObject = {
          ...newObject,
          [objectKey]: deleteObjectKey(object[objectKey], key),
        };
      } else if (objectKey !== key) {
        newObject = {
          ...newObject,
          [objectKey]: object[objectKey],
        };
      }
    });
  }
  return newObject;
};

export async function delay(delayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}