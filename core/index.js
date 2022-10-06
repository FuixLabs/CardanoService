import * as T from "./transaction";
import * as W from "./wallet";

export const fetchNFTByAsset = async (asset) => {
  const response = await T.getAssetDetails(asset);
  return response || {};
};

export const fetchNFTByPolicyId = async (policyId) => {
  const response = await T.getMintedAssets(policyId, {});
  return response || [];
};

export const verifySignature = (address, payload, { signature, key }) => {
  const response = W.verifyData(address, payload, { signature, key });
  return response;
};