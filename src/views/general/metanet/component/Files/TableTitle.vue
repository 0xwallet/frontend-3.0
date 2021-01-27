<template>
  <span>
    <Dropdown :trigger="['click']">
      <a-button type="primary"> {{ t('create') }}<DownOutlined /> </a-button>
      <template #overlay>
        <Menu>
          <MenuItem @click="openCreateFolderModal"> {{ t('file') }} </MenuItem>
          <MenuItem @click="openCreateFolderModal"> {{ t('folder') }} </MenuItem>
          <MenuItem @click="openCreateFolderModal"> {{ t('import') }} </MenuItem>
        </Menu>
      </template>
    </Dropdown>
    <CreateFileModal @register="registerCreateFileModal" />
  </span>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Dropdown, Menu } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import CreateFileModal from './Modal/CreateFileModal.vue';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { DownOutlined, Dropdown, Menu, MenuItem: Menu.Item, CreateFileModal },
    setup() {
      const [registerCreateFileModal, { openModal }] = useModal();

      function openCreateFolderModal() {
        openModal(true);
      }
      return { openCreateFolderModal, t, registerCreateFileModal };
    },
  });
</script>
