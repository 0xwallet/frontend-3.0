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
                <a-button
                  type="link"
                  color="error"
                  :pop="{ title: t('delButton') + ' ' + record.fullName + '?' }"
                  @click="del(record)"
                  >{{ t('delButton') }}</a-button
                ></MenuItem
              >
              <MenuItem> <a-button type="link">分享设置</a-button></MenuItem>
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
      :title="file.fullName?.slice(-1)[0] || 'none'"
      placement="right"
      :visible="infoVisible"
      :getContainer="`.ant-card-body`"
      @close="closeInfo"
      :mask="false"
      :width="400"
      :wrapClassName="'!mt-50'"
      ><FileInfo :file="file"
    /></Drawer>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import GIcon from '/@/components/Icon';
  import { getBasicColumns } from './shareData';
  import { useQuery } from '@vue/apollo-composable';
  import { BasicHelp } from '/@/components/Basic';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tooltip, Drawer, Dropdown, Menu } from 'ant-design-vue';
  import { ExclamationCircleTwoTone } from '@ant-design/icons-vue';
  import { NetGql, NetFile, FileInfo } from '/@/components/NetFile';
  import { Button } from '/@/components/Button';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      GIcon,
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
        return infoButton.value && file.value.fullName !== undefined;
      });
      const file = ref({}) as NetFile;
      function closeInfo() {
        infoButton.value = false;
      }
      function changeInfo() {
        infoButton.value = !infoButton.value;
      }
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        customRow: (record) => ({
          onClick: () => {
            file.value = record;
            info.value = true;
          },
        }),
        pagination: false,
        title: t('share'),
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'shareId',
        showIndexColumn: false,
        scroll: { x: 1000, y: 1000 },
      });

      const { onResult, refetch } = useQuery(NetGql.Share.List, null, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult((res) => {
        const list = res?.data?.driveListShares;
        let temp: NetFile[] = [];
        list.forEach((v) => {
          if (v.userFile) {
            temp.push(new NetFile(v));
          }
          // if (v.userFile === null) {
          //   temp.push({
          //     name: 'deleted',
          //     shareId: v.id,
          //   });
          //   return;
          // }
        });
        tableData.value = temp;
      });

      // fetchData();
      // 删除分享
      async function del(record) {
        const f: NetFile = record;
        await f.delShare();
        fetchData();
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
      function copyUrl(record) {
        const f: NetFile = record;
        f.copyShareUrl(1);
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
        infoVisible,
        infoButton,
        file,
        closeInfo,
        changeInfo,
      };
    },
  });
</script>
