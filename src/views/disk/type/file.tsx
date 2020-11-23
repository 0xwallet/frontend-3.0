import { useApollo } from '/@/hooks/apollo/apollo';
import {
  driveCreateShare,
  driveDeleteFile,
  driveDeleteShare,
  drivePreviewToken,
} from '/@/hooks/apollo/gqlFile';
import { toLower } from 'lodash-es';
import { downloadByUrl } from '/@/utils/file/download';
import { createImgPreview } from '/@/components/Preview';
import { unref } from 'vue';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { useMessage } from '/@/hooks/web/useMessage';
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();
interface fileParams {
  userFile: userFile;
  id?: string;
  code?: string;
  uri?: string;
  token?: string;
  expiredAt?: string;
}

interface userFile {
  fullName: string[];
  hash: string;
  id: string;
  info: { size: string; description: string };
  isDir: boolean;
  space: string;
}

export class File {
  id: string;
  name: string;
  path: string[];
  type: string;
  isDir: boolean;
  fullName: string[];
  size: number;
  hash?: string;
  shareId?: string;
  code?: string;
  expiredAt?: string;
  uri?: string;
  token?: string;
  space: string;
  desc: string;

  constructor(params: fileParams) {
    this.id = params.userFile.id;
    this.fullName = params.userFile.fullName;
    const path = params.userFile.fullName[params.userFile.fullName.length - 1];
    this.isDir = params.userFile.isDir;
    this.space = params.userFile.space;
    if (params.userFile.isDir) {
      this.type = 'folder';
      this.name = path;
    } else {
      this.name = path.split('.')[0];
      this.type = path.split('.')[1];
    }
    this.path = params.userFile.fullName.slice(0, params.userFile.fullName.length - 1);
    this.size = Number(params.userFile.info.size);
    this.desc = params.userFile.info.description;

    this.code = params.code;
    this.token = params.token;
    this.uri = params.uri;
    this.expiredAt = params.expiredAt;
    this.hash = params.userFile.hash;
    this.shareId = params.id;
  }
  // 文件下载
  download() {
    if (this.type === 'folder') {
      return;
    }
    const id = localStorage.getItem('uid');
    let token = '';
    useApollo()
      .mutate({ mutation: drivePreviewToken })
      .then((res) => {
        token = res?.data?.drivePreviewToken;
        let url = `https://drive-s.owaf.io/download/${id}/${toLower(this.space)}/${this.id}/${
          this.fullName
        }?token=${token}`;

        // /preview/:user_id/:space/:user_file_id/:filename?token=:token
        downloadByUrl({
          url: url,
          target: '_self',
        });
      });
  }
  // 文件预览
  preview() {
    if (this.type === 'folder') {
      return;
    }
    const id = localStorage.getItem('uid');
    let token = '';
    useApollo()
      .mutate({ mutation: drivePreviewToken })
      .then((res) => {
        token = res?.data?.drivePreviewToken;
        let url = `https://drive-s.owaf.io/preview/${id}/${toLower(this.space)}/${this.id}/${
          this.fullName
        }?token=${token}`;
        createImgPreview({
          imageList: [url],
        });
      });
  }
  // 文件分享
  share(code: string): Promise<boolean> {
    return useApollo()
      .mutate({
        mutation: driveCreateShare,
        variables: { code, userFileId: this.id },
      })
      .then((res) => {
        this.uri = res.data?.driveCreateShare.uri;
        this.code = res.data?.driveCreateShare.code;
        this.token = res.data?.driveCreateShare.token;
        return true;
      })
      .catch(() => {
        return false;
      });
  }
  // 删除分享
  delShare(): Promise<any> {
    return useApollo().mutate({
      mutation: driveDeleteShare,
      variables: {
        id: this.shareId,
      },
    });
  }
  // 拼接分享链接
  shareUrl(): string {
    if (this.uri === '') {
      return '';
    }
    const url = `${window.location.origin}/#/disk/shareFile/${this.uri}`;
    this.copyShareUrl();
    return url;
  }
  // 分享链接放出剪切板
  copyShareUrl() {
    if (this.uri === '') {
      return '';
    }
    clipboardRef.value = `${window.location.origin}/#/disk/shareFile/${this.uri}`;
    if (unref(copiedRef)) {
      createMessage.success('copy success！');
    }
  }
  // 删除文件
  delFile(): Promise<any> {
    return useApollo().mutate({
      mutation: driveDeleteFile,
      variables: { id: this.id, space: this.space },
    });
  }
}
