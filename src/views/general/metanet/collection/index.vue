<template>
  <div>
    <BasicTable @register="registerTable">
      <template #action="{ record }">
        <Dropdown>
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem v-if="record.name !== 'deleted'">
                <a-button type="link" color="error" @click="del(record)">{{
                  t('delButton')
                }}</a-button></MenuItem
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


  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, createVNode, computed } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getBasicColumns } from './Data';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tooltip, Drawer, Dropdown, Menu, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined, ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { NetGql, NetFile } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';
  import {fileStore} from "/@/store/modules/netFile";

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      Tooltip,
      Drawer,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      ExclamationCircleTwoTone,
      Dropdown,
      Button,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = computed(() => shareData.value.concat(publishData.value));
      const shareData = ref([]);
      const publishData = ref([]);
      const infoButton=computed(()=>fileStore.getFileInfo.button)
      const [registerTable] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            fileStore.setFileInfo({file:record.file, mode:'share'})
          },
        }),
        pagination: false,
        title: t('collectionTitle'),
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        scroll: { x: 1000, y: window.innerHeight * 0.7 },
      });

      const { onResult: shareList, refetch: reloadShare } = useQuery(
        NetGql.Collection.List,
        { type: 'SHARE' },
        () => ({
          fetchPolicy: 'network-only',
        })
      );
      shareList((res) => {
        let list = res?.data?.driveListCollections;
        let t: [] = [];
        list.forEach((v) => {
          if (!v.item) return;
          t.push({ file: new NetFile(v.item), ...v });
        });
        shareData.value = t;
      });
      const { onResult: publishList, refetch: reloadPublish } = useQuery(
        NetGql.Collection.List,
        { type: 'PUBLISH' },
        () => ({
          fetchPolicy: 'network-only',
        })
      );
      publishList((res) => {
        let list = res?.data?.driveListCollections;
        let t: [] = [];
        list.forEach((v) => {
          if (!v.item) return;
          t.push({ file: new NetFile(v.item.current), ...v });
        });
        publishData.value = t;
        // tableData.value = t;
      });

      function refetch() {
        reloadShare();
        reloadPublish();
      }

      const { mutate: DelCollection } = useMutation(NetGql.Collection.Delete);

      // fetchData();
      // 删除收藏
      async function del(record: any) {
        Modal.confirm({
          title: t('error'),
          icon: createVNode(ExclamationCircleOutlined),
          content: t('delButton') + ' ' + record.item.fullName + '?',
          centered: true,
          okText: t('yes'),
          cancelText: t('cancelAll'),
          onOk() {
            DelCollection({ id: record.id })
              .then(() => {
                createMessage.success('删除成功');
              })
              .finally(() => {
                refetch();
              });
          },
        });
      }

      function copyUrl(record, mode = 1) {
        const f: NetFile = record?.item;
        f.copyShareUrl(mode);
      }

      return {
        registerTable,
        path,
        del,
        copyUrl,
        refetch,
        t,
        infoButton,
        changeButton:fileStore.changeButton,
        tableData,
      };
    },
  });
</script>
