<template>
  <span>
    <Dropdown :trigger="['click']">
      <a-button type="primary"> {{ t('uploadButton') }}<DownOutlined /> </a-button>
      <template #overlay>
        <Menu>
          <MenuItem>
            <Upload :before-upload="beforeUpload" :showUploadList="false">
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
    emits: ['refetch'],
    setup(props, { emit }) {
      const [registerUploadModal, { openModal, setModalProps }] = useModal();

      function openUploadModal() {
        openModal(true);
        setModalProps({
          afterClose: () => {
            emit('refetch');
          },
        });
      }
      async function beforeUpload(file) {
        const path = props.path.map((v) => {
          return v.name;
        });
        await NetUpload.checkFile(file, path, true);

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
