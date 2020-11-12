import type { App } from 'vue';
import { getItem } from 'localforage';
import { WalletInfo } from '@/types/nkn-sdk/wallet';
import { initWallet } from '@/hooks/nkn/useWallet';
import { Wallet } from 'nkn-sdk';

async function install () {
  const walletInfo: WalletInfo | null = await getItem('wallet');
  if (walletInfo) {
    const wallet = await Wallet.fromJSON(walletInfo.walletJson, { password: walletInfo.secret, async: true });
    initWallet(wallet);
  }
}

export default { install };