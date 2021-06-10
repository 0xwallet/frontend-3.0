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
/**
 * 检查文件格式/大小并上传
 * @param  {File} file - 文件
 * @param  {string} path - 上传的目录(路径)
 * @param  {boolean} immediately - 是否立即上传
 */
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
  let secondPass = false;
  // 秒传接口,如果返回有hash(then成功,没hash会catch),就代表秒传成功
  useApollo({
    mode: 'mutate',
    gql: NetGql.Basic.Hash,
    variables: { hash, fullName: [...path, name] },
  })
    .then(() => {
      // 是否可以秒传
      secondPass = true;
      // console.log('upload-apollo-hashchech',res)
      // status = UploadResultStatus.SUCCESS;
      // percent = 100;
    })
    .catch(() => {
      // 是否可以秒传
      secondPass = false;
      // err Error: file hash not found
      // console.log('err',err)
    })
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
        secondPass
      };

      const fileStore = useNetFileStoreWidthOut();
      fileStore.appendItem(commonItem);
      // console.log('--fileStore',fileStore)
      if (immediately) {
        // 这里不提示 统一交给 ws 的事件监听
        // if (percent == 100) {
        //   createMessage.success(`${name} 上传成功`);
        //   // 目的是触发重新获取列表数据操作
        //   fileStore.setRefetch()
        //   return;
        // }
        fileStore.uploadApiByItem(commonItem);
      }
    });
}

export const NetUpload = {
  checkFile: checkFile,
};
