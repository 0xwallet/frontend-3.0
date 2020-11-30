import { useScript } from '/@/hooks/web/useScript';

export const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);
export let wallet: any = null;
export let session: any = null;
const numSubClients = 4;
export async function useMClient(): Promise<any> {
  if (session) return session;
  try {
    if (!wallet) return;
    const seed = wallet.getSeed();
    const NKN: any = await useNKN();
    let disk = new NKN.MultiClient({
      seed,
      numSubClients,
    });
    await new Promise((resolve) => disk.onConnect(resolve));
    session = await disk.dial(
      'file.33ed3f20f423dfa816ebd8c33f05523170b7ba86a78d5b39365bfb57db443f6c'
    );
    console.log('session ready');
    return session;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export function useWallet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (wallet) resolve(wallet);
    const password = localStorage.getItem('walletPassword');
    const json = localStorage.getItem('walletJson');
    if (json === 'undefined' || json === 'null' || json === '') {
      reject('no wallJson');
      return;
    }
    if (password === 'undefined' || password === 'null' || password === '') {
      reject('no walletPassword');
      return;
    }
    useNKN().then((nkn: any) => {
      wallet = nkn.Wallet.fromJSON(json, { password });
      resolve(wallet);
    });
  });
}

export async function initJS() {
  // 加载nkn.JS
  const { toPromise: loadNKN } = useScript({
    src: `./resource/nkn/nkn.min.js`,
  });

  loadNKN().then(() => {
    console.log('NKN加载成功');
  });
}

// 循环获取NKN.JS
export function useNKN() {
  return new Promise((resolve) => {
    let t = setInterval(() => {
      const global = getGlobal();
      if (global && global.nkn) {
        clearInterval(t);
        resolve(global.nkn);
      }
    }, 100);
  });
}
