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
          >{{ record.fullName }}{{ record.type === 'folder' ? '' : '.' + record.type }}</a-button
        >
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
    </BasicTable>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import GIcon from '/@/components/Icon/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListShares, driveDeleteShare } from '/@/hooks/apollo/gqlFile';
  import moment from 'moment';
  import { getBasicColumns } from '/@/views/disk/component/shareData';

  export default defineComponent({
    components: { BasicTable, GIcon },
    setup() {
      const { createMessage } = useMessage();
      const path = ref([]);
      const tableData = ref([]);
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource, reload },
      ] = useTable({
        canResize: false,
        title: '分享列表',
        dataSource: tableData,
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
      });

      function fetchData() {
        tableData.value = [];
        useApollo()
          .query({
            query: driveListShares,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            const list = res?.data?.driveListShares;
            list.forEach((v) => {
              tableData.value.push({
                shareId: v.id,
                id: v.userFile.id,
                fullName: v.userFile.fullName[v.userFile.fullName.length - 1].split('.')[0],
                type: v.userFile.fullName[v.userFile.fullName.length - 1].split('.')[1],
                hash: v.userFile.hash,
                size: v.userFile.info.size,
                uri: v.uri,
                token: v.token,
                code: v.code,
              });
            });
            console.log(tableData.value);
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

      function del(record) {
        useApollo()
          .mutate({
            mutation: driveDeleteShare,
            variables: {
              id: record.shareId,
            },
          })
          .finally(() => {
            fetchData();
          });
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

      return {
        registerTable,
        setSelectedRowKeyList,
        clearSelect,
        choose,
        path,
        reload,
        del,
      };
    },
  });
</script>
