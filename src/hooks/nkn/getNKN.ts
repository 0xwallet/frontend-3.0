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
    console.log(seed);
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
  if (wallet) return wallet;
  return new Promise((resolve, reject) => {
    const password = localStorage.getItem('walletPassword');
    const json = localStorage.getItem('walletJson');
    if (!json) {
      reject('no walletJson');
    }
    if (!password) {
      reject('no walletPassword');
    }

    if (!wallet) {
      console.log('恢复wallet');
      useNKN().then((nkn: any) => {
        wallet = nkn.Wallet.fromJSON(json, { password });
        resolve(wallet);
      });
    }
  });
}

export async function initJS() {
  // 加载nkn.JS
  const { toPromise: loadNKN } = useScript({
    src: `./resource/nkn/nkn.js`,
  });
  // 加载crypto-js
  const { toPromise: loadCrypto } = useScript({
    src: `./resource/crypto-js/crypto-js.js`,
  });

  loadNKN().then(() => {
    console.log('NKN加载成功');
  });
  loadCrypto().then(() => {
    console.log('crypto加载成功');
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

// 循环获取Crypto-js
export function useCrypto() {
  return new Promise((resolve) => {
    let t = setInterval(() => {
      const global = getGlobal();
      if (global && global.CryptoJS) {
        clearInterval(t);
        resolve(global.CryptoJS);
      }
    }, 100);
  });
}

// // 循环获取Crypto-js
// export function getProto() {
//   return new Promise((resolve) => {
//     let t = setInterval(() => {
//       const global = getGlobal();
//       if (global && global.proto) {
//         clearInterval(t);
//         resolve(global.proto);
//       }
//     }, 100);
//   });
// }
