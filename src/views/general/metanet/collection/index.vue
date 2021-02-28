<template>
  <div>
    <BasicTable @register="registerTable">
      <template #urlTitle>
        <span>
          {{ t('url') }}
          <BasicHelp class="ml-2" :text="t('copyShare')" />
        </span>
      </template>
      <template #uri="{ record, text }">
        <Tooltip :title="t('copy')"
          ><a-button type="link" @click="copyUrl(record)"> {{ text }}</a-button></Tooltip
        >
      </template>
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
        <Button @click="changeInfo" type="link">
          <ExclamationCircleTwoTone
            :style="{ fontSize: '20px' }"
            :twoToneColor="`#${infoButton ? '2E2EFE' : '6E6E6E'}`" />{{
        }}</Button>
      </template>
    </BasicTable>

    <Drawer
      placement="right"
      :visible="infoVisible"
      :getContainer="`.ant-card-body`"
      @close="closeInfo"
      :mask="false"
      :width="400"
      :wrapClassName="'!mt-50'"
    >
      <template #title>
        <span @click="copyUrl(file, 4)">{{
          file.item?.userFile?.fullName?.slice(-1)[0] || 'none'
        }}</span>
      </template>
      <FileInfo :file="file"
    /></Drawer>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, createVNode } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getBasicColumns } from './Data';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { BasicHelp } from '/@/components/Basic';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FileInfo from './FileInfo.vue';
  import { Tooltip, Drawer, Dropdown, Menu, Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined, ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { NetGql, NetFile } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      BasicHelp,
      Tooltip,
      Drawer,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      FileInfo,
      ExclamationCircleTwoTone,
      Dropdown,
      Button,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const infoButton = ref(false);
      const infoVisible = computed(() => {
        return infoButton.value && file.value.id !== undefined;
      });
      const file = ref({});
      function closeInfo() {
        infoButton.value = false;
      }
      function changeInfo() {
        infoButton.value = !infoButton.value;
      }
      const [registerTable] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            if (file.value.id == record.id && infoVisible.value) {
              infoButton.value = false;
              return;
            }
            file.value = record;
            infoButton.value = true;
          },
        }),
        pagination: false,
        title: t('share'),
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        scroll: { x: 1000, y: window.innerHeight * 0.7 },
      });

      const { onResult, refetch } = useQuery(NetGql.Collection.List, null, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult((res) => {
        const list = res?.data?.driveListCollections;
        console.log(list);
        tableData.value = list;
      });
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
        infoVisible,
        infoButton,
        file,
        closeInfo,
        changeInfo,
      };
    },
  });
</script>
