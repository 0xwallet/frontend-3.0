<template>
  <div>
    <BasicTable @register="registerTable">
      <template #uri="{ record, text }">
        <Tooltip :title="t('copy')"
          ><Button type="link" @click="copyUrl(text)"> {{ text }}</Button></Tooltip
        >
      </template>
      <template #version="{ record, text }">
        <Button type="link" @click="openVersionModal(record)">{{ text }}</Button>
      </template>
      <template #action="{ record }">
        <Dropdown>
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <!--              <MenuItem>-->
              <!--                <Button type="link" @click="openUpdateModal(record.publishId)">{{-->
              <!--                  t('publishUpdate')-->
              <!--                }}</Button></MenuItem-->
              <!--              >-->
              <MenuItem v-if="record.name !== 'deleted'">
                <Button
                  type="link"
                  color="error"
                  :pop="{ title: t('delButton') + ' ' + record.fullName + '?' }"
                  @click="del(record.publishId)"
                  >{{ t('delButton') }}</Button
                ></MenuItem
              >
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #toolbar>
        <Button @click="changeButton" type="link">
          <ExclamationCircleTwoTone
            :style="{ fontSize: '20px' }"
            :twoToneColor="`#${infoButton ? '2E2EFE' : '6E6E6E'}`" />{{
        }}</Button>
      </template>
    </BasicTable>
    <UpdatePublishModal @register="registerUpdatePublishModal" />
    <ChangeVersionModal @register="registerChangeVersionModal" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getBasicColumns } from './Data';
  import { BasicHelp } from '/@/components/Basic';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { Dropdown, Menu, Tooltip } from 'ant-design-vue';
  import { ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { useModal } from '/@/components/Modal';
  import UpdatePublishModal from './components/UpdatePublishModal.vue';
  import ChangeVersionModal from './components/changeVersionModal.vue';
  import { Icon, NetFile, NetGql } from '/@/components/NetFile';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { Button } from '/@/components/Button';
  import { fileStore } from '/@/store/modules/netFile';

  const { clipboardRef, copiedRef } = useCopyToClipboard();
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      Icon,
      BasicHelp,
      Tooltip,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      ExclamationCircleTwoTone,
      Dropdown,
      UpdatePublishModal,
      ChangeVersionModal,
      Button,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const infoButton = computed(() => fileStore.getFileInfo.button);

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            fileStore.setFileInfo({ file: record.file, mode: 'publish', collection: false });
          },
        }),
        pagination: false,
        title: t('publishTitle'),
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'publishId',
        showIndexColumn: false,
        scroll: { x: 1000, y: 1000 },
      });
      const [registerUpdatePublishModal, { openModal, setModalProps }] = useModal();
      const [
        registerChangeVersionModal,
        { openModal: openChangeVersionModal, setModalProps: setChangeVersionModal },
      ] = useModal();

      const { onResult: Publishs, refetch } = useQuery(NetGql.Publish.List, null, () => ({
        fetchPolicy: 'network-only',
      }));

      Publishs((res) => {
        const list = res.data?.driveListPublishs;
        let temp: any[] = [];
        list.forEach((v: any) => {
          let f = new NetFile(v.current);
          f.publishInfo.id = v.id;
          f.publishInfo.history = v.history;
          temp.push({
            txid: v.current.txid,
            version: v.current.version,
            history: v.history,
            publishId: v.id,
            file: f,
          });
        });
        tableData.value = temp;
      });
      const { mutate: DeletePublish, onDone } = useMutation(NetGql.Publish.Delete);
      onDone(() => {
        createMessage.success(t('publishDeleted'));
        refetch();
      });
      // 删除发布
      async function del(id: any) {
        await DeletePublish({ id });
      }

      const choose = computed(() => {
        return getSelectRowKeys().length !== 0;
      });

      function setSelectedRowKeyList() {
        if (getSelectRowKeys().length !== 0) {
          clearSelectedRowKeys();
          return;
        }
        let arr: string[] = [];
        for (let i = 0; i < getDataSource().length; i++) {
          arr.push(String(i));
        }
        setSelectedRowKeys(arr);
      }
      function clearSelect() {
        clearSelectedRowKeys();
      }
      function copyUrl(txid: string) {
        clipboardRef.value = `${window.location.origin}/#/p/file?txid=${txid}`;
        if (unref(copiedRef)) {
          createMessage.success(t('general.metanet.copySuccess'));
        }
        // f.copyPublishUrl();
        // f.copyShareUrl(5);
      }

      function openUpdateModal(publishId) {
        openModal(true, { publishId }, true);
        setModalProps({
          destroyOnClose: true,
          canFullscreen: false,
          afterClose: () => {
            refetch();
          },
        });
      }
      function openVersionModal(f: NetFile) {
        openChangeVersionModal(true, f, true);
        setChangeVersionModal({
          // destroyOnClose: true,
          canFullscreen: false,
          afterClose: () => {
            refetch();
          },
        });
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        clearSelect,
        choose,
        path,
        del,
        copyUrl,
        refetch,
        t,
        openUpdateModal,
        registerUpdatePublishModal,
        infoButton,
        changeButton: fileStore.changeButton,
        registerChangeVersionModal,
        openVersionModal,
      };
    },
  });
</script>
