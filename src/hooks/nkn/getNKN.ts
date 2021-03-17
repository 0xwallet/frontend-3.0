import { useScript } from '/@/hooks/web/useScript';
import dayjs from 'dayjs';
import {useApollo} from "/@/hooks/apollo/apollo";
import {nknOnline} from "/@/hooks/apollo/gqlUser";
export const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);
export let wallet: any = null;
export let NknClient: [] = [];
export let disk: any = null;
export let session: any = null;
const numSubClients = 4;
const sessionConfig = { mtu: 16000 };
export async function useMClient(): Promise<any> {
  if (disk) return disk;
  try {
    if (!wallet) return;
    const seed = wallet.getSeed();
    const NKN: any = await useNKN();
    disk = new NKN.MultiClient({
      seed,
      numSubClients,
      sessionConfig,
      identifier: dayjs(),
    });
    await new Promise((resolve) => disk.onConnect(resolve));
    console.log('nkn ready');
    return disk;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export async function useSession(): Promise<any> {
  if (session && !session.isClosed) return session;
  try {
    const disk = await useMClient();
    session = await disk.dial(
      'file-jpgkdpid.5281e9f852705a509b748414148a9909a2e30ec860b3bf6ac0633c39d88613bf'
    );
    setInterval(() => {
      NknClient = disk.readyClientIDs();
    }, 1000);

    console.log('session ready');
    // console.log(session);
    return session;
  } catch (e) {
    console.log(e);
  }
  return null;
}

export function closeSession() {
  if (session && session.isClosed) session.close();
}

export function useWallet(email:string='',): Promise<any> {
  return new Promise((resolve,reject) => {
    if (wallet) resolve(wallet);
    const json = localStorage.getItem('walletJson');
    const e = localStorage.getItem('walletEmail');
    if (json&&e){
      useNKN().then((nkn: any) => {
        wallet = nkn.Wallet.fromJSON(json, {password:e });
        resolve(wallet);
      });
      return
    }
    if(email==''){
      // userStore.logout(true);
      reject('no wallJson');
      return;
    }
    resolve(newWallet(email))
  });
}

export function newWallet(email: string,online:boolean=true): Promise<{ json: string; publicKey: string }> {
  return new Promise((resolve, reject) => {
    useNKN()
      .then((nkn) => {
        wallet = new nkn.Wallet({ password: email });
        if(online){
          useApollo({mode:'mutate',gql:nknOnline,variables:{nknPublicKey:wallet.getPublicKey()}}).then(()=>{
            localStorage.setItem('walletEmail', email);
            localStorage.setItem('walletJson', JSON.stringify(wallet.toJSON()));

          })
        }

        resolve({ json: JSON.stringify(wallet.toJSON()), publicKey: wallet.getPublicKey() });
      })
      .catch((err) => reject(err));
  });
}

export function saveWallet(params: { email: string;  walletJson: string }) {
    localStorage.setItem('walletEmail', params.email);
    localStorage.setItem('walletJson', params.walletJson);
}



export function initJS() {
  // 加载nkn.JS
  useScript({
    src: `./resource/build/pdf.js`,
  });
  useScript({
    src: `./resource/nkn/nkn.min.js`,
  });
}

// 循环获取NKN.JS
export function useNKN(): Promise<any> {
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

export function usePdf(): Promise<any> {
  return new Promise((resolve) => {
    setInterval(() => {
      const global = getGlobal();
      if (global && global.pdfjsLib) {
        clearInterval();
        resolve(global.pdfjsLib);
      }
    }, 100);
  });
}
