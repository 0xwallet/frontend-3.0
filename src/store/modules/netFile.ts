import store from '/@/store/index';
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators';
import { hotModuleUnregisterModule } from '/@/utils/helper/vuexHelper';
import {
  FileItem,
  UploadResultStatus,
} from '/@/views/general/metanet/component/Files/upload/types';
import { useMClient } from '/@/hooks/nkn/getNKN';
import { encode } from '@msgpack/msgpack';
import { NetFile } from '/@/components/NetFile/netFile';
import { useApollo } from '/@/hooks/apollo/apollo';
import { driveFindShare } from '/@/hooks/apollo/gqlFile';
import { useMessage } from '/@/hooks/web/useMessage';
import dayjs from 'dayjs';
const { createErrorModal } = useMessage();
const NAME = 'netFileStore';
hotModuleUnregisterModule(NAME);
interface uploadSpeed {
  time: number;
  speed: number;
}
@Module({ namespaced: true, name: NAME, dynamic: true, store })
class netFileStore extends VuexModule {
  // user info
  private uploadList: FileItem[] = [];

  private shareFiles: NetFile[] = [];

  private uploadSpeed: uploadSpeed = { time: 0, speed: 0 };

  get getUploadList(): FileItem[] {
    return this.uploadList || [];
  }
  get getShareFile(): NetFile[] {
    return this.shareFiles;
  }
  get getUploadSpeed(): uploadSpeed {
    return this.uploadSpeed;
  }

  @Mutation
  appendItem(file: FileItem): void {
    this.uploadList.push(file);
  }
  @Mutation
  spliceItem(index: number): void {
    this.uploadList.splice(index, 1);
  }
  @Mutation
  delAllItems(): void {
    this.uploadList = [];
  }

  @Mutation
  appendShareFile(file: NetFile): void {
    this.shareFiles.push(file);
  }
  @Mutation
  setSpeed(s: number): void {
    if (dayjs().unix() === this.uploadSpeed.time) {
      this.uploadSpeed.speed += s;
    } else {
      this.uploadSpeed.speed = s;
      this.uploadSpeed.time = dayjs().unix();
    }
  }

  @Mutation
  setItemValue(params: { uuid: string; key: string; value: any }): void {
    const { uuid, key, value } = params;
    this.uploadList.forEach((v) => {
      if (v.uuid === uuid) {
        // @ts-ignore
        v[key] = value;
      }
    });
  }

  @Action
  addItem(file: FileItem): void {
    this.appendItem(file);
  }
  @Action
  delItem(index: number): void {
    this.spliceItem(index);
  }
  @Action
  delAllItem(): void {
    this.delAllItems();
  }

  @Action
  addShare(file: NetFile): void {
    this.appendShareFile(file);
  }

  @Action
  addSpeed(s: number): void {
    this.setSpeed(s);

    setInterval(() => {
      if (this.uploadSpeed.speed === 0) {
        clearInterval();
      }
      this.setSpeed(0);
    }, 1000);
  }

  @Action
  fetchShareFile(params: { code?: string; uri: string }) {
    useApollo({ mode: 'query', gql: driveFindShare, variables: params }).then((res) => {
      const data = res.data?.driveFindShare;
      if (!data) {
        createErrorModal({ title: '错误', content: '分享文件信息错误' });
        return;
      }
      this.addShare(new NetFile(data));
    });
  }

  @Action
  async uploadApiByItem(item: FileItem, path: string[] = []) {
    try {
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.UPLOADING });
      const writeChunkSize = 1024;
      // 获取client session
      const session = await useMClient();

      const object = {
        File: new Uint8Array(await item.file.arrayBuffer()),
        FullName: [...path, item.name],
        FileSize: item.size,
        UserId: localStorage.getItem('uid'),
        Space: 'PRIVATE',
        Description: item.desc || '',
      };
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.UPLOADING });
      let timeStart = Date.now();
      const encoded: Uint8Array = encode(object);
      let buffer = new ArrayBuffer(4);
      let dv = new DataView(buffer);
      dv.setUint32(0, encoded.length, true);
      await session.write(new Uint8Array(buffer));
      let buf!: Uint8Array;
      for (let n = 0; n < encoded.length; n += buf.length) {
        buf = new Uint8Array(Math.min(encoded.length - n, writeChunkSize));
        for (let i = 0; i < buf.length; i++) {
          buf[i] = encoded[i + n];
        }
        await session.write(buf);

        if (
          Math.floor(((n + buf.length) * 10) / encoded.length) !==
          Math.floor((n * 10) / encoded.length)
        ) {
          this.setItemValue({
            uuid: item.uuid,
            key: 'percent',
            // @ts-ignore
            value: (((n + buf.length) / item.size) * 100) | 0,
          });
          this.addSpeed(((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000);
          let speed: number | string =
            ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000;
          this.setItemValue({ uuid: item.uuid, key: 'speed', value: speed });
          if (speed > 0.9) {
            speed = speed.toFixed(2) + ' MB/s';
          } else if (speed * 1000 > 0.9) {
            speed = (speed * 1000).toFixed(2) + 'KB/s';
          } else {
            speed = (speed * 1000 * 1000).toFixed(2) + 'B/s';
          }
          // item.status = speed;
          this.setItemValue({ uuid: item.uuid, key: 'status', value: speed });
          console.log(
            session.localAddr,
            'sent',
            n + buf.length,
            'bytes',
            ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000000000,
            'B/s'
          );
        }

        // c
      }
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.SUCCESS });
      return {
        success: true,
        error: null,
      };
    } catch (e) {
      console.log(e);
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.ERROR });
      return {
        success: false,
        error: e,
      };
    }
  }
}
export const fileStore = getModule<netFileStore>(netFileStore);
