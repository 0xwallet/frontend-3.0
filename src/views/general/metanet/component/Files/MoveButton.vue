<template>
  <span>
    <Dropdown :trigger="['click']">
      <a-button type="primary"> {{ t('moveButton') }}<DownOutlined /> </a-button>
      <template #overlay>
        <Menu>
          <MenuItem @click="openCreateFileModal"> {{ t('file') }} </MenuItem>
          <MenuItem @click="openCreateFolderModal"> {{ t('folder') }} </MenuItem>
          <MenuItem @click="openImportFileModal"> {{ t('import') }} </MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </span>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import CreateFileModal from './Modal/CreateFileModal.vue';
  import CreateFolderModal from './Modal/CreateFolderModal.vue';
  import ImportFileModal from './Modal/ImportFileModal.vue';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      DownOutlined,
      Dropdown,
      Menu,
      MenuItem: Menu.Item,
      CreateFileModal,
      CreateFolderModal,
      ImportFileModal,
    },
    props: {
      path: {
        type: Array,
        default: [],
      },
    },
    emits: ['refetch'],
    setup(props, { emit }) {
      const [
        registerCreateFileModal,
        { openModal: openFileModal, setModalProps: setFileModal },
      ] = useModal();
      const [
        registerCreateFolderModal,
        { openModal: openFolderModal, setModalProps: setFolderModal },
      ] = useModal();
      const [registerImportFileModal, { openModal: openImportModal }] = useModal();

      function openCreateFileModal() {
        openFileModal(true, props.path, true);
        setFileModal({
          afterClose: () => {
            emit('refetch');
          },
        });
      }
      function openCreateFolderModal() {
        openFolderModal(true, props.path, true);
        setFolderModal({
          afterClose: () => {
            emit('refetch');
          },
        });
      }
      function openImportFileModal() {
        openImportModal(true);
      }
      return {
        openCreateFileModal,
        openCreateFolderModal,
        openImportFileModal,
        t,
        registerCreateFileModal,
        registerCreateFolderModal,
        registerImportFileModal,
      };
    },
  });
</script>
