import * as A from "./account";
import * as L from "./lucid";
import { C as CardanoWasm } from "lucid-cardano";
import CardanoMS from "@emurgo/cardano-message-signing-nodejs";

import Logger from "../Logger";

import { errorTypes } from "./error.types";

export const createLockingPolicyScript = () => {
  const timeToLive = L.lucid.utils.unixTimeToSlot(new Date()) + 3153600000;
  const { paymentKeyPub } = A.getCurrentAccount();
  const nativeScripts = CardanoWasm.NativeScripts.new();
  const scriptPubkey = CardanoWasm.ScriptPubkey.new(
    CardanoWasm.Ed25519KeyHash.from_bytes(
      paymentKeyPub.hash().to_bytes()
    )
  );
  const nativeScript = CardanoWasm.NativeScript.new_script_pubkey(scriptPubkey);
  const lockScript = CardanoWasm.NativeScript.new_timelock_expiry(
    CardanoWasm.TimelockExpiry.new(CardanoWasm.BigNum.from_str(timeToLive.toString()))
  );
  nativeScripts.add(nativeScript);
  nativeScripts.add(lockScript);
  const finalScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(nativeScripts));
  const policyId = Buffer.from(CardanoWasm.ScriptHash.from_bytes(finalScript.hash().to_bytes()).to_bytes(), "hex").toString("hex");
  return { type: "Native", id: policyId, script: finalScript, ttl: timeToLive };
}

export const signData = async (payload) => {
  let { paymentKey, stakeKey, enterpriseAddr } = A.getCurrentAccount();
  const accountKey = true ? paymentKey : stakeKey;
  const publicKey = accountKey.to_public();
  const protectedHeaders = CardanoMS.HeaderMap.new();
  protectedHeaders.set_algorithm_id(
    CardanoMS.Label.from_algorithm_id(CardanoMS.AlgorithmId.EdDSA)
  );
  protectedHeaders.set_header(
    CardanoMS.Label.new_text("address"),
    CardanoMS.CBORValue.new_bytes(Buffer.from(enterpriseAddr, "hex"))
  );
  const protectedSerialized = CardanoMS.ProtectedHeaderMap.new(protectedHeaders);
  const unprotectedHeaders = CardanoMS.HeaderMap.new();
  const headers = CardanoMS.Headers.new(
    protectedSerialized,
    unprotectedHeaders
  );
  const builder = CardanoMS.COSESign1Builder.new(
    headers,
    Buffer.from(payload, "hex"),
    false
  );
  const toSign = builder.make_data_to_sign().to_bytes();
  const signedSigStruc = accountKey.sign(toSign).to_bytes();
  const coseSign1 = builder.build(signedSigStruc);

  stakeKey.free();
  stakeKey = null;
  paymentKey.free();
  paymentKey = null;
  
  const key = CardanoMS.COSEKey.new(
    CardanoMS.Label.from_key_type(CardanoMS.KeyType.OKP)
  );
  key.set_algorithm_id(
    CardanoMS.Label.from_algorithm_id(CardanoMS.AlgorithmId.EdDSA)
  );
  key.set_header(
    CardanoMS.Label.new_int(
      CardanoMS.Int.new_negative(CardanoMS.BigNum.from_str("1"))
    ),
    CardanoMS.CBORValue.new_int(
      CardanoMS.Int.new_i32(6) // CardanoMS.CurveType.Ed25519
    )
  ); // crv (-1) set to Ed25519 (6)
  key.set_header(
    CardanoMS.Label.new_int(
      CardanoMS.Int.new_negative(CardanoMS.BigNum.from_str("2"))
    ),
    CardanoMS.CBORValue.new_bytes(publicKey.as_bytes())
  ); // x (-2) set to Public Key

  return {
    signature: Buffer.from(coseSign1.to_bytes()).toString("hex"),
    key: Buffer.from(key.to_bytes()).toString("hex"),
  };
}

export const verifyData = (address, payload, { signature, key }) => {

  const verifyPayload = (_payload, _payloadCose) => {
    return Buffer.from(_payloadCose, "hex").compare(Buffer.from(_payload, "hex")) === 0;
  };

  const verifyAddress = (_address, _addressCose, _publicKeyCose) => {
    const _checkAddress = CardanoWasm.Address.from_bytes(Buffer.from(_address, "hex"));
    if (_addressCose.to_bech32() !== _checkAddress.to_bech32()) {
      return false;
    }
    try {
      const baseAddress = CardanoWasm.BaseAddress.from_address(_addressCose);
      const paymentKeyHash = _publicKeyCose.hash();
      const stakeKeyHash = baseAddress.stake_cred().to_keyhash();
      const reconstructedPaymentAddress = CardanoWasm.BaseAddress.new(
        _checkAddress.network_id(),
        CardanoWasm.StakeCredential.from_keyhash(paymentKeyHash),
        CardanoWasm.StakeCredential.from_keyhash(stakeKeyHash)
      );
      if (_checkAddress.to_bech32() !== reconstructedPaymentAddress.to_address().to_bech32()) {
        const reconstructedEnterpriseAddress = CardanoWasm.EnterpriseAddress.new(
          _checkAddress.network_id(),
          CardanoWasm.StakeCredential.from_keyhash(paymentKeyHash),
        );
        if (_checkAddress.to_bech32() !== reconstructedEnterpriseAddress.to_address().to_bech32()) {
          return false;
        }
      }
      return true;
    } catch (error) {
      Logger.error(error);
    }
    return false;
  };

  const coseSign1 = CardanoMS.COSESign1.from_bytes(Buffer.from(signature, "hex"));
  const payloadCose = coseSign1.payload();

  if (!verifyPayload(payload, payloadCose)) {
    throw new Error(errorTypes.PAYLOAD_DOES_NOT_MATCH);
  }
  
  const protectedHeaders = coseSign1.headers().protected().deserialized_headers();
  const addressCose = CardanoWasm.Address.from_bytes(
    protectedHeaders.header(CardanoMS.Label.new_text("address")).as_bytes()
  );
  const _key = CardanoMS.COSEKey.from_bytes(Buffer.from(key, "hex"));
  const publicKeyBytes = _key
    .header(
      CardanoMS.Label.new_int(
        CardanoMS.Int.new_negative(
          CardanoMS.BigNum.from_str("2")
        )
      )
    ).as_bytes();
  const publicKeyCose = CardanoWasm.PublicKey.from_bytes(publicKeyBytes);
  
  if (!verifyAddress(address, addressCose, publicKeyCose)) {
    throw new Error(errorTypes.COULD_NOT_VERIFY_BECAUSE_OF_ADDRESS_MISMATCH);
  }
  
  const _signature = CardanoWasm.Ed25519Signature.from_bytes(coseSign1.signature());
  const data = coseSign1.signed_data().to_bytes();
  return publicKeyCose.verify(data, _signature);
};