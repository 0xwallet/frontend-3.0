<template>
  <BasicModal
    width="800px"
    :title="t('uploadButton')"
    v-bind="$attrs"
    @register="register"
    :closeFunc="handleCloseFunc"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="upload-modal"
    :showOkBtn="false"
    :okButtonProps="getOkButtonProps"
    :cancelButtonProps="{ disabled: isUploadingRef }"
  >
    <template #centerdFooter>
      <a-button
        @click="handleStartUpload"
        color="success"
        :disabled="!getIsSelectFile"
        :loading="isUploadingRef"
      >
        {{ getUploadBtnText }}
      </a-button>
    </template>
    <div class="upload-modal-toolbar">
      <Alert :message="getHelpText" type="info" banner class="upload-modal-toolbar__text"></Alert>
      <Upload
        :accept="getStringAccept"
        :multiple="multiple"
        :before-upload="beforeUpload"
        class="upload-modal-toolbar__btn"
      >
        <a-button type="primary"> {{ t('select') }} {{ t('file') }}</a-button>
      </Upload>
    </div>
    <FileList :dataSource="fileListRef" :columns="columns" :actionColumn="actionColumn" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, toRefs, unref, computed } from 'vue';
  import { Upload, Alert } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  //   import { BasicTable, useTable } from '/@/components/Table';
  // hooks
  import { useUploadType } from './useUpload';
  import { useMessage } from '/@/hooks/web/useMessage';
  //   types
  import { FileItem, UploadResultStatus } from './types';
  import { basicProps } from './props';
  import { createTableColumns, createActionColumn } from './data';
  // utils
  import { checkFileType, checkImgType, getBase64WithFile } from './utils';
  import { buildUUID } from '/@/utils/uuid';
  import { createImgPreview } from '/@/components/Preview/index';

  import FileList from './FileList';
  //Apollo

  import { useApollo } from '/@/hooks/apollo/apollo';

  import { driveUploadByHash } from '/@/hooks/apollo/gqlFile';
  import { encode } from '@msgpack/msgpack';
  import { useMClient } from '/@/hooks/nkn/getNKN';
  import CryptoES from 'crypto-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, Upload, Alert, FileList },
    props: basicProps,
    setup(props, { emit }) {
      //   是否正在上传
      const isUploadingRef = ref(false);
      const fileListRef = ref<FileItem[]>([]);
      const state = reactive<{ fileList: FileItem[] }>({
        fileList: [],
      });
      let path = [];

      const [register, { closeModal }] = useModalInner((data) => {
        // path.value = data.path;

        path = [...unref(data.path)];
      });

      const { accept, helpText, maxNumber, maxSize } = toRefs(props);
      const { getAccept, getStringAccept, getHelpText } = useUploadType({
        acceptRef: accept,
        helpTextRef: helpText,
        maxNumberRef: maxNumber,
        maxSizeRef: maxSize,
      });

      const { createMessage } = useMessage();

      const getIsSelectFile = computed(() => {
        return (
          fileListRef.value.length > 0 &&
          !fileListRef.value.every((item) => item.status === UploadResultStatus.SUCCESS)
        );
      });

      const getOkButtonProps = computed(() => {
        const someSuccess = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.SUCCESS
        );
        return {
          disabled: isUploadingRef.value || fileListRef.value.length === 0 || !someSuccess,
        };
      });

      const getUploadBtnText = computed(() => {
        const someError = fileListRef.value.some(
          (item) => item.status === UploadResultStatus.ERROR
        );
        return isUploadingRef.value
          ? t('uploading')
          : someError
          ? t('reUpload')
          : t('uploadButton');
      });

      // 上传前校验
      function beforeUpload(file: File) {
        const { size, name } = file;
        const { maxSize } = props;
        const accept = unref(getAccept);
        // 设置类型,则判断
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
        file.arrayBuffer().then((res) => {
          let wordArray = CryptoES.lib.WordArray.create(res);
          hash = CryptoES.SHA256(wordArray).toString();
          let status = '';

          useApollo()
            .mutate({
              mutation: driveUploadByHash,
              variables: {
                fullName: [...path, name],
                hash: hash,
              },
            })
            .then(() => {
              status = 'success';
            })
            .catch((err) => {})
            .finally(() => {
              const commonItem = {
                uuid: buildUUID(),
                file,
                size,
                name,
                hash,
                percent: 0,
                type: name.split('.').pop(),
                status,
              };
              // 生成图片缩略图
              if (checkImgType(file)) {
                // beforeUpload，如果异步会调用自带上传方法
                // file.thumbUrl = await getBase64(file);
                getBase64WithFile(file).then(({ result: thumbUrl }) => {
                  fileListRef.value = [
                    ...unref(fileListRef),
                    {
                      thumbUrl,
                      ...commonItem,
                    },
                  ];
                });
              } else {
                fileListRef.value = [...unref(fileListRef), commonItem];
              }
            });
        });

        return false;
      }
      // 删除
      function handleRemove(record: FileItem) {
        const index = fileListRef.value.findIndex((item) => item.uuid === record.uuid);
        index !== -1 && fileListRef.value.splice(index, 1);
      }

      // 预览
      function handlePreview(record: FileItem) {
        const { thumbUrl = '' } = record;
        console.log(thumbUrl);
        createImgPreview({
          imageList: [thumbUrl],
        });
      }

      const numBytes = 16 << 20;
      const writeChunkSize = 1024;
      async function uploadApiByItem(item: FileItem) {
        try {
          // 获取client session
          const session = await useMClient();

          const object = {
            File: new Uint8Array(await item.file.arrayBuffer()),
            FullName: [...path, item.name],
            FileSize: item.size,
            UserId: localStorage.getItem('uid'),
            Space: 'PRIVATE',
            Description: '',
          };
          item.status = UploadResultStatus.UPLOADING;
          let timeStart = Date.now();
          const encoded: Uint8Array = encode(object);
          let buffer = new ArrayBuffer(4);
          let dv = new DataView(buffer);
          dv.setUint32(0, encoded.length, true);
          await session.write(new Uint8Array(buffer));
          let buf!: Uint8Array;
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
              item.percent = (((n + buf.length) / item.size) * 100) | 0;
              let speed: number | string =
                ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000;

              if (speed > 0.9) {
                speed = speed.toFixed(2) + ' MB/s';
              } else if (speed * 1000 > 0.9) {
                speed = (speed * 1000).toFixed(2) + 'KB/s';
              } else {
                speed = (speed * 1000 * 1000).toFixed(2) + 'B/s';
              }
              item.status = speed;

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
          item.status = UploadResultStatus.SUCCESS;
          return {
            success: true,
            error: null,
          };
        } catch (e) {
          console.log(e);
          item.status = UploadResultStatus.ERROR;
          return {
            success: false,
            error: e,
          };
        }
      }

      async function write(session, numBytes) {
        let timeStart = Date.now();
        let buffer = new ArrayBuffer(4);
        let dv = new DataView(buffer);
        dv.setUint32(0, numBytes, true);
        await session.write(new Uint8Array(buffer));
        let buf;
        for (let n = 0; n < numBytes; n += buf.length) {
          buf = new Uint8Array(Math.min(numBytes - n, writeChunkSize));
          for (let i = 0; i < buf.length; i++) {
            buf[i] = byteAt(n + i);
          }
          await session.write(buf);
          if (Math.floor(((n + buf.length) * 10) / numBytes) !== Math.floor((n * 10) / numBytes)) {
            console.log(
              session.localAddr,
              'sent',
              n + buf.length,
              'bytes',
              ((n + buf.length) / (1 << 20) / (Date.now() - timeStart)) * 1000,
              'MB/s'
            );
          }
        }
        console.log(
          session.localAddr,
          'finished sending',
          numBytes,
          'bytes',
          (numBytes / (1 << 20) / (Date.now() - timeStart)) * 1000,
          'MB/s'
        );
      }

      function byteAt(n) {
        return n % 256;
      }

      // 点击开始上传
      async function handleStartUpload() {
        const { maxNumber } = props;
        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(`最多只能上传${maxNumber}个文件`);
        }
        try {
          isUploadingRef.value = true;
          // 只上传不是成功状态的
          const uploadFileList =
            fileListRef.value.filter((item) => item.status !== UploadResultStatus.SUCCESS) || [];
          const data = await Promise.all(
            uploadFileList.map((item) => {
              return uploadApiByItem(item);
            })
          );
          isUploadingRef.value = false;
          // 生产环境:抛出错误
          const errorList = data.filter((item: any) => !item.success);
          if (errorList.length > 0) throw errorList;
        } catch (e) {
          isUploadingRef.value = false;
          throw e;
        }
      }

      //   点击保存
      function handleOk() {
        const { maxNumber } = props;

        if (fileListRef.value.length > maxNumber) {
          return createMessage.warning(`最多只能上传${maxNumber}个文件`);
        }
        if (isUploadingRef.value) {
          return createMessage.warning('请等待文件上传后，保存');
        }
        const fileList: string[] = [];

        for (const item of fileListRef.value) {
          const { status, responseData } = item;
          if (status === UploadResultStatus.SUCCESS && responseData) {
            fileList.push(responseData.url);
          }
        }
        // 存在一个上传成功的即可保存
        if (fileList.length <= 0) {
          return createMessage.warning('没有上传成功的文件，无法保存');
        }
        fileListRef.value = [];
        closeModal();
        emit('change', fileList);
      }

      // 点击关闭：则所有操作不保存，包括上传的
      function handleCloseFunc() {
        if (!isUploadingRef.value) {
          fileListRef.value = [];
          return true;
        } else {
          createMessage.warning('请等待文件上传结束后操作');
          return false;
        }
      }

      //   const [registerTable] = useTable({
      //     columns: createTableColumns(),
      //     actionColumn: createActionColumn(handleRemove, handlePreview),
      //     pagination: false,
      //     inset: true,
      //     scroll: {
      //       y: 3000,
      //     },
      //   });
      return {
        columns: createTableColumns(),
        actionColumn: createActionColumn(handleRemove, handlePreview),
        register,
        closeModal,
        getHelpText,
        getStringAccept,
        getOkButtonProps,
        beforeUpload,
        // registerTable,
        fileListRef,
        state,
        isUploadingRef,
        handleStartUpload,
        handleOk,
        handleCloseFunc,
        getIsSelectFile,
        getUploadBtnText,
        t,
      };
    },
  });
</script>
<style lang="less">
  .upload-modal {
    .ant-upload-list {
      display: none;
    }

    .ant-table-wrapper .ant-spin-nested-loading {
      padding: 0;
    }

    &-toolbar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      &__btn {
        margin-left: 8px;
        text-align: right;
        flex: 1;
      }
    }
  }
</style>
