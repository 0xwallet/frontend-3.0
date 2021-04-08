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
import { NetFile, NetGql, getFileList } from '/@/components/NetFile';
import { useApollo } from '/@/hooks/apollo/apollo';

const { createMessage, createErrorModal } = useMessage();
const NAME = 'netFileStore';
hotModuleUnregisterModule(NAME);

interface uploadSpeed {
  time: number;
  speed: number;
}
interface fileInfo {
  file: NetFile | null;
  mode: string;
  button: boolean;
  collection: boolean;
}
interface uploadItem {
  File: Uint8Array;
  FullName?: string[];
  FileSize?: string | number;
  UserId?: string | null;
  Space?: string;
  Description?: string;
  Action: string;
  UseFileId?: string;
}
export interface markdownFile {
  title: string;
  file: NetFile | null;
  key: string;
  edited: boolean;
  content: string | undefined;
}

@Module({ namespaced: true, name: NAME, dynamic: true, store })
class netFileStore extends VuexModule {
  private uploadList: FileItem[] = [];

  private shareFiles: NetFile[] = [];

  private uploadSpeed: uploadSpeed = { time: 0, speed: 0 };

  private refetch: boolean = false;

  private markdownFiles: markdownFile[] = [];

  private editorVisible: boolean = false;
  private editorOutlineVisible: boolean = false;

  private markdownModalVisible: boolean = false;

  private fileSize: object = {};

  private Info: fileInfo = { file: null, mode: 'basic', button: false, collection: false };

  private space: { total: number; used: number } = { total: 1, used: 0 };

  get getUploadList(): FileItem[] {
    return this.uploadList || [];
  }
  get getShareFile(): NetFile[] {
    return this.shareFiles;
  }
  get getUploadSpeed(): uploadSpeed {
    return this.uploadSpeed;
  }
  get getMarkdownFiles(): markdownFile[] {
    return this.markdownFiles;
  }
  get getMarkdownVisible(): boolean {
    return this.markdownModalVisible;
  }
  get getRefetch(): boolean {
    return this.refetch;
  }
  get getFileInfo(): fileInfo {
    return this.Info;
  }
  get getFileSize(): object {
    return this.fileSize;
  }
  get getSpace(): object {
    return this.space;
  }
  get getEditorVisible(): boolean {
    return this.editorVisible;
  }
  get getEditorOutlineVisible(): boolean {
    return this.editorOutlineVisible;
  }
  @Mutation
  setEditorVisible(v?: boolean) {
    if (v === undefined) {
      this.editorVisible = !this.editorVisible;
      return;
    }
    this.editorVisible = v;
  }

  @Mutation
  setFileInfo(params: { file: NetFile; mode: string; collection: boolean }): void {
    this.Info.mode = params.mode;
    this.Info.collection = params.collection;
    if (!params.file) {
      this.Info.file = null;
      return;
    }
    if (this.Info.file && this.Info.file.id == params.file.id && this.Info.button) {
      this.Info.file = null;
      return;
    }
    this.Info.file = params.file;
  }

  @Mutation
  changeButton(): void {
    this.Info.button = !this.Info.button;
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
  setRefetch(t: boolean = true): void {
    this.refetch = t;
  }
  @Mutation
  setFileSize(params: { dirId: string; size: number }): void {
    this.fileSize[params.dirId] = params.size;
  }

  @Mutation
  setShareFile(file: NetFile[]): void {
    this.shareFiles = file;
  }
  @Mutation
  appendMarkdownFile(file?: NetFile): void {
    if (file && !this.markdownFiles.some((v) => v.key === file.id)) {
      this.markdownFiles.push({
        title: file.fileName(),
        file,
        key: file.id,
        edited: false,
        content: undefined,
      });
    } else {
      this.markdownFiles.push({
        title: 'new',
        file: null,
        key: dateUtil().toString(),
        edited: false,
        content: '',
      });
    }
    this.editorVisible = true;
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
  setEditorOutlineVisible(): void {
    this.editorOutlineVisible = !this.editorOutlineVisible;
  }
  @Mutation
  setMarkdownEdited(params: { index: number; edited: boolean; title?: string }): void {
    this.markdownFiles[params.index].edited = params.edited;
    if (params.title) this.markdownFiles[params.index].title = params.title;
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
  setItemValue(params: { uuid: string | undefined; key: string; value: any }): void {
    const { uuid, key, value } = params;
    this.uploadList.forEach((v) => {
      if (v.uuid === uuid) {
        // @ts-ignore
        v[key] = value;
      }
    });
  }
  @Mutation
  setSpace(params: { total: number; used: number }): void {
    this.space = params;
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
      // 获取client session
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.UPLOADING });
      const object: uploadItem = {
        File: new Uint8Array(await item.file.arrayBuffer()),
        FullName: [...item.path, item.name],
        FileSize: item.size,
        UserId: localStorage.getItem('uid'),
        Space: 'PRIVATE',
        Description: item.desc || '',
        Action: 'drive',
      };
      console.log(object);
      await this.uploadItem(object, item.uuid);
      this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.SUCCESS });
      createMessage.success(item.name + '上传成功', 2);
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
  async newMarkdownFile(params: { content: string; name: string; desc: string }) {
    try {
      // 获取client session
      const object: uploadItem = {
        File: new TextEncoder().encode(params.content),
        FullName: [params.name],
        FileSize: new Blob([params.content]).size,
        UserId: localStorage.getItem('uid'),
        Space: 'PRIVATE',
        Description: params.desc || '',
        Action: 'drive',
      };
      console.log(object);
      await this.uploadItem(object);
      createMessage.success(params.name + '上传成功', 2);
    } catch (e) {
      console.log(e);
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
  fetchShareFiles(params: { token: string; dirId: string }) {
    useApollo({ mode: 'query', gql: NetGql.Basic.FileList, variables: params }).then((res) => {
      const data = res.data?.driveListFiles;
      if (!data) {
        createErrorModal({ title: '错误', content: '分享文件信息错误' });
        return;
      }
      this.setShareFile(getFileList(data, params.dirId, params.token));
    });
  }

  @Action
  async uploadItem(f: uploadItem, uuid?: string) {
    try {
      const session = await useSession();
      const writeChunkSize = 1024;
      const encoded: Uint8Array = encode(f);
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
          if (uuid) {
            this.setItemValue({
              uuid: uuid,
              key: 'percent',
              value: (((n + buf.length) / Number(f.FileSize)) * 100) | 0,
            });
          }

          this.addSpeed(((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000);
          let speed: number | string =
            ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000;
          if (uuid) this.setItemValue({ uuid: uuid, key: 'speed', value: speed });
          if (speed > 0.9) {
            speed = speed.toFixed(2) + ' MB/s';
          } else if (speed * 1000 > 0.9) {
            speed = (speed * 1000).toFixed(2) + 'KB/s';
          } else {
            speed = (speed * 1000 * 1000).toFixed(2) + 'B/s';
          }
          // item.status = speed;
          if (uuid) this.setItemValue({ uuid: uuid, key: 'status', value: speed });
          console.log(
            session.localAddr,
            'sent',
            n + buf.length,
            'bytes',
            ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000000000,
            'B/s'
          );
        }
      }
      console.log('done');
    } catch (e) {
      this.setItemValue({ uuid: uuid, key: 'status', value: UploadResultStatus.ERROR });
    }
  }
  @Action
  async editFile(params: { content: string; id: string }) {
    try {
      const item: uploadItem = {
        File: new TextEncoder().encode(params.content),
        FileSize: new Blob([params.content]).size,
        UseFileId: params.id,
        Space: 'PRIVATE',
        Action: 'update',
      };
      await this.uploadItem(item);
    } catch (e) {
      console.log(e);
    }
  }

  @Action
  async uploadAvatar(file: File) {
    try {
      // 获取client session
      const object: uploadItem = {
        File: new Uint8Array(await file.arrayBuffer()),
        FullName: [file.name],
        Action: 'avatar',
      };
      await this.uploadItem(object);
      createMessage.success('上传成功', 2);
    } catch (e) {
      console.log(e);
      return {
        success: false,
        error: e,
      };
    }
  }
}
export const fileStore = getModule<netFileStore>(netFileStore);
