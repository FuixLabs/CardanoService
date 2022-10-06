import * as dotenv from "dotenv";
dotenv.config();

import * as BIP39 from "bip39";

import { C as CardanoWasm } from "lucid-cardano";

export const getCurrentAccount = (mnemonic = process.env.MNEMONIC || "Something went wrong") => {
  const entropy = BIP39.mnemonicToEntropy(mnemonic);
  const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, "hex"),
    Buffer.from(""),
  );

  const harden = (num) => { return 0x80000000 + num; }

  const accountKey = rootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0));
  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  const stakeKey = accountKey.derive(2).derive(0).to_raw_key();

  const publicKey = Buffer.from(accountKey.to_public().as_bytes()).toString("hex"); // BIP32 Public Key
  const paymentKeyPub = paymentKey.to_public();
  const stakeKeyPub = stakeKey.to_public();

  const paymentKeyHash = Buffer.from(paymentKeyPub.hash().to_bytes(), "hex").toString("hex");
  const stakeKeyHash = Buffer.from(stakeKeyPub.hash().to_bytes(), "hex").toString("hex");

  // Base address with Staking Key
  const paymentAddr = CardanoWasm.BaseAddress.new(
    process.env.CARDANO_NETWORK == 0 ? CardanoWasm.NetworkInfo.testnet().network_id() : CardanoWasm.NetworkInfo.mainnet().network_id(),
    CardanoWasm.StakeCredential.from_keyhash(paymentKeyPub.hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakeKeyPub.hash()),
  ).to_address().to_bech32();

  // Enterprise address without staking ability, for use by exchanges/etc
  const enterpriseAddr = CardanoWasm.EnterpriseAddress.new(
    process.env.CARDANO_NETWORK == 0 ? CardanoWasm.NetworkInfo.testnet().network_id() : CardanoWasm.NetworkInfo.mainnet().network_id(),
    CardanoWasm.StakeCredential.from_keyhash(paymentKeyPub.hash()),
  ).to_address().to_bech32();

  return {
    rootKey: rootKey,
    accountKey: accountKey,
    paymentKey: paymentKey,
    paymentKeyPub: paymentKeyPub,
    paymentKeyHash: paymentKeyHash,
    stakeKey: stakeKey,
    paymentAddr: paymentAddr,
    enterpriseAddr: enterpriseAddr,
  };
};