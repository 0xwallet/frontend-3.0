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
    :showCancelBtn="false"
  >
    <template #closeIcon><MinusOutlined @click="closeModal" /></template>
    <template #centerFooter>
      <Space>
        <a-button @click="closeModal" type="primary">
          {{ t('cancelAll') }}
        </a-button>
        <!-- 弹窗里的上传按钮 -->
        <a-button
          @click="handleStartUpload"
          color="success"
          :disabled="!getIsSelectFile"
          :loading="isUploadingRef"
        >
        {{ t('uploadButton') }}
        </a-button>
      </Space>
    </template>
    <div class="upload-modal-toolbar">
      <!--      <Alert :message="getHelpText" type="info" banner class="upload-modal-toolbar__text"></Alert>-->
      <!--  单击或拖动文件到该区域以上传 -->
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
    <FileList :dataSource="fileList" :columns="columns" :actionColumn="actionColumn"> </FileList>
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

  import FileList from './FileList';
  //Apollo
  import { InboxOutlined, MinusOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNetFileStore } from '/@/store/modules/netFile';
  import { NetUpload } from '/@/components/NetFile';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicModal,
      Upload: Upload.Dragger,
      Alert,
      FileList,
      InboxOutlined,
      Space,
      MinusOutlined,
    },
    props: basicProps,
    setup(props, { emit }) {
      //   是否正在上传
      const fileStore = useNetFileStore();
      const isUploadingRef = ref(false);
      const fileListRef = ref<FileItem[]>([]);
      // fileStore 里的上传列表
      const fileList = computed(() => {
        return fileStore.getUploadList;
      });
      const state = reactive<{ fileList: FileItem[] }>({
        fileList: [],
      });
      let path: string[] = [];
      const [register, { closeModal }] = useModalInner((data) => {
        isUploadingRef.value = false;
        if (data.path) {
          path = [...unref(data.path)];
        }
      });

      const { accept, helpText, maxNumber, maxSize } = toRefs(props);
      const { getAccept, getStringAccept, getHelpText } = useUploadType({
        acceptRef: accept,
        helpTextRef: helpText,
        maxNumberRef: maxNumber,
        maxSizeRef: maxSize,
      });
      // console.log('--getStringAccept--',getStringAccept)

      const { createMessage } = useMessage();
      // fileStore.uploadList 里不是全部都是成功状态
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

      // 上传前校验
      function beforeUpload(file: File) {
        NetUpload.checkFile(file, path);
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

          // uploadFileList.forEach((item, index) => {
          //   setTimeout(() => {
          //     // 这里就是处理的事件
          //     console.log(index);
          //     fileStore.uploadApiByItem(item);
          //   }, 500 * index);
          // });
          // uploadFileList.forEach((item) => fileStore.uploadApiByItem(item));
          // 正在上传途中锁住loading
          await Promise.all(uploadFileList.map((item) => fileStore.uploadApiByItem(item)));

          isUploadingRef.value = false;
          console.log('上传完',fileList)
          // 生产环境:抛出错误
          // const errorList = data.filter((item: any) => !item.success);
          // if (errorList.length > 0) throw errorList;
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
        closeModal();
        return true;
      }

      function deleteAll() {
        fileStore.delAllItems();
      }
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
        deleteAll,
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
      align-items: flex-start;
      margin-bottom: 8px;

      &__btn {
        margin-left: 8px;
        text-align: right;
        flex: 1;
      }
    }
  }
</style>
