import { useScript } from '/@/hooks/web/useScript';
import dayjs from 'dayjs';
import { useApollo } from '/@/hooks/apollo/apollo';
import { nknOnline } from '/@/hooks/apollo/gqlUser';
import { ref, watch } from 'vue';
export const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);
export let wallet: any = null;
// export let NknClient: [] = [];
export let NknClient = ref(0)
export let disk: any = null;
export let session: any = null;
const numSubClients = 4;
const sessionConfig = { mtu: 16000 };
import { useMessage } from '/@/hooks/web/useMessage';
import { useDelay } from '/@/hooks/web/useDelay';
const { createMessage } = useMessage();
export async function useMClient(): Promise<any> {
  if (disk) {
    return disk;
  }
  if (!wallet) {
    wallet = await useWallet();
  }
  const seed = wallet.getSeed();
  const nkn = await useNKN();

  disk = new nkn.MultiClient({
    seed,
    numSubClients,
    sessionConfig,
    identifier: dayjs(),
  });
  new Promise<void>((resolve) =>
    disk.onConnect(() => {
      watch(
        () => disk,
        (v) => {
          NknClient.value = v.readyClientIDs().length;
          // console.log('NknClient.value------',NknClient.value,NknClient)
        },
        {
          immediate: true,
          deep: true,
        }
      );
      resolve();
    })
  );

  // setInterval(() => {
  //   NknClient = disk.readyClientIDs();
  // }, 1000);
  console.log('[Ready] nkn.MultiClient', disk);
  return disk;
}

let isFetchingSession = false;
export async function useSessionImpl(): Promise<any> {
  if (session && !session.isClosed) return session;
  try {
    isFetchingSession = true;
    const hide = createMessage.loading('连接服务器中...', 0);
    if (!disk) {
      disk = await useMClient();
    }
    // session = await disk.dial(
    //   'file-jpgkdpid.5281e9f852705a509b748414148a9909a2e30ec860b3bf6ac0633c39d88613bf'
    // );
    // 间隔1秒,重试10次 获取session
    async function retryDialSession(retryCounter = 100) {
      let res;
      const once = () =>
        new Promise<void>((resolve) => {
          // console.count('once');
          disk
            .dial('file-jpgkdpid.5281e9f852705a509b748414148a9909a2e30ec860b3bf6ac0633c39d88613bf')
            .then(
              (r) => {
                res = r;
                resolve();
              },
              (e) => resolve()
            );
        });
      while (!res && retryCounter-- > 0) {
        await once();
        if (!res) await useDelay();
      }
      return res
        ? res
        : Promise.reject(`dial session failed, retryCount: ${10 - 1 - retryCounter}`);
    }
    console.time('[性能] nkn-client-session握手时间');
    session = await retryDialSession();
    hide();
    isFetchingSession = false;
    console.timeEnd('[性能] nkn-client-session握手时间');

    console.log('[Ready] nkn-client-session');
    return session;
  } catch (e) {
    console.error('getSession', e);
    isFetchingSession = false;
  }
  return null;
}

// 并发竞争获取 session,加锁 , 如果正在fetch session 就等待
export async function useSession() {
  if (!isFetchingSession) return useSessionImpl();
  while (isFetchingSession) {
    await useDelay(500);
  }
  return session ?? null;
}

export function closeSession() {
  if (session && session.isClosed) session.close();
}

export function useWallet(email: string = ''): Promise<any> {
  return new Promise((resolve, reject) => {
    // if (wallet) return resolve(wallet);
    // const json = localStorage.getItem('walletJson');
    // const e = localStorage.getItem('walletEmail');
    // if (json && e) {
    //   useNKN().then((nkn: any) => {
    //     wallet = nkn.Wallet.fromJSON(json, { password: e });
    //     return resolve(wallet);
    //   });
    //   return;
    // }
    // if (email == '') {
    //   // userStore.logout(true);
    //   reject('no wallJson');
    //   return;
    // }
    // return resolve(newWallet(email));
    if (wallet) resolve(wallet);
    else {
      const json = localStorage.getItem('walletJson');
      const e = localStorage.getItem('walletEmail');
      // 如果缓存有 email ,拿出来初始化
      // TODO 校验账户是否有效
      if (e && email === '') email = e;
      if (json && e) {
        useNKN().then((nkn: any) => {
          wallet = nkn.Wallet.fromJSON(json, { password: e });
          resolve(wallet);
        });
      } else if (email === '') {
        reject('no walletJson');
      } else {
        resolve(newWallet(email));
      }
    }
  });
}

export function newWallet(
  email: string,
  online: boolean = true
): Promise<{ json: string; publicKey: string }> {
  return new Promise((resolve, reject) => {
    useNKN()
      .then((nkn) => {
        wallet = new nkn.Wallet({ password: email });
        if (online) {
          useApollo({
            mode: 'mutate',
            gql: nknOnline,
            variables: { nknPublicKey: wallet.getPublicKey() },
          }).then(() => {
            localStorage.setItem('walletEmail', email);
            localStorage.setItem('walletJson', JSON.stringify(wallet.toJSON()));
          });
        }

        resolve({ json: JSON.stringify(wallet.toJSON()), publicKey: wallet.getPublicKey() });
      })
      .catch((err) => reject(err));
  });
}

export function saveWallet(params: { email: string; walletJson: string }) {
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
