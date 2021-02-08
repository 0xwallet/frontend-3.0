import { useApollo } from '/@/hooks/apollo/apollo';
import {
  driveCreateShare,
  driveDeleteFile,
  driveDeleteShare,
  driveCreatePublish,
  driveUploadByHash,
  drivePreviewToken,
} from '/@/hooks/apollo/gqlFile';
import { toLower } from 'lodash-es';
import { downloadByUrl } from '/@/utils/file/download';
import { createVNode, unref } from 'vue';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { Tooltip } from 'ant-design-vue';
import { createImgPreview } from '/@/components/Preview';
export const getGlobal = (): any => (typeof window !== 'undefined' ? window : global);
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import router from '/@/router';
import { PageEnum } from '/@/enums/pageEnum';
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
  user: { id: string } | null;
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
  user?: { id: string } | null;
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
  space: string;
  desc: string;
  userId?: string;
  public publishId?: number;

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
    this.createdAt = params.userFile.insertedAt;
    this.updatedAt = params.userFile.updatedAt;
    this.code = params.code;
    this.token = params.token || '';
    this.uri = params.uri || '';
    this.expiredAt = params.expiredAt;
    this.hash = params.userFile.hash;
    this.shareId = params.id;
    this.userId = params.user?.id || params.userFile?.user?.id || '';
  }

  // 文件下载
  async download() {
    if (this.type === 'folder') {
      return;
    }
    let token = this.token;
    if (token === '') {
      const res = await useApollo({
        mode: 'mutate',
        gql: drivePreviewToken,
      });
      token = res.data.drivePreviewToken;
    }
    let url = `https://drive-s.owaf.io/download/${this.userId}/${toLower(this.space)}/${this.id}/${
      this.fullName.slice(-1)[0]
    }?token=${token}`;
    downloadByUrl({
      url: url,
      target: '_blank',
    });
  }
  // 文件预览
  async preview(): Promise<any> {
    let token = this.token;
    if (token === '') {
      const res = await useApollo({
        mode: 'mutate',
        gql: drivePreviewToken,
      });
      token = res.data.drivePreviewToken;
    }
    return new Promise<any>((resolve) => {
      let url = `https://drive-s.owaf.io/preview/${this.userId}/${toLower(this.space)}/${this.id}/${
        this.fullName.slice(-1)[0]
      }?token=${token}`;
      if (this.type == 'png' || this.type == 'jpg') {
        createImgPreview({ imageList: [url] });
      }
      resolve(url);
    });
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
            gql: driveUploadByHash,
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

  commnet(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!CheckToken()) return;
    });
  }
  favorties(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!CheckToken()) return;
    });
  }

  publish() {
    createConfirm({
      iconType: 'warning',
      title: t('general.metanet.publishConfirm'),
      content: this.id,
      okText: t('general.metanet.yes'),
      onOk: () => {
        useApollo({ mode: 'mutate', gql: driveCreatePublish, variables: { id: this.id } }).then(
          (res) => {
            console.log(res);
          }
        );
      },
    });
    return;
  }

  // 文件分享
  share(code: string = ''): Promise<boolean> {
    return useApollo({
      mode: 'mutate',
      gql: driveCreateShare,
      variables: { code, userFileId: this.id },
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
      gql: driveDeleteShare,
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
  copyShareUrl(mode: number) {
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

    clipboardRef.value = temp;
    if (unref(copiedRef)) {
      createMessage.success(t('general.metanet.copySuccess'));
    }
  }
  // 删除文件
  delFile(): Promise<any> {
    return useApollo({
      mode: 'mutate',
      gql: driveDeleteFile,
      variables: { id: this.id, space: this.space },
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

  hashToStr() {
    if (this.hash === '' || this.hash === undefined) {
      return '';
    }
    const hash = this.hash;
    let list: any[] = [];
    for (let i = 1; i < 11; i++) {
      list.push(hash.slice(2 + 6 * (i - 1), 2 + 6 * i));
    }

    return (
      <Tooltip title={t('copy')}>
        {{
          default: () => {
            return (
              <span
                onClick={() => {
                  clipboardRef.value = hash;
                  if (unref(copiedRef)) {
                    createMessage.warning(t('copySuccess'));
                  }
                }}
              >
                {hash.slice(0, 2)}
                {list.map((value) => (
                  <span style={'background-color:#' + value}>&nbsp;&nbsp;&nbsp;</span>
                ))}
                {hash.slice(hash.length - 2, hash.length)}
              </span>
            );
          },
        }}
      </Tooltip>
    );
  }
}
