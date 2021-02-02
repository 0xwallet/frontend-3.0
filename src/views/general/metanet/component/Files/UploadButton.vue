<template>
  <span>
    <Dropdown :trigger="['click']">
      <a-button type="primary"> {{ t('uploadButton') }}<DownOutlined /> </a-button>
      <template #overlay>
        <Menu>
          <MenuItem @click="openUploadModal">
            {{ t('file') }}
          </MenuItem>
          <MenuItem> {{ t('folder') }}</MenuItem>
        </Menu>
      </template>
    </Dropdown>
    <UploadModal @register="registerUploadModal" />
  </span>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import UploadModal from './upload/UploadModal.vue';

  import Mitt from '/@/utils/mitt';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      DownOutlined,
      Dropdown,
      Menu,
      MenuItem: Menu.Item,
      UploadModal,
    },
    emits: ['refetch'],
    setup(_, { emit }) {
      const [registerUploadModal, { openModal, setModalProps }] = useModal();

      function openUploadModal() {
        openModal(true);
        setModalProps({
          afterClose: () => {
            emit('refetch');
          },
        });
      }
      const mitt = new Mitt();
      mitt.on('foo', (e) => console.log('foo', e));

      return {
        openUploadModal,
        t,
        registerUploadModal,
      };
    },
  });
</script>
