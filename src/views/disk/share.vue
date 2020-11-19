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
      </template></BasicTable
    >
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { BasicColumn, BasicTable, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { demoShareList } from '/@/api/demo/table';
  import GIcon from '/@/components/Icon/index';
  import { byteTransfer } from '/@/utils/disk/file';

  function getBasicColumns(): BasicColumn[] {
    return [
      {
        title: '文件名',
        dataIndex: 'name',
        width: 400,
        align: 'left',
        slots: { customRender: 'name' },
      },
      {
        title: '状态',
        fixed: 'right',
        dataIndex: 'status',
        customRender: ({ text }) => {
          if (Number(text) === 0) {
            return '已过期';
          }

          return '';
        },
      },

      {
        title: '大小',
        dataIndex: 'size',
        width: 80,
        fixed: 'right',
        customRender: ({ text }) => {
          return byteTransfer(text);
        },
      },

      {
        title: '时间',
        dataIndex: 'createAt',
        fixed: 'right',
      },
      {
        title: '到期',
        dataIndex: 'time',
        fixed: 'right',
      },
    ];
  }
  export default defineComponent({
    components: { BasicTable, GIcon },
    setup() {
      const { createMessage } = useMessage();
      const path = ref([]);

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource, reload },
      ] = useTable({
        canResize: false,
        title: '分享列表',
        api: demoShareList,
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
      });
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

      function openFile(file) {
        console.log(file);
        if (file.type === 'folder') {
          path.value.push(file.name);
        }
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        clearSelect,
        choose,
        path,
        openFile,
        reload,
      };
    },
  });
</script>
