import { checkFileType } from '/@/views/general/metanet/component/Files/upload/utils';
import { useMessage } from '/@/hooks/web/useMessage';
import CryptoJS from 'crypto-js';
import {
  FileItem,
  UploadResultStatus,
} from '/@/views/general/metanet/component/Files/upload/types';
import { buildUUID } from '/@/utils/uuid';
import { useNetFileStoreWidthOut } from '/@/store/modules/netFile';
import { useApollo } from '/@/hooks/apollo/apollo';
import { NetGql } from '/@/components/NetFile/gql';
const { createMessage } = useMessage();
const maxSize = 20;
const accept: string[] = [];

async function checkFile(file: File, path: string[] = [], immediately: boolean = false) {
  // 设置类型,则判断
  const { size, name } = file;
  if (accept.length > 0 && !checkFileType(file, accept)) {
    createMessage.error!(`只能上传${accept.join(',')}格式文件`);
    return false;
  }
  // 设置最大值，则判断
  if (maxSize && file.size / 1024 / 1024 >= maxSize) {
    createMessage.error(`只能上传不超过${maxSize}MB的文件!`);
    return false;
  }

  let hash = '';
  let status = '';
  let percent = 0;
  const data = await file.arrayBuffer();
  // @ts-ignore
  let wordArray = CryptoJS.lib.WordArray.create(data);
  hash = CryptoJS.SHA256(wordArray).toString();
  useApollo({
    mode: 'mutate',
    gql: NetGql.Basic.Hash,
    variables: { hash, fullName: [...path, name] },
  })
    .then(() => {
      status = UploadResultStatus.SUCCESS;
      percent = 100;
    })
    .catch(() => {})
    .finally(() => {
      const commonItem: FileItem = {
        uuid: buildUUID(),
        file,
        size,
        name,
        hash,
        percent,
        speed: 0,
        type: name.split('.').pop(),
        status,
        thumbUrl: '',
        path,
      };

      const fileStore = useNetFileStoreWidthOut();
      fileStore.appendItem(commonItem);
      if (immediately) {
        if (percent == 100) {
          createMessage.success(`${name} 上传成功`);
          return;
        }
        fileStore.uploadApiByItem(commonItem);
      }
    });
}

export const NetUpload = {
  checkFile: checkFile,
};
