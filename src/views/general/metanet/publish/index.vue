<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #urlTitle>
        <span>
          {{ t('url') }}
          <BasicHelp class="ml-2" :text="t('copyShare')" />
        </span>
      </template>
      <template #uri="{ record, text }">
        <Tooltip :title="t('copy')"
          ><a-button type="link" @click="copyUrl(text)"> {{ text }}</a-button></Tooltip
        >
      </template>
      <template #action="{ record }">
        <Dropdown>
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem>
                <a-button type="link" @click="openUpdateModal(record.publishId)">{{
                  t('publishUpdate')
                }}</a-button></MenuItem
              >
              <MenuItem v-if="record.name !== 'deleted'">
                <a-button
                  type="link"
                  color="error"
                  :pop="{ title: t('delButton') + ' ' + record.fullName + '?' }"
                  @click="del(record.publishId)"
                  >{{ t('delButton') }}</a-button
                ></MenuItem
              >
              <MenuItem>
                <a-button type="link">{{ t('setting') }}</a-button></MenuItem
              >
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #toolbar>
        <Button @click="changeInfo" type="link">
          <ExclamationCircleTwoTone
            :style="{ fontSize: '20px' }"
            :twoToneColor="`#${info.button ? '2E2EFE' : '6E6E6E'}`" />{{
        }}</Button>
      </template> </BasicTable
    ><FileInfo :info="info" />
    <UpdatePublishModal @register="registerUpdatePublishModal" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getBasicColumns } from './Data';
  import { BasicHelp } from '/@/components/Basic';

  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tooltip, Dropdown, Menu } from 'ant-design-vue';
  import { ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { useModal } from '/@/components/Modal';
  import UpdatePublishModal from './UpdatePublishModal.vue';
  import { NetGql, NetFile, Icon, FileInfo } from '/@/components/NetFile';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { Button } from '/@/components/Button';
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
      FileInfo,
      ExclamationCircleTwoTone,
      Dropdown,
      UpdatePublishModal,
      Button,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const info = ref({
        button: false,
        file: {},
        share: true,
      });

      function changeInfo() {
        info.value.button = !info.value.button;
      }

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            if (info.value.file.id == record.file.id && info.value.button) {
              info.value.file = {};
              return;
            }
            info.value.file = record.file;
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

      const { onResult: Publishs, refetch } = useQuery(NetGql.Publish.List, null, () => ({
        fetchPolicy: 'network-only',
      }));

      Publishs((res) => {
        const list = res.data?.driveListPublishs;
        let temp: any[] = [];
        list.forEach((v: any) => {
          let f = new NetFile(v.current);
          f.publishId = v.id;
          temp.push({
            txid: v.current.txid,
            version: v.current.id,
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
        let temp = `${window.location.origin}/#/p?txid=${txid}`;
        clipboardRef.value = temp;
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
          minHeight: 500,

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
        changeInfo,
        info,
      };
    },
  });
</script>
