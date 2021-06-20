import { Session } from "../@types/apolloType";
import { encode } from "@msgpack/msgpack";
import { useUserStore } from "@/store";
import { getClientSession } from "./nknData";
import { useApollo } from "./action";
import {
  me,
  nknOnline,
  resetPassword,
  sendLoginCode,
  sendVerifyCode,
  signIn,
  signUp,
  Basic,
} from "./document";

export type CommonRes<T> = Promise<
  [res: T | undefined, err: Error | undefined]
>;
type TApiFn<T, R> = (params?: T) => CommonRes<R>;

// TAG : 封装一些 api
type ParamsEmailLogin = {
  email: string;
  password: string;
};
type ResponseEmailLogin = {
  data: {
    signin: Session;
  };
};

/** 邮箱登录 */
export const apiEmailLogin: TApiFn<ParamsEmailLogin, ResponseEmailLogin> =
  async (params) => {
    let res, err;
    try {
      res = await useApollo<ResponseEmailLogin>({
        mode: "mutate",
        gql: signIn,
        variables: {
          ...params,
          code: "", // TODO 原来的代码拷贝过来的 不知道为啥要空字符串
        },
      });
    } catch (error) {
      err = error;
    }
    return [res, err];
  };

type ResponseNknOnline = {
  data: {
    nknOnline: string;
  };
};
/** nkn 登录获取 */
export const apiNknOnline: TApiFn<undefined, ResponseNknOnline> = async () => {
  let res, err;
  try {
    const { wallet } = useUserStore();
    res = await useApollo<ResponseNknOnline>({
      mode: "mutate",
      gql: nknOnline,
      variables: { nknPublicKey: wallet?.getPublicKey() },
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSendCaptcha = {
  email: string;
};
type ResponseSendCaptcha = {
  data: {
    sendLoginCode: string;
  };
};
/** 发送登录邮箱验证码 */
export const apiSendSignInEmailCaptcha: TApiFn<
  ParamsSendCaptcha,
  ResponseSendCaptcha
> = async (params) => {
  let res, err;
  try {
    res = await useApollo<ResponseSendCaptcha>({
      mode: "mutate",
      gql: sendLoginCode,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSendSignUpEmailCaptcha = {
  email?: string;
  type: string;
  nkn?: string;
};
type ResponseSendSignUpEmailCaptcha = {
  data: {
    sendLoginCode: string;
  };
};
/** 发送注册邮箱验证码 */
export const apiSendSignUpEmailCaptcha: TApiFn<
  ParamsSendSignUpEmailCaptcha,
  ResponseSendSignUpEmailCaptcha
> = async (params = { type: "ACTIVE_EMAIL" }) => {
  let res, err;
  try {
    res = await useApollo<ResponseSendSignUpEmailCaptcha>({
      mode: "mutate",
      gql: sendVerifyCode,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsSignUp = {
  email: string;
  password: string;
  code: string;
  username: string;
  nknPublicKey: string;
};
type ResponseSignUp = {
  data: {
    msg: string;
  };
};
/** 用户注册 */
export const apiSignUp: TApiFn<ParamsSignUp, ResponseSignUp> = async (
  params
) => {
  let res, err;
  try {
    res = await useApollo<ResponseSignUp>({
      mode: "mutate",
      gql: signUp,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsResetPwd = {
  email: string;
  newPassword: string;
  code: string;
  nknPublicKey: string;
};
type ResponseResetPwd = {
  data: {
    msg: string;
  };
};
/** 用户重置密码 */
export const apiResetPwd: TApiFn<ParamsResetPwd, ResponseResetPwd> = async (
  params
) => {
  let res, err;
  try {
    res = await useApollo<ResponseResetPwd>({
      mode: "mutate",
      gql: resetPassword,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ResponseQureyMe = {
  // TODO
  avatar: null | string;
  email: string;
  id: string;
  messageNknAddress: string;
  username: string;
  wallets: {
    id: string;
    info: {
      publicKey: null | string;
    };
    tags: string[];
  }[];
  // ...
};
// TODO 头像
/** 查询用户信息 */
export const apiQueryMe: TApiFn<undefined, ResponseQureyMe> = async () => {
  let res, err;
  try {
    res = await useApollo<ResponseQureyMe>({
      mode: "query",
      gql: me,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsQueryFileByDir = {
  dirId: string;
};
export type TFileItem = {
  fullName: string[];
  hash: null | string;
  id: string;
  info: { description: null | string; size: null };
  insertedAt: null | string;
  isDir: boolean;
  isShared: boolean;
  space: string;
  updatedAt: null | string;
  fileType?: string;
  user: {
    id: string;
    driveSetting: {
      availableSpace: string;
      totalSpace: string;
      usedSpace: string;
    };
  };
};
export type TFileList = (TFileItem | null)[];

type ResponseQueryFileByDir = {
  data: {
    driveListFiles: TFileList;
  };
  loading: boolean;
  networkStatus: number;
};
/** 网盘-查询我的文件 */
export const apiQueryFileByDir: TApiFn<
  ParamsQueryFileByDir,
  ResponseQueryFileByDir
> = async (params) => {
  let res, err;
  try {
    res = await useApollo<ResponseQueryFileByDir>({
      mode: "query",
      gql: Basic.FileList,
      variables: params,
    });
  } catch (error) {
    err = error;
  }
  return [res, err];
};

type ParamsUploadSingle = {
  // file: File;
  File: Uint8Array;
  FullName: string[];
  FileSize: number;
  UserId: string;
  Space: "PRIVATE" | "PUBLIC";
  Description: string;
  Action: "drive";
};
type ResponseUploadSingle = {
  data: string;
};
/** 上传单个文件 */
export const apiUploadSingle: TApiFn<ParamsUploadSingle, ResponseUploadSingle> =
  async (params) => {
    if (!params) return [undefined, Error("noparams")];
    // const { file } = params;
    const clientSession = await getClientSession();
    if (!clientSession) return [undefined, Error("no clientSession")];

    const writeChunkSize = 1024;
    const encoded: Uint8Array = encode(params);
    // 写入头部信息
    const buffer = new ArrayBuffer(4);
    const dv = new DataView(buffer);
    dv.setUint32(0, encoded.length, true);
    await clientSession.write(new Uint8Array(buffer));
    //
    // 创建 ReadableStream
    const uploadStream = new ReadableStream({
      start(controller) {
        let buf!: Uint8Array;
        for (let n = 0; n < encoded.length; n += buf.length) {
          buf = new Uint8Array(Math.min(encoded.length - n, writeChunkSize));
          for (let i = 0; i < buf.length; i++) {
            buf[i] = encoded[i + n];
          }
          controller.enqueue(buf);
        }
        controller.close();
      },
      cancel() {
        console.log("cancel");
      },
    });
    console.log(
      `Start sending ${params.FullName[0]} (${params.FileSize} bytes) to ${clientSession.remoteAddr}`
    );
    const sessionStream = clientSession.getWritableStream(true);
    const timeStart = Date.now();

    let res, err;
    try {
      res = (await uploadStream.pipeTo(
        sessionStream
      )) as unknown as ResponseUploadSingle;
      console.log(
        `Finish sending file ${params.FullName[0]} (${params.FileSize} bytes, ${
          (params.FileSize / (1 << 20) / (Date.now() - timeStart)) * 1000
        } MB/s)`
      );
    } catch (error) {
      console.error(error);
      err = error;
    }
    return [res, err];
  };
