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

import { Socket as PhoenixSocket } from 'phoenix';
import { useDelay } from '/@/hooks/web/useDelay';

let WsChannel: any = null;

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
  waiting: boolean;
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
  editorPath: { name: string; dirId: string };
  space: { total: number; used: number };
  waitingList: { id: string | undefined }[];
  files: NetFile[];
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
    editorPath: { name: 'Home', dirId: 'root' },
    markdownModalVisible: false,
    fileSize: {},
    Info: { file: null, mode: 'basic', button: false, collection: false },
    space: { total: 1, used: 0 },
    waitingList: [],
    files: [],
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
    getFiles(): NetFile[] {
      return this.files;
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
    getEditorPath(): { name: string; dirId: string } {
      return this.editorPath;
    },
    getWaitingList(): { id: string | undefined }[] {
      return this.waitingList;
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
      if (this.refetch !== t) this.refetch = t;
    },
    setFileSize(params: { dirId: string; size: number }): void {
      this.fileSize[params.dirId] = params.size;
    },
    setShareFile(file: NetFile[]): void {
      this.shareFiles = file;
    },
    appendMarkdownFile(
      file?: NetFile,
      changePath: boolean = false,
      path?: { name: string; dirId: string }
    ): void {
      if (changePath) this.editorPath = path || { name: 'Home', dirId: 'root' };

      if (file && !this.markdownFiles.some((v) => v.key === file.id)) {
        this.markdownFiles.push({
          title: file.fileName(),
          file,
          key: file.id,
          edited: false,
          content: undefined,
          waiting: true,
        });
      }

      this.editorVisible = true;
    },
    createMarkdownFile() {
      this.markdownFiles.push({
        title: 'new',
        file: null,
        key: dateUtil().toString(),
        edited: false,
        content: '',
        waiting: false,
      });
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
    setMarkdownEdited(index: number, edited: boolean, title?: string): void {
      this.markdownFiles[index].edited = edited;
      if (title) this.markdownFiles[index].title = title;
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
        // 如果可以秒传
        if (item.secondPass) {
          this.setItemValue({
            uuid: item.uuid,
            key: 'status',
            value: UploadResultStatus.SUCCESS,
          });
          this.setItemValue({
            uuid: item.uuid,
            key: 'percent',
            value: 100,
          });
        } else {
          // 获取client session
          this.setItemValue({
            uuid: item.uuid,
            key: 'status',
            value: UploadResultStatus.UPLOADING,
          });
          const object: uploadItem = {
            File: new Uint8Array(await item.file.arrayBuffer()),
            FullName: [...item.path, item.name],
            FileSize: item.size,
            UserId: localStorage.getItem('uid'),
            Space: 'PRIVATE',
            Description: item.desc || '',
            Action: 'drive',
          };
          await this.uploadItem(object, item.uuid);
          // this.setItemValue({ uuid: item.uuid, key: 'status', value: UploadResultStatus.SUCCESS });
          // createMessage.success(item.name + '上传成功', 2);
        }
        this.uploaded({ hash: item.hash, id: item.uuid, full_name: ['', item.name] });
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
        await this.uploadItem(object);
        createMessage.success(params.name + '上传成功', 2);
      } catch (e) {
        console.log(e);
      }
    },
    fetchShareFile(params: { code?: string; uri: string }): Promise<boolean> {
      return useApollo({ mode: 'query', gql: NetGql.Share.Find, variables: params }).then((res) => {
        const data = res.data?.driveFindShare;
        if (!data) return false;
        this.setShareFile([new NetFile(data)]);
        return true;
      });
    },
    fetchShareFiles(params: { token: string; dirId: string }) {
      useApollo({ mode: 'query', gql: NetGql.Basic.FileList, variables: params }).then((res) => {
        console.log('fetchShareFiles-----res', res);
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
            let shouldContinueSetStatusAsSpeed = true;
            if (uuid) {
              // 修复二次上传卡在99 的bug的地方
              const calcPercent = Math.round(((n + buf.length) / Number(f.FileSize)) * 100);
              const toSetPercent = calcPercent < 100 ? calcPercent : 100;
              // console.log('----calc----',calcPercent)
              this.setItemValue({
                uuid: uuid,
                key: 'percent',
                // value: (((n + buf.length) / Number(f.FileSize)) * 100 - 1) | 0,
                value: toSetPercent,
              });
              if (toSetPercent === 100) {
                shouldContinueSetStatusAsSpeed = false;
              }
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
            if (uuid && shouldContinueSetStatusAsSpeed) {
              // 如果已经 100% 了就不要再设置速度为状态了
              this.setItemValue({ uuid: uuid, key: 'status', value: speed });
            }
            // console.log(
            //   session.localAddr,
            //   'sent',
            //   n + buf.length,
            //   'bytes',
            //   ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000000000,
            //   'B/s'
            // );
          }
        }
        // console.log('done');
        // console.log(this.uploadList);
      } catch (e) {
        console.error('uploadItem', e);
        this.setItemValue({ uuid: uuid, key: 'status', value: UploadResultStatus.ERROR });
      }
    },
    async editFile(content: string, id: string, index: number) {
      try {
        const item: uploadItem = {
          File: new TextEncoder().encode(content),
          FileSize: new Blob([content]).size,
          UseFileId: id,
          Space: 'PRIVATE',
          Action: 'update',
        };
        this.markdownFiles[index].waiting = true;
        await this.uploadItem(item, undefined);
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
    setWaiting(index: number, waiting: boolean) {
      this.markdownFiles[index].waiting = waiting;
    },

    useWs(): any {
      if (WsChannel) return WsChannel;
      const phoenix_socket = new PhoenixSocket('wss://owaf.io/socket', {
        params: () => {
          return { Authorization: 'Bearer ' + localStorage.getItem('token') };
        },
      });
      const user_id = localStorage.getItem('uid');
      if (!user_id) return;
      phoenix_socket.connect();

      // Now that you are connected, you can join channels with a topic:
      // let user_id = localStorage.getItem('uid');

      WsChannel = phoenix_socket.channel(`drive:user_${user_id}`, {});

      WsChannel.on('file_uploaded', (file) => {
        // console.log('file uploaded:', file);
        // 这个file uploaded事件执行在session.write之前(还没开始写文件)
        // this.uploaded(file);
      });
      // join channel
      WsChannel.join()
        .receive('ok', (resp) => {
          // console.log('Joined successfully', resp);
          console.log('[Ready] join socket channel', resp);
        })
        .receive('error', (resp) => {
          console.log('Unable to join', resp);
        });
      console.log('[Ready] phoenix_socket');
      // this.waitingList.push({ id: f.UseFileId });
    },
    uploaded(file: { hash: string; id: string; full_name: string[] }) {
      // console.log('uploaded',file)
      // 1. 如果在 markdown 中找得到
      let index = this.markdownFiles.findIndex((v) => v.key == file.id);
      // console.log(index, this.uploadList[index]);

      if (index > -1) {
        this.markdownFiles[index].waiting = false;
        this.markdownFiles[index].edited = false;
        return;
      }
      // 2. 提示上传成功
      index = this.uploadList.findIndex((v) => v.hash == file.hash);
      // console.log(index, this.uploadList[index]);
      if (index > -1) {
        this.uploadList[index].status = UploadResultStatus.SUCCESS;
        this.uploadList[index].percent = 100; // 这里设置了为 100 ?
        createMessage.success(`${file.full_name.slice(-1)[0]} 上传成功`);
        // console.log('上传后的set success 标记', this.uploadList[index]);
        // this.refetch = true;
        this.setRefetch();
        // console.log('this', this);
      }
    },
    async searchFile(keywords: string) {
      const { data } = await useApollo({
        mode: 'query',
        gql: NetGql.Basic.Search,
        variables: { keywords, space: 'PRIVATE' },
      });
      let list: NetFile[] = [];
      data.driveSearch.forEach((v) => {
        // @ts-ignore
        list.push(new NetFile({ userFile: v }));
      });
      this.files = list;
    },
    setFiles(files: NetFile[]) {
      this.files = files;
    },
  },
});

// Need to be used outside the setup
export function useNetFileStoreWidthOut() {
  return useNetFileStore(store);
}
