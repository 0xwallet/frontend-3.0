<template>
  <BasicModal
    width="80%"
    :height="700"
    :title="t('uploadButton')"
    v-bind="$attrs"
    @register="register"
    @ok="handleOk"
    :closeFunc="handleCloseFunc"
    :maskClosable="false"
    :keyboard="false"
    wrapClassName="upload-modal"
    :showOkBtn="false"
    :okButtonProps="getOkButtonProps"
    :cancelButtonProps="{ disabled: isUploadingRef }"
  >
    <template #centerFooter>
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
        <Space>
          <InboxOutlined :style="{ fontSize: '32px' }" /><a-button type="primary">
            {{ t('drag') }}</a-button
          ></Space
        >
      </Upload>
    </div>
    <FileList :dataSource="fileList" :columns="columns" :actionColumn="actionColumn" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, reactive, ref, toRefs, unref, computed } from 'vue';
  import { Upload, Alert, Space } from 'ant-design-vue';
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

  import FileList from './FileList';
  //Apollo
  import { InboxOutlined } from '@ant-design/icons-vue';
  import { driveUploadByHash } from '/@/hooks/apollo/gqlFile';
  import CryptoES from 'crypto-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { fileStore } from '/@/store/modules/netFile';
  import { useMutation } from '@vue/apollo-composable';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicModal, Upload: Upload.Dragger, Alert, FileList, InboxOutlined, Space },
    props: basicProps,
    setup(props, { emit }) {
      //   是否正在上传
      const isUploadingRef = ref(false);
      const fileListRef = ref<FileItem[]>([]);
      const fileList = computed(() => {
        return fileStore.getUploadList;
      });
      const state = reactive<{ fileList: FileItem[] }>({
        fileList: [],
      });
      let path: string[] = [];
      const [register, { closeModal }] = useModalInner((data) => {
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
          fileStore.getUploadList.length > 0 &&
          !fileStore.getUploadList.every((item) => item.status === UploadResultStatus.SUCCESS)
        );
      });

      const getOkButtonProps = computed(() => {
        const someSuccess = fileStore.getUploadList.some(
          (item) => item.status === UploadResultStatus.SUCCESS
        );

        return {
          disabled: isUploadingRef.value || fileStore.getUploadList.length === 0 || !someSuccess,
        };
      });

      const getUploadBtnText = computed(() => {
        const someError = fileStore.getUploadList.some(
          (item) => item.status === UploadResultStatus.ERROR
        );
        return isUploadingRef.value
          ? t('uploading')
          : someError
          ? t('reUpload')
          : t('uploadButton');
      });
      const { mutate: UploadByHash } = useMutation(driveUploadByHash);

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
          let percent = 0;
          UploadByHash({
            fullName: [...path, name],
            hash: hash,
          })
            .then(() => {
              status = UploadResultStatus.SUCCESS;
              percent = 100;
            })
            .catch((err) => {})
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
              };
              // 生成图片缩略图
              if (checkImgType(file)) {
                // beforeUpload，如果异步会调用自带上传方法
                // file.thumbUrl = await getBase64(file);
                getBase64WithFile(file).then(({ result: thumbUrl }) => {
                  commonItem.thumbUrl = thumbUrl;
                });
              }
              fileStore.addItem(commonItem);
            });
        });

        return false;
      }
      // 删除
      function handleRemove(record: FileItem) {
        const index = fileStore.getUploadList.findIndex((item) => item.uuid === record.uuid);
        index !== -1 && fileStore.delItem(index);
      }

      // 点击开始上传
      async function handleStartUpload() {
        const { maxNumber } = props;
        if (fileStore.getUploadList.length > maxNumber) {
          return createMessage.warning(`最多只能上传${maxNumber}个文件`);
        }
        try {
          isUploadingRef.value = true;
          // 只上传不是成功状态的
          const uploadFileList =
            fileStore.getUploadList.filter((item) => item.status !== UploadResultStatus.SUCCESS) ||
            [];
          const data = await Promise.all(
            uploadFileList.map((item) => {
              return fileStore.uploadApiByItem(item, path);
              // return uploadApiByItem(item);
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

        if (fileStore.getUploadList.length > maxNumber) {
          return createMessage.warning(`最多只能上传${maxNumber}个文件`);
        }
        if (isUploadingRef.value) {
          return createMessage.warning('请等待文件上传后，保存');
        }
        const fileList: string[] = [];

        for (const item of fileStore.getUploadList) {
          const { status, responseData } = item;
          if (status === UploadResultStatus.SUCCESS && responseData) {
            fileList.push(responseData.url);
          }
        }
        // 存在一个上传成功的即可保存
        if (fileList.length <= 0) {
          return createMessage.warning('没有上传成功的文件，无法保存');
        }
        // fileStore.getUploadList = [];
        closeModal();
        emit('change', fileList);
      }

      // 点击关闭：则所有操作不保存，包括上传的
      function handleCloseFunc() {
        return true;
        // if (!isUploadingRef.value) {
        //   fileListRef.value = [];
        // } else {
        //   createMessage.warning('请等待文件上传结束后操作');
        //   return false;
        // }
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
        actionColumn: createActionColumn(handleRemove),
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
        fileList,
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

    .upload {
      vertical-align: top;
    }

    &-toolbar {
      display: flex;
      align-items: start;
      margin-bottom: 8px;

      &__btn {
        margin-left: 8px;
        text-align: right;
        flex: 1;
      }
    }
  }
</style>
