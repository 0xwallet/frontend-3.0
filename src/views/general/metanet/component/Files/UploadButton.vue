<template>
  <span>
    <Dropdown :trigger="['click']">
      <Button type="primary"> {{ t('uploadButton') }}<DownOutlined /> </Button>
      <template #overlay>
        <Menu>
          <MenuItem>
            <Upload :beforeUpload="beforeUpload" :showUploadList="false">
              <Button type="link">{{ t('file') }}</Button></Upload
            >
          </MenuItem>
          <MenuItem @click="openUploadModal">
            <Button type="link">{{ t('folder') }}</Button></MenuItem
          >
        </Menu>
      </template>
    </Dropdown>
    <UploadModal @register="registerUploadModal" />
  </span>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Dropdown, Menu, Upload } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import UploadModal from './upload/UploadModal.vue';
  import { NetUpload } from '/@/components/NetFile';
  import { propTypes } from '/@/utils/propTypes';
  import { Button } from '/@/components/Button';
  import { useNetFileStore } from '/@/store/modules/netFile';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      DownOutlined,
      Dropdown,
      Menu,
      MenuItem: Menu.Item,
      UploadModal,
      Upload,
      Button,
    },
    props: {
      path: propTypes.array,
    },

    setup(props) {
      const fileStore = useNetFileStore();
      const [registerUploadModal, { openModal, setModalProps }] = useModal();

      function openUploadModal() {
        const path = props.path.map((v) => {
          return v.name;
        });
        openModal(true, { path });
      }
      // async function beforeUpload(file) {
      function beforeUpload(file:File) {
        // 1. return false 取消默认的上传操作
        // 2. 执行自定义的上传操作
        // const path = props.path.map((v) => {
        //   return v.name;
        // });
        // // check 之后马上就传了
        // await NetUpload.checkFile(file, path, true);
        // check 之后马上就传了
        NetUpload.checkFile(file, props.path.map((v:any) => v.name), true);
        return false;
      }

      return {
        openUploadModal,
        t,
        registerUploadModal,
        beforeUpload,
      };
    },
  });
</script>
