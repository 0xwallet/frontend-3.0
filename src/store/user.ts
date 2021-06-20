import { useLocalStorage } from "@vueuse/core";
import { Wallet, ClassWallet, classMultiClient } from "nkn";
import { pick, assign } from "lodash-es";
import { defineStore } from "pinia";
import { getMultiClient } from "@/apollo/nknData";
import { toRaw } from "vue";
import { apiNknOnline, CommonRes } from "@/apollo/api";
import { Channel, Socket } from "phoenix";
const userLocalStorage = useLocalStorage<UserBaseState | Record<string, never>>(
  "user",
  {}
);
// console.log("user-store里的", userLocalStorage, toRaw(userLocalStorage.value));
type UserBaseState = {
  id: string;
  token: string;
  username: string;
  email: string;
};
type UserState = UserBaseState & {
  wallet: null | ClassWallet; // wallet
  multiClient: null | classMultiClient;
  socket: null | Socket;
  channel: null | Channel;
};
export default defineStore({
  id: "user",
  state: (): UserState => ({
    id: "",
    token: "",
    username: "",
    email: "",
    wallet: null, // wallet
    multiClient: null,
    socket: null,
    channel: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    signInAndSetTokenIdEmail(payLoad: UserBaseState) {
      if (!payLoad.token) throw Error("token为空");
      assign(this, payLoad);
      userLocalStorage.value = pick(this, ["id", "token", "username", "email"]);
    },
    /** 全流程请求式登录 token wallet client */
    async signInFullPath(payLoad: UserBaseState): CommonRes<UserBaseState> {
      this.signInAndSetTokenIdEmail(payLoad);
      this.setWallet();
      const [resNknOnline, err2] = await apiNknOnline();
      if (err2) return [undefined, err2];
      this.setMultiClient();
      console.log(["apiNknOnline-success"], resNknOnline);
      this.setSocket();
      return [pick(this, ["id", "token", "username", "email"]), undefined];
    },
    /** 从本地存储中登录 */
    async signInWithLocalStorage(): CommonRes<UserBaseState> {
      const storageUser = toRaw(userLocalStorage.value);
      // token 可能 undefined
      if (!storageUser.token)
        return [undefined, Error("存储里的user没有token")];
      this.signInAndSetTokenIdEmail(
        pick(storageUser, ["id", "token", "username", "email"])
      );
      this.setWallet();
      const [res, err] = await apiNknOnline();
      if (err) return [undefined, err];
      this.setMultiClient();
      this.setSocket();
      return [pick(this, ["id", "token", "username", "email"]), undefined];
    },
    // TODO 假如登录过期了 要调用这个方法先清除
    signOutAndClear() {
      this.id = "";
      this.token = "";
      this.username = "";
      this.email = "";
      this.wallet = null;
      this.multiClient = null;
      this.channel = null;
      this.socket = null;
      userLocalStorage.value = {};
    },
    setWallet() {
      if (!this.wallet) {
        this.wallet = new Wallet({ password: this.email });
        console.log("[Ready wallet]", this);
      }
    },
    setMultiClient() {
      if (!this.wallet) throw Error("wallet 未初始化");
      if (!this.multiClient) {
        this.multiClient = getMultiClient(this.wallet);
        console.log("[Ready multiClient]", this.multiClient);
      }
    },
    setSocket() {
      if (!this.token) throw Error("no token");
      if (this.socket) return;
      this.socket = new Socket("wss://owaf.io/socket", {
        params: () => ({ Authorization: "Bearer " + this.token }),
      });
      this.socket.connect();
      this.channel = this.socket.channel(`drive:user_${this.id}`, {});
      // 要通过监听这个去了解是否传达?
      this.channel.on("file_uploaded", (file) => {
        console.log("[file uploaded]", file);
      });
      this.channel
        .join()
        .receive("ok", (resp) => {
          console.log("[Ready] join socket channel", resp);
        })
        .receive("error", console.error);
    },
  },
});
