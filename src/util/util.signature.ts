import { verifyPersonalMessage } from '@mysten/sui.js/verify';
import * as bs58 from 'bs58';
import { isEqual } from 'lodash';
import { Network } from 'src/common/common.enum';
import * as nacl from 'tweetnacl';

export const verifyMessageSignature = async (
  network: Network,
  message: string,
  signature: string,
  walletAddress: string,
): Promise<boolean> => {
  if (isEqual(network, Network.SOLANA)) {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(walletAddress),
    );
  } else if (isEqual(network, Network.SUI)) {
    const publicKey = await verifyPersonalMessage(
      new TextEncoder().encode(message),
      signature,
    );
    return publicKey.toSuiAddress() === walletAddress;
  }

  return false;
};
