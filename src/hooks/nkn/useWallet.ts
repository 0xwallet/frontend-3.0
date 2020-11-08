import { setItem } from 'localforage';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { Wallet } from 'nkn-sdk';
// const { Wallet } = require('');
type WalletType = Wallet | null;

let wallet: WalletType = null;

function initWallet (_wallet: WalletType) {
  if (!wallet) {
    wallet = _wallet;
  }
}

function createWallet ({ email, password }: { email: string; password: string}): { nknEncryptedWallet?: string; nknPublicKey?: string } {
  if (!email || !password || wallet) {
    return {};
  }
  const secret = Base64.stringify(hmacSHA512(email, password));
  wallet = new Wallet({ password: secret });
  const walletJson = JSON.stringify(wallet);
  setItem('wallet', { walletJson, password: secret }, () => {
    initWallet(wallet);
  });
  return { nknEncryptedWallet: walletJson, nknPublicKey: wallet.getPublicKey() };
}

export {
  initWallet,
  createWallet
};