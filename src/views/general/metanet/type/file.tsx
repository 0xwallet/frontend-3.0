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
import moment from 'moment';
import { useI18n } from '/@/hooks/web/useI18n';
import { getFile } from '/@/api/general/metanet/file';
const { t } = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();

interface fileParams {
  userFile: userFile;
  id?: string;
  code?: string;
  uri?: string;
  token?: string;
  expiredAt?: string;
  updatedAt: string;
}

interface userFile {
  fullName: string[];
  hash: string;
  id: string;
  info: { size: string; description: string };
  isDir: boolean;
  space: string;
  updatedAt: string;
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
  updatedAt: string;
  expiredAt?: string;
  uri: string;
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
      this.name = path.substring(0, path.lastIndexOf('.'));
      // @ts-ignore
      this.type = path.split('.').pop().toLowerCase();
    }
    this.path = params.userFile.fullName.slice(0, params.userFile.fullName.length - 1);
    this.size = Number(params.userFile.info.size);
    this.desc = params.userFile.info.description;

    this.updatedAt = moment(params.userFile.updatedAt).toString();
    this.code = params.code;
    this.token = params.token;
    this.uri = params.uri || '';
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
  preview(): Promise<any> {
    if (this.type === 'folder') {
      return new Promise<any>((_, reject) => reject);
    }
    const id = localStorage.getItem('uid');
    let token = '';
    return useApollo()
      .mutate({ mutation: drivePreviewToken })
      .then((res) => {
        token = res?.data?.drivePreviewToken;
        let url = `https://drive-s.owaf.io/preview/${id}/${toLower(this.space)}/${this.id}/${
          this.fullName
        }?token=${token}`;
        if (this.type === 'png') {
          createImgPreview({
            imageList: [url],
          });
          return;
        } else if (this.type === 'md') {
          return getFile(url);
        }
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
    const url = `${window.location.origin}/#/general/shareFile/${this.uri}`;
    this.copyShareUrl(1);
    return url;
  }
  // 分享链接放出剪切板
  copyShareUrl(mode: number) {
    if (this.uri === '') {
      return '';
    }
    let temp = '';
    if (mode === 1 || mode === 3) {
      temp += `${t('general.metanet.shareUrl')}:${window.location.origin}/#/general/shareFile/${
        this.uri
      }   `;
    }
    if (mode === 2 || mode === 3) {
      temp += `${t('general.metanet.code')}:${this.code}`;
    }

    clipboardRef.value = temp;
    if (unref(copiedRef)) {
      createMessage.success(t('general.metanet.copySuccess'));
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
