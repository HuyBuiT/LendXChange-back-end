import { verifyPersonalMessage } from '@mysten/sui.js/verify';
import { Network } from 'src/common/common.enum';

export const verifyMessageSignature = async (
  network: Network,
  message: string,
  signature: string,
  walletAddress: string,
): Promise<boolean> => {
  const publicKey = await verifyPersonalMessage(
    new TextEncoder().encode(message),
    signature,
  );
  return publicKey.toSuiAddress() === walletAddress;
};
