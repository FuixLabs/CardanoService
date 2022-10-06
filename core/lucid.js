import * as dotenv from "dotenv";
dotenv.config();

import { Lucid, Blockfrost } from "lucid-cardano";

import * as A from "./account";

import Logger from "../Logger";

const lucid = await Lucid.new(
  new Blockfrost(
    process.env.CARDANO_NETWORK == 0 ? "https://cardano-testnet.blockfrost.io/api/v0" : "https://cardano-mainnet.blockfrost.io/api/v0",
    process.env.BLOCKFROST_APIKEY,
  ),
  process.env.CARDANO_NETWORK == 0 ? "Testnet" : "Mainnet",
);

lucid.selectWalletFromPrivateKey(A.getCurrentAccount().paymentKey.to_bech32());

Logger.info(lucid);

try {

  Logger.info(await lucid.wallet.getUtxos());

  Logger.info(await lucid.wallet.address());

} catch (error) {

  Logger.error(error);

}

export { lucid };