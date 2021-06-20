import { ClassWallet, MultiClient, TSession } from "nkn";
import dayjs from "dayjs";
import { useDelay } from "@/hooks";
import { message } from "ant-design-vue";
import { useUserStore } from "@/store";

const NKN_CONFIG = {
  numSubClients: 4,
  sessionConfig: { mtu: 16000 },
};

/** 返回 nkn MultiClient */
export function getMultiClient(wallet: ClassWallet) {
  return new MultiClient({
    seed: wallet.getSeed(),
    identifier: dayjs(),
    ...NKN_CONFIG,
  });
}

// session 临时性比较强,所以放在局部变量
let clientSession: TSession | null = null;
let isFetchingSession = false; // 竞争锁
/** 获取session */
export async function getClientSession() {
  if (!isFetchingSession) return getClientSessionImpl();
  while (isFetchingSession) {
    await useDelay(500);
  }
  return clientSession ?? null;
}

async function getClientSessionImpl(): Promise<TSession> {
  if (clientSession && !clientSession.isClosed) return clientSession;
  const { multiClient } = useUserStore();
  if (!multiClient) throw Error("multiClient未初始化!");
  isFetchingSession = true;
  const hide = message.loading("连接服务器中...", 0);
  // 间隔1秒,重试100次 获取session
  async function retryDialSession(retryCounter = 100): Promise<TSession> {
    let res;
    const once = () =>
      new Promise<void>((resolve) => {
        // console.count('once');
        multiClient
          ?.dial(
            "file-jpgkdpid.5281e9f852705a509b748414148a9909a2e30ec860b3bf6ac0633c39d88613bf"
          )
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
    return (
      res ??
      Promise.reject(
        `dial session failed, retryCount: ${10 - 1 - retryCounter}`
      )
    );
  }
  console.time("[性能] nkn-client-session握手时间");
  clientSession = await retryDialSession();
  hide();
  isFetchingSession = false;
  console.timeEnd("[性能] nkn-client-session握手时间");
  return clientSession;
}
