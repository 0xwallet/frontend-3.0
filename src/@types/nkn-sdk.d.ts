// declare module "nkn-sdk" { // 这种是 import {..} from "nkn-sdk" 的方法
declare module "nkn" {
  // 这种是 import {..} from "nkn-sdk" 的方法
  // declare namespace nkn {
  class CacheClass<K, V> {
    put(
      key: K,
      value: V,
      time?: number,
      timeoutCallback?: (key: K, value: V) => void
    ): V;
    get(key: K): V | null;
    del(key: K): void;
    clear(): void;

    size(): number;
    memsize(): number;

    debug(bool: boolean): void;
    hits(): number;
    misses(): number;
    keys(): K[];
  }
  type defaultOptions = {
    reconnectIntervalMin: number;
    reconnectIntervalMax: number;
    responseTimeout: number;
    msgHoldingSeconds: number;
    encrypt: boolean;
    rpcServerAddr: string;
    worker: boolean;
  };
  type Key = {
    seed: string;
    publicKey: string;
    privateKey: string;
    curvePrivateKey: string;
    // sharedKeyCache;
    // worker;
    // workerMsgID;
    // workerMsgCache;
  };
  export class ClassWallet {
    constructor({ password: string });
    toJSON(): string;
    getPublicKey(): string;
    getSeed(): string;
    fromJSON(json: string, { password: string }): ClassWallet;
    account: {
      key: Key;
      signatureRedeem: string;
      programHash: string;
      address: string;
      contract: string;
    };
    // iv;
    masterKey: string;
    address: string;
    programHash: string;
    // seedEncrypted;
    // scryptParams;
    version: string;
    options: {
      rpcServerAddr: string;
      worker: boolean;
    };
  }
  export class classNknClient {
    constructor();
    options: defaultOptions;
    key: Key;
    identifier: string;
    addr: string;
    eventListeners: {
      connect: unknown[];
      message: unknown[];
    };
    sigChainBlockHash: string | null;
    shouldReconnect: boolean;
    reconnectInterval: number;
    responseManager: {
      timer: number | null;
      responseProcessors: Map<any, any>;
    };
    ws: WebSocket | null;
    node: {
      addr: string;
      rpcAddr: string;
    } | null;
    isReady: boolean;
    isClosed: boolean;
    wallet: ClassWallet;
  }

  export class classMultiClient {
    constructor();
    dial(id: string): Promise<TSession>;
    clients: {
      [key: string]: classNknClient;
    };
    defaultClient: classNknClient;
    msgCache: typeof CacheClass;
    acceptAddrs: string[];
    sessions: Map<string, any>;
    options: defaultOptions;
    key: Key;
    identifier: string;
    addr: string;
    eventListeners: {
      connect: unknown[];
      message: unknown[];
    };
    isReady: boolean;
    isClosed: boolean;
  }

  interface InewClassWallet {
    // ...
    new ({ password: string }): ClassWallet;
  }
  interface InewClassMultiClient {
    new ({
      seed: string,
      numSubClients: number,
      sessionConfig: { mtu: number },
      identifier: string,
    }): classMultiClient;
  }
  export type TSession = {
    isClosed: boolean;
    remoteAddr: string;
    write(ArrayBuffer): Promise<void>;
    getWritableStream(boolean): WritableStream;
  };
  type Tnkn = {
    // setPRNG: string;
    ready: Promise<void>;
    Client: classNknClient;
    MultiClient: InewClassMultiClient;
    Wallet: InewClassWallet;
  };
  var nkn: Tnkn;
  // export var setPRNG = nkn.setPRNG;
  export var ready = nkn.ready;
  export var Client = nkn.Client;
  export var MultiClient = nkn.MultiClient;
  export var Wallet = nkn.Wallet;
  export default nkn;
}
