<template>
  <div class="p-4">
    <Row>
      <Col :span="24 - span">
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
            <a-button type="primary" @click="refetch">{{ t('refresh') }}</a-button>
            <a-button type="link" @click="openInfo"
              ><InfoCircleOutlined :style="{ fontSize: '20px' }"
            /></a-button>
          </template> </BasicTable
      ></Col>
      <Col :span="span"><FileInfo :file="file" @close="closeInfo" /></Col>
    </Row>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import GIcon from '/@/components/Icon';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListFiles, driveListShares } from '/@/hooks/apollo/gqlFile';
  import { getBasicColumns } from './shareData';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useQuery } from '@vue/apollo-composable';
  import { BasicHelp } from '/@/components/Basic';
  import FileInfo from './FileInfo.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Tooltip, Row, Col, Dropdown, Menu } from 'ant-design-vue';
  import { InfoCircleOutlined } from '@ant-design/icons-vue';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      BasicTable,
      GIcon,
      BasicHelp,
      Tooltip,
      Row,
      Col,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      FileInfo,
      InfoCircleOutlined,
      Dropdown,
    },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const info = ref(false);
      const file = ref({}) as NetFile;
      const span = computed(() => {
        if (file.value.fullName === undefined) {
          return 0;
        }
        if (!info.value) {
          return 0;
        }
        return 8;
      });
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

      const { onError, onResult, refetch } = useQuery(driveListShares, null, () => ({
        fetchPolicy: 'network-only',
      }));
      onResult((res) => {
        const list = res?.data?.driveListShares;
        let temp: NetFile[] = [];
        list.forEach((v) => {
          if (v.userFile === null) {
            temp.push({
              name: 'deleted',
              shareId: v.id,
            });
            return;
          }
          let f = new NetFile(v);
          temp.push(f);
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
      function openInfo() {
        if (file.value.fullName === undefined) {
          createMessage.error(t('noChoose'));
        }
        info.value = !info.value;
      }
      function closeInfo() {
        info.value = false;
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
        span,
        file,
        openInfo,
        closeInfo,
      };
    },
  });
</script>
