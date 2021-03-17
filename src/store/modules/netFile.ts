import store from '/@/store/index';
import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators';
import { hotModuleUnregisterModule } from '/@/utils/helper/vuexHelper';
import {
  FileItem,
  UploadResultStatus,
} from '/@/views/general/metanet/component/Files/upload/types';
import { useSession } from '/@/hooks/nkn/getNKN';
import { encode } from '@msgpack/msgpack';
import { useMessage } from '/@/hooks/web/useMessage';
import { dateUtil } from '/@/utils/dateUtil';
import { NetFile, NetGql,getFileList } from '/@/components/NetFile';
import { useApollo } from '/@/hooks/apollo/apollo';

const { createMessage, createErrorModal } = useMessage();
const NAME = 'netFileStore';
hotModuleUnregisterModule(NAME);
interface uploadSpeed {
  time: number;
  speed: number;
}
interface fileInfo {
  file:NetFile|null
  mode:string
  button:boolean

}



@Module({ namespaced: true, name: NAME, dynamic: true, store })
class netFileStore extends VuexModule {
  private uploadList: FileItem[] = [];

  private shareFiles: NetFile[] = [];

  private uploadSpeed: uploadSpeed = { time: 0, speed: 0 };

  private refetch: number = 0;

  private markdownFiles: any[] = [];

  private markdownModalVisible: boolean = false;

  private Info:fileInfo={file:null,mode:'basic',button:false}

  get getUploadList(): FileItem[] {
    return this.uploadList || [];
  }
  get getShareFile(): NetFile[] {
    return this.shareFiles;
  }
  get getUploadSpeed(): uploadSpeed {
    return this.uploadSpeed;
  }
  get getMarkdownFiles(): any[] {
    return this.markdownFiles;
  }
  get getMarkdownVisible(): boolean {
    return this.markdownModalVisible;
  }
  get getRefetch(): number {
    return this.refetch;
  }
  get getFileInfo(): fileInfo {
    return this.Info;
  }
  @Mutation
  setFileInfo(params:{file: NetFile, mode: string}): void {
    this.Info.mode = params.mode
    if(!params.file){
      this.Info.file=null
    return;
    }
    if (this.Info.file&&this.Info.file.id == params.file.id && this.Info.button) {
      this.Info.file = null;
      return;
    }
    this.Info.file=params.file;
  }

  @Mutation
  changeButton(): void {
    this.Info.button=!this.Info.button;
  }

  @Mutation
  appendItem(file: FileItem): void {
    this.uploadList.push(file);
  }
  @Mutation
  delItem(index: number): void {
    this.uploadList.splice(index, 1);
  }
  @Mutation
  delAllItems(): void {
    this.uploadList = [];
  }
  @Mutation
  setRefetch(t: number = 0): void {
    this.refetch = t;
  }

  @Mutation
  setShareFile(file: NetFile[]): void {
    this.shareFiles=file;
  }
  @Mutation
  appendMarkdownFile(file: NetFile): void {
    if (!this.markdownFiles.some((v) => v.key === file.id)) {
      this.markdownFiles.push({
        title: file.fileName(),
        file,
        key: file.id,
      });
    }
    this.markdownModalVisible = true;
  }
  @Mutation
  delMarkdownFile(id: string): number {
    const index = this.markdownFiles.findIndex((v) => v.key == id);
    this.markdownFiles.splice(index, 1);
    return index;
  }
  @Mutation
  setMarkdownVisible(v: boolean): void {
    this.markdownModalVisible = v;
  }

  @Mutation
  setSpeed(s: number): void {
    if (dateUtil().unix() === this.uploadSpeed.time) {
      this.uploadSpeed.speed += s;
    } else {
      this.uploadSpeed.speed = s;
      this.uploadSpeed.time = dateUtil().unix();
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
  async uploadApiByItem(item: FileItem) {
    try {
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.UPLOADING });
      const writeChunkSize = 1024;
      // 获取client session
      const session = await useSession();
      const object = {
        File: new Uint8Array(await item.file.arrayBuffer()),
        FullName: [...item.path, item.name],
        FileSize: item.size,
        UserId: localStorage.getItem('uid'),
        Space: 'PRIVATE',
        Description: item.desc || '',
      };
      console.log(object)
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.UPLOADING });
      const encoded: Uint8Array = encode(object);
      let buffer = new ArrayBuffer(4);
      let dv = new DataView(buffer);
      dv.setUint32(0, encoded.length, true);
      await session.write(new Uint8Array(buffer));
      let buf!: Uint8Array;
      let timeStart = Date.now();
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
      createMessage.success(item.name + '上传成功', 2);
      this.setRefetch(1);
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
  @Action
  fetchShareFile(params: { code?: string; uri: string }) {
    useApollo({ mode: 'query', gql: NetGql.Share.Find, variables: params }).then((res) => {
      const data = res.data?.driveFindShare;
      if (!data) {
        createErrorModal({ title: '错误', content: '分享文件信息错误' });
        return;
      }
      this.setShareFile([new NetFile(data)]);
    });
  }
  @Action
  fetchShareFiles(params: { token: string,dirId:string}) {
    useApollo({ mode: 'query', gql: NetGql.Basic.FileList, variables: params }).then((res) => {
      const data = res.data?.driveListFiles;
      if (!data) {
        createErrorModal({ title: '错误', content: '分享文件信息错误' });
        return;
      }
      this.setShareFile(getFileList(data,params.dirId,params.token));
    });
  }
}
export const fileStore = getModule<netFileStore>(netFileStore);
