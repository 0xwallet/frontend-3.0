<template>
  <div class="p-4">
    <BasicTable @register="registerTable">
      <template #name="{ record }">
        <GIcon
          :icon="record.type === 'folder' ? 'bx-bx-folder' : 'bx-bxs-file-' + record.type"
          size="30"
        >
        </GIcon>
        <a-button type="link" @click="openFile(record)"
          >{{ record.name }}{{ record.type === 'folder' ? '' : '.' + record.type }}</a-button
        >
      </template>

      <template #uri="{ record, text }">
        <a-button type="link" @click="copyUrl(record)"> {{ text }}</a-button>
      </template>
      <template #action="{ record }">
        <div>
          <a-button
            type="link"
            color="error"
            :pop="{ title: '删除' + record.fullName + '.' + record.type + '?' }"
            @click="del(record)"
            >删除</a-button
          ></div
        >
      </template>
      <template #toolbar>
        <a-button type="primary" @click="fetchData()"> 刷新</a-button>
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import GIcon from '/@/components/Icon';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListShares, driveDeleteShare } from '/@/hooks/apollo/gqlFile';
  import { getBasicColumns } from '/@/views/disk/share/shareData';
  import { File } from '/@/views/disk/type/file';

  export default defineComponent({
    components: { BasicTable, GIcon },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,

        title: '分享列表',
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'shareId',
        showIndexColumn: false,
      });
      function fetchData() {
        useApollo()
          .query({
            query: driveListShares,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            const list = res?.data?.driveListShares;
            let temp = [];
            list.forEach((v) => {
              let f = new File(v);
              temp.push(f);
            });
            tableData.value = temp;
            // console.log(data.driveListFiles);
          })
          .catch((err) => {
            console.log(err);
            createErrorModal({
              title: '错误',
              content: err.message,
            });
          });
      }

      fetchData();
      // 删除分享
      async function del(record) {
        const f: File = record;
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
        const f: File = record;
        f.copyShareUrl();
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        clearSelect,
        choose,
        path,
        del,
        copyUrl,
        fetchData,
      };
    },
  });
</script>
