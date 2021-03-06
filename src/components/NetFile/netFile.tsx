import { useApollo } from '/@/hooks/apollo/apollo';
import { toLower } from 'lodash-es';
import { downloadByUrl } from '/@/utils/file/download';
import { createVNode, unref } from 'vue';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { createImgPreview } from '/@/components/Preview';
export const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import router from '/@/router';
import { PageEnum } from '/@/enums/pageEnum';
import { NetGql } from '/@/components/NetFile/gql';
import { getFile } from '/@/api/general/metanet/file';
// 循环获取NKN.JS

const { t } = useI18n();
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage, createErrorModal, createConfirm } = useMessage();

function CheckToken(): boolean {
  if (localStorage.getItem('token')) return true;
  Modal.confirm({
    title: t('error'),
    icon: createVNode(ExclamationCircleOutlined),
    content: '未登录账号，请登录',
    centered: true,
    okText: t('login'),
    onOk() {
      router.push(PageEnum.BASE_LOGIN);
    },
  });
  return false;
}

interface fileParams {
  userFile: userFile;
  id?: string;
  code?: string;
  uri?: string;
  token?: string;
  expiredAt?: string;
  updatedAt: string;
  isCollected: boolean;
  collectedCount: number;
  version: number;
  txid: string;
  user: user;
  __typename: string;
}

interface user {
  id: string;
  driveSetting: fileSpace;
}

interface userFile {
  fullName: string[];
  hash: string;
  id: string;
  info: { size: string; description: string };
  isDir: boolean;
  space: string;
  updatedAt: string;
  insertedAt: string;
  isShared: boolean;
  user: user;
}

interface fileSpace {
  space: string;
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
}
interface fileShare {
  id: string;
  expiredAt: string;
  code: string;
  token: string;
  uri: string;
}
interface filePublish {
  id: number;
  txid: string;
  version: number;
}
interface fileStatus {
  isShared: boolean;
  isCollected: boolean;
  collectedCount: number;
}
export class NetFile {
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
  createdAt: string;
  expiredAt?: string;
  uri: string;
  token?: string;
  space: fileSpace;
  desc: string;
  userId?: string;
  isShared?: boolean;
  shareInfo?: fileShare;
  status?: fileStatus;
  publishInfo?: filePublish;
  // public publishId?: number;

  constructor(params: fileParams) {
    this.id = params.userFile.id;
    this.fullName = params.userFile.fullName;
    const path = this.fullName.slice(-1)[0];
    this.isDir = params.userFile.isDir;
    if (params.userFile.isDir) {
      this.type = 'folder';
      this.name = path;
    } else {
      this.name = path.substring(0, path.lastIndexOf('.'));
      // @ts-ignore
      this.type = path.split('.').pop().toLowerCase();
    }
    this.space = {
      space: params.userFile.space,
      totalSpace: params.userFile.user.driveSetting?.totalSpace || 0,
      usedSpace: params.userFile.user.driveSetting?.usedSpace || 0,
      availableSpace: params.userFile.user.driveSetting?.availableSpace || 0,
    };
    this.status = {
      isCollected: params.isCollected,
      isShared: params.userFile.isShared,
      collectedCount: params.collectedCount,
    };
    switch (params.__typename) {
      case 'DriveShare':
        this.shareInfo = {
          id: params.id || '',
          expiredAt: params.expiredAt || '',
          code: params.code || '',
          uri: params.uri || '',
          token: params.token || '',
        };
        break;
      case 'DrivePublishHistory':
        this.publishInfo = {
          id: 0,
          txid: params.txid || '',
          version: params.version,
        };
        break;
    }

    this.path = params.userFile.fullName.slice(0, params.userFile.fullName.length - 1);
    this.size = Number(params.userFile.info.size);
    this.desc = params.userFile.info.description || '';
    this.createdAt = params.userFile.insertedAt;
    this.updatedAt = params.userFile.updatedAt;
    this.code = params.code;
    this.token = params.token || '';
    this.uri = params.uri || '';
    this.expiredAt = params.expiredAt;
    this.hash = params.userFile.hash;
    this.shareId = params.id;
    this.userId = params.user?.id || params.userFile?.user?.id || '';
    this.isShared = params.userFile.isShared;
  }
  fileName(): string {
    return this.fullName.slice(-1)[0];
  }
  getToken(): Promise<string> {
    return new Promise<string>((resolve) => {
      if (this.token !== '') resolve(this.token || '');
      useApollo({
        mode: 'mutate',
        gql: NetGql.Basic.Token,
      }).then((res) => {
        resolve(res.data.drivePreviewToken || '');
      });
    });
  }
  // 文件下载
  async download() {
    if (this.type === 'folder') {
      return;
    }
    let token = await this.getToken();
    let url = `https://drive-s.owaf.io/download/${this.userId}/${toLower(this.space.space)}/${
      this.id
    }/${this.fullName.slice(-1)[0]}?token=${token}`;
    downloadByUrl({
      url: url,
      target: '_blank',
    });
  }
  // 文件预览
  async preview(): Promise<any> {
    let token = await this.getToken();
    return new Promise<any>((resolve) => {
      let url = `https://drive-s.owaf.io/preview/${this.userId}/${toLower(this.space.space)}/${
        this.id
      }/${this.fullName.slice(-1)[0]}?token=${token}`;
      if (this.type == 'png' || this.type == 'jpg') {
        createImgPreview({ imageList: [url] });
      }
      resolve(url);
    });
  }

  async raw() {
    return await getFile(await this.preview());
  }

  fullType(): string {
    switch (this.type) {
      case 'folder':
        return '';
      case 'md':
        return 'markdown';
      default:
        return this.type;
    }
  }

  Location(): string[] {
    return ['~'].concat(this.fullName).slice(0, -1);
  }

  // 保存分享
  save(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!CheckToken()) return;
      createConfirm({
        iconType: 'warning',
        title: t('general.metanet.saveShareConfirm'),
        content: this.fullName.slice(-1)[0],
        okText: t('general.metanet.yes'),
        onOk: () => {
          useApollo({
            mode: 'mutate',
            gql: NetGql.Basic.Hash,
            variables: { fullName: this.fullName, hash: this.hash },
          })
            .then((res) => {
              createMessage.success(t('general.metanet.success'));
              resolve(res);
            })
            .catch(() => {
              reject();
            });
        },
      });
    });
  }

  comment(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!CheckToken()) reject();
      resolve(0);
    });
  }
  collection(mode: string, code: string = ''): Promise<any> {
    return new Promise<any>((resolve) => {
      if (mode === 'share') {
        useApollo({
          mode: 'mutate',
          gql: NetGql.Collection.CreateShare,
          variables: { id: this.shareId, code },
        }).then((res) => {
          console.log(res);
          resolve(res);
        });
      }
      if (mode === 'publish') {
        useApollo({
          mode: 'mutate',
          gql: NetGql.Collection.CreatePublish,
          variables: { id: this.publishInfo?.id },
        }).then((res) => {
          console.log(res);
          resolve(res);
        });
      }
    });
  }

  publish() {
    createConfirm({
      iconType: 'warning',
      title: t('general.metanet.publishConfirm'),
      content: this.id,
      okText: t('general.metanet.yes'),
      onOk: () => {
        useApollo({ mode: 'mutate', gql: NetGql.Publish.Create, variables: { id: this.id } }).then(
          (res) => {
            console.log(res);
          }
        );
      },
    });
    return;
  }

  // 文件分享
  share(params: { code: string; day: number } = { code: '', day: 7 }): Promise<boolean> {
    return useApollo({
      mode: 'mutate',
      gql: NetGql.Share.Create,
      variables: { userFileId: this.id, ...params },
    })
      .then((res) => {
        this.uri = res.data?.driveCreateShare.uri;
        this.code = res.data?.driveCreateShare.code;
        this.token = res.data?.driveCreateShare.token;
        return true;
      })
      .catch(() => {
        createErrorModal({
          title: t('general.metanet.failed'),
          content: t('general.metanet.share') + ' ' + t('general.metanet.failed'),
        });
        return false;
      });
  }
  // 删除分享
  delShare(): Promise<any> {
    return useApollo({
      mode: 'mutate',
      gql: NetGql.Share.Delete,
      variables: { id: this.shareId },
    });
  }
  // 拼接分享链接
  shareUrl(): string {
    if (this.uri === '') {
      return '';
    }
    const url = `${window.location.origin}/#/s/file?uri=${this.uri}`;
    this.copyShareUrl(1);
    return url;
  }

  // 分享链接放出剪切板
  copyShareUrl(mode: number, txid?: string) {
    if (this.uri === '') {
      return '';
    }
    let temp = '';
    if (mode === 1 || mode === 3) {
      temp += `${t('general.metanet.shareUrl')}:${window.location.origin}/#/s/file?uri=${
        this.uri
      }   `;
    }
    if ((mode === 2 || mode === 3) && this.code) {
      temp += `${t('general.metanet.code')}:${this.code}`;
    }
    if (mode === 4) {
      temp = `${window.location.origin}/#/s/file?uri=${this.uri}`;
    }
    if (mode === 5) {
      temp = `${window.location.origin}/#/p?txid=${txid}`;
    }

    clipboardRef.value = temp;
    if (unref(copiedRef)) {
      createMessage.success(t('general.metanet.copySuccess'));
    }
  }

  // 删除文件
  delFile(): Promise<any> {
    return useApollo({
      mode: 'mutate',
      gql: NetGql.Basic.Delete,
      variables: { id: this.id, space: this.space },
    });
  }
  // 删除文件
  delFileShare(): Promise<any> {
    return useApollo({
      mode: 'mutate',
      gql: NetGql.Share.Delete,
      variables: { id: this.shareInfo?.id },
    });
  }

  byteTransfer() {
    const k: number = 1024;

    const sizes = ['B', 'K', 'M', 'G', 'T'];

    let i: number = 0;

    let str = '';
    if (this.size === 0) {
      return '';
    } else {
      i = Math.floor(Math.log(this.size) / Math.log(k));
    }
    str = (this.size / Math.pow(k, i)).toFixed(1) + sizes[i];

    return str;
  }
}
