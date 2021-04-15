import { defineStore } from 'pinia';
import { store } from '/@/store';
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

interface netFileState {
  uploadList: FileItem[];
  shareFiles: NetFile[];
  uploadSpeed: uploadSpeed;
  refetch: boolean;
  markdownFiles: markdownFile[];
  editorVisible: boolean;
  editorOutlineVisible: boolean;
  markdownModalVisible: boolean;
  fileSize: object;
  Info: fileInfo;
  space: { total: number; used: number };
}

export const useNetFileStore = defineStore({
  id: 'netFile',
  state: (): netFileState => ({
    uploadList: [],
    shareFiles: [],
    uploadSpeed: { time: 0, speed: 0 },
    refetch: false,
    markdownFiles: [],
    editorVisible: false,
    editorOutlineVisible: false,
    markdownModalVisible: false,
    fileSize: {},
    Info: { file: null, mode: 'basic', button: false, collection: false },
    space: { total: 1, used: 0 },
  }),
  getters: {
    getUploadList(): FileItem[] {
      return this.uploadList || [];
    },
    getShareFile(): NetFile[] {
      return this.shareFiles;
    },
    getUploadSpeed(): uploadSpeed {
      return this.uploadSpeed;
    },
    getMarkdownFiles(): markdownFile[] {
      return this.markdownFiles;
    },
    getMarkdownVisible(): boolean {
      return this.markdownModalVisible;
    },
    getRefetch(): boolean {
      return this.refetch;
    },
    getFileInfo(): fileInfo {
      return this.Info;
    },
    getFileSize(): object {
      return this.fileSize;
    },
    getSpace(): object {
      return this.space;
    },
    getEditorVisible(): boolean {
      return this.editorVisible;
    },
    getEditorOutlineVisible(): boolean {
      return this.editorOutlineVisible;
    },
  },
  actions: {
    setEditorVisible(v?: boolean) {
      if (v === undefined) {
        this.editorVisible = !this.editorVisible;
        return;
      }
      this.editorVisible = v;
    },
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
    },
    changeButton(): void {
      this.Info.button = !this.Info.button;
    },
    appendItem(file: FileItem): void {
      this.uploadList.push(file);
    },
    delItem(index: number): void {
      this.uploadList.splice(index, 1);
    },
    delAllItems(): void {
      this.uploadList = [];
    },
    setRefetch(t: boolean = true): void {
      this.refetch = t;
    },
    setFileSize(params: { dirId: string; size: number }): void {
      this.fileSize[params.dirId] = params.size;
    },
    setShareFile(file: NetFile[]): void {
      this.shareFiles = file;
    },
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
    },
    delMarkdownFile(id: string): number {
      const index = this.markdownFiles.findIndex((v) => v.key == id);
      this.markdownFiles.splice(index, 1);
      return index;
    },
    setMarkdownVisible(v: boolean): void {
      this.markdownModalVisible = v;
    },
    setEditorOutlineVisible(): void {
      this.editorOutlineVisible = !this.editorOutlineVisible;
    },
    setMarkdownEdited(params: { index: number; edited: boolean; title?: string }): void {
      this.markdownFiles[params.index].edited = params.edited;
      if (params.title) this.markdownFiles[params.index].title = params.title;
    },
    setSpeed(s: number): void {
      if (dateUtil().unix() === this.uploadSpeed.time) {
        this.uploadSpeed.speed += s;
      } else {
        this.uploadSpeed.speed = s;
        this.uploadSpeed.time = dateUtil().unix();
      }
    },
    setItemValue(params: { uuid: string | undefined; key: string; value: any }): void {
      const { uuid, key, value } = params;
      this.uploadList.forEach((v) => {
        if (v.uuid === uuid) {
          // @ts-ignore
          v[key] = value;
        }
      });
    },
    setSpace(params: { total: number; used: number }): void {
      this.space = params;
    },
    addSpeed(s: number): void {
      this.setSpeed(s);
      setInterval(() => {
        if (this.uploadSpeed.speed === 0) {
          clearInterval();
        }
        this.setSpeed(0);
      }, 1000);
    },
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
    },
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
    },
    fetchShareFile(params: { code?: string; uri: string }) {
      useApollo({ mode: 'query', gql: NetGql.Share.Find, variables: params }).then((res) => {
        const data = res.data?.driveFindShare;
        if (!data) {
          createErrorModal({ title: '错误', content: '分享文件信息错误' });
          return;
        }
        this.setShareFile([new NetFile(data)]);
      });
    },
    fetchShareFiles(params: { token: string; dirId: string }) {
      useApollo({ mode: 'query', gql: NetGql.Basic.FileList, variables: params }).then((res) => {
        const data = res.data?.driveListFiles;
        if (!data) {
          createErrorModal({ title: '错误', content: '分享文件信息错误' });
          return;
        }
        this.setShareFile(getFileList(data, params.dirId, params.token));
      });
    },
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
    },
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
    },
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
    },
  },
});

// Need to be used outside the setup
export function useNetFileStoreWidthOut() {
  return useNetFileStore(store);
}
