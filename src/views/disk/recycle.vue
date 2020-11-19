<template>
  <div class="p-4">
    <BreadCrumb :path="path" />
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
      <template #action="{ record }">
        <div>
          <a-button type="link">详情</a-button>
          <a-button type="link">恢复</a-button>
          <a-button type="link">彻底删除</a-button>
        </div>
      </template>
      <template #toolbar>
        <a-button type="primary" @click="setSelectedRowKeyList">
          {{ !choose ? '全选' : '取消' }}
        </a-button>
        <a-button type="primary" v-show="choose"> 恢复 </a-button>
        <a-button type="primary" v-show="choose"> 彻底删除 </a-button>
        <a-button type="primary" @click="reload"> 刷新 </a-button>
      </template></BasicTable
    >
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { demoListApi } from '/@/api/demo/table';
  import BreadCrumb from './component/BreadCrumb.vue';
  import GIcon from '/@/components/Icon/index';
  export default defineComponent({
    components: { BasicTable, BreadCrumb, GIcon },
    setup() {
      const { createMessage } = useMessage();
      const path = ref([]);

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource, reload },
      ] = useTable({
        canResize: false,
        title: '文件列表',
        api: demoListApi,
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        rowSelection: {
          type: 'checkbox',
        },
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
