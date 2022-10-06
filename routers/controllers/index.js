import * as core from "../../core";
import * as T from "../../core/transaction";
import { errorTypes } from "./error.types";
import { Response } from "./response";

import Logger from "../../Logger";

import * as BodyValidator from "simple-body-validator";
import * as RuleValidator from "./rule";

import { memoryCache } from "../../core/cache";

export const HelloWorld = async (req, res, next) => {
  return res.json("HELLO_WORLD!");
};

export const StoreHash = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreHash);
    if (bodyValidator.validate()) {
      const { hash } = req.body;
      const { policy, asset } = await T.MintNFT({
        assetName: hash,
        metadata: {
          attach: hash,
          version: 0,
          type: "document",
        },
        options: {}
      });
      return res.json(Response({ type: "document", policy, asset }, undefined));
    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const UpdateHash = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.UpdateHash);
    if (bodyValidator.validate()) {
      const { newHash, config } = req.body;

      let assetDetail = await T.getAssetDetails(config.asset);

      if (assetDetail && assetDetail.onchainMetadata) {

        const assetName = assetDetail.assetName;
        assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
        assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

        if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {

          const newVersion = assetDetail.onchainMetadata.version + 1;

          const { policy, asset } = await T.MintNFT({
            assetName: newHash,
            metadata: {
              attach: newHash,
              previous: config.asset.slice(56),
              version: newVersion,
              type: "document",
            },
            options: {
              policy: config.policy,
              asset: config.asset,
              burn: config.burn,
            },
          });

          if ((config.policy.reuse && config.policy.reuse === true && policy.id !== config.policy.id) || asset === config.asset) {
            return res.json(Response(undefined, {
              reason: errorTypes.SOMETHING_WENT_WRONG,
            }));
          }

          return res.json(Response({ type: "document", policy, asset }, undefined));

        } else {
          return res.json(Response(undefined, {
            reason: errorTypes.CONFIG_MISMATCH,
          }));
        }

      } else {
        return res.json(Response(undefined, {
          reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
        }));
      }

    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const RevokeHash = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.RevokeHash);
    if (bodyValidator.validate()) {
      const { config } = req.body;
      try {
        await T.BurnNFT({
          config: config
        });
        return res.json(Response("SUCCESS", undefined));
      } catch (error) {
        Logger.error(error);
        return res.json(Response(undefined, {
          reason: errorTypes.BURN_NFT_FAILED,
        }));
      }
    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const StoreCredential = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.StoreCredential);
    if (bodyValidator.validate()) {
      const { credential, config } = req.body;

      let currIndex = 0;

      let mintedAsset = [];
      if (memoryCache.get(`credential-${config.policy.id}`) !== undefined) {
        mintedAsset = memoryCache.get(`credential-${config.policy.id}`);
      } else {
        mintedAsset = await T.getMintedAssets(config.policy.id, {});
        if (mintedAsset.length > 0) {
          mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
            return asset.onchainMetadata[asset.policyId][asset.assetName].type === "credential";
          }));
        } else {
          return res.json(Response(undefined, {
            reason: errorTypes.SOMETHING_WENT_WRONG,
          }));
        }
        memoryCache.set(`credential-${config.policy.id}`, mintedAsset, 60);
      }

      let owner = config.asset.slice(56);

      if (config.type !== "document") {

        let assetDetail = await T.getAssetDetails(config.asset);
        if (assetDetail && assetDetail.onchainMetadata) {

          const assetName = assetDetail.assetName;
          assetDetail.onchainMetadata = assetDetail.onchainMetadata[config.policy.id];
          assetDetail.onchainMetadata = assetDetail.onchainMetadata[assetName];

          if (assetDetail.onchainMetadata.policy === config.policy.id && assetDetail.onchainMetadata.ttl === config.policy.ttl) {
            currIndex = assetDetail.onchainMetadata.index + 1;
            owner = assetDetail.onchainMetadata.owner;
          } else {
            return res.json(Response(undefined, {
              reason: errorTypes.CONFIG_MISMATCH,
            }));
          }

          mintedAsset = await Promise.all(mintedAsset.filter(async (asset) => {
            return asset.onchainMetadata[asset.policyId][asset.assetName].owner === owner;
          })); 

          if (mintedAsset.length === 0) {
            return res.json(Response(undefined, {
              reason: errorTypes.ONLY_DOCUMENT_CONFIG_IS_ALLOWED_BECAUSE_THIS_DOCUMENT_HAS_NOT_ANY_CREDENTAILS,
            }));
          }

        } else {
          return res.json(Response(undefined, {
            reason: errorTypes.COULD_NOT_FETCH_ASSET_DETAILS_OR_INVALID_NFT_METADATA,
          }));
        }

      }

      let metadata = {
        owner: owner,
        attach: credential,
        index: currIndex,
        type: "credential",
      };

      if (currIndex !== 0) {
        metadata.previous = config.asset.slice(56);
      }

      const { policy, asset } = await T.MintNFT({
        assetName: credential,
        metadata: metadata,
        options: {
          policy: config.policy,
        }
      });

      return res.json(Response({ type: "credential", policy, asset }, undefined));

    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const RevokeCredential = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.RevokeCredential);
    if (bodyValidator.validate()) {
      const { config } = req.body;
      try {
        await T.BurnNFT({
          config: config
        });
        return res.json(Response("SUCCESS", undefined));
      } catch (error) {
        Logger.error(error);
        return res.json(Response(undefined, {
          reason: errorTypes.NFT_BURN_FAILED,
        }));
      }
    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const FetchNFT = async (req, res, next) => {
  try {
    const filterBy = req.body;
    if (filterBy.asset) {
      const response = await core.fetchNFTByAsset(filterBy.asset);
      return res.json(Response(response || {}, undefined));
    } else if (filterBy.policyId) {
      const response = await core.fetchNFTByPolicyId(filterBy.policyId);
      return res.json(Response(response || [], undefined));
    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};

export const VerifySignature = async (req, res, next) => {
  try {
    const bodyValidator = BodyValidator.make().setData(req.body).setRules(RuleValidator.VerifySignature);
    if (bodyValidator.validate()) {
      const { address, payload, signature, key } = req.body;
      const response = core.verifySignature(address, payload, { signature, key });
      return res.json(Response(response, undefined));
    } else {
      return res.json(Response(undefined, {
        reason: errorTypes.INVALID_BODY,
        data: bodyValidator.errors().all(),
      }));
    }
  } catch (error) {
    Logger.error(error);
    return res.json(Response(undefined, error));
  }
};