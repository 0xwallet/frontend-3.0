<template>
  <Dropdown :trigger="['click']">
    <a-button type="primary"> Hover me<DownOutlined /> </a-button>
    <template #overlay>
      <Menu>
        <MenuItem @click="openCreateFolderModal"> {{ t('file') }} , {{ t('folder') }} </MenuItem>
        <MenuItem> {{ t('text') }} , {{ t('markdown') }}</MenuItem>
        <MenuItem>{{ t('hash') }} , {{ t('txid') }} </MenuItem>
      </Menu>
    </template>
  </Dropdown>
  <CreateFolderModal @register="registerCreateFolder" />
</template>

<script>
  import { defineComponent, nextTick } from 'vue';
  import { Dropdown, Menu, Divider } from 'ant-design-vue';
  import { DownOutlined } from '@ant-design/icons-vue';
  import CreateFolderModal from './CreateFolderModal.vue';
  import { useModal } from '/@/components/Modal';
  import { propTypes } from '/@/utils/propTypes';

  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'DropdownButton',
    components: { Dropdown, DownOutlined, Menu, MenuItem: Menu.Item, Divider, CreateFolderModal },
    props: {
      folder: propTypes.array,
      dirId: propTypes.string,
    },
    setup(props, { emit }) {
      const [
        registerCreateFolder,
        { openModal: openModal1, setModalProps: setModal1 },
      ] = useModal();
      function openCreateFolderModal() {
        console.log(props.dirId);
        openModal1(true, { folder: props.folder, dirId: props.dirId });
        nextTick(() => {
          setModal1({
            canFullscreen: false,
            destroyOnClose: true,
            afterClose: () => {
              emit('fetchData', { dirId: props.dirId });
              // fetchData({ dirId });
            },
          });
        });
      }
      return { t, registerCreateFolder, openCreateFolderModal };
    },
  });
</script>

<style scoped></style>
