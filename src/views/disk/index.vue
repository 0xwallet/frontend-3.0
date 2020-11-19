<template>
  <div class="p-4">
    <BreadCrumb :path="path" />
    <!--    <UploadFile />-->
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
          <a-button type="link">详情</a-button>
          <a-button type="link">重命名</a-button>
          <a-button type="link">复制路径</a-button>
          <a-button type="link">下载</a-button>
          <a-button
            type="link"
            color="error"
            :pop="{ title: '删除' + record.fullName + '?' }"
            @click="del(record)"
            >删除</a-button
          ></div
        >
      </template>
      <template #toolbar>
        <a-button type="primary" @click="setSelectedRowKeyList">
          {{ !choose ? '全选' : '取消' }}
        </a-button>
        <a-button type="primary" v-show="choose"> 删除 </a-button>
        <a-button type="primary" v-show="choose"> 下载 </a-button>
        <a-button type="primary" v-show="!choose" @click="openMoveModal"> 移动 </a-button>
        <a-button type="primary" v-show="choose"> 分享 </a-button>
        <UploadFile />
        <a-button type="primary"> 上传文件夹 </a-button>
        <a-button type="primary" @click="openCreateFolderModal"> 新建文件夹 </a-button>
        <a-button type="primary" @click="reload"> 刷新 </a-button>
      </template></BasicTable
    >
    <CreateFolderModal @register="registerCreateFolder" />
    <MoveModal @register="registerMoveModal" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, nextTick } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import BreadCrumb from './component/BreadCrumb.vue';
  import UploadFile from './component/Upload.vue';
  import CreateFolderModal from './component/CreateFolderModal.vue';
  import MoveModal from './component/MoveModal.vue';
  import GIcon from '/@/components/Icon/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListFiles, driveDeleteFile } from '/@/hooks/apollo/gqlFile';
  import { useModal } from '/@/components/Modal';
  import moment from 'moment';
  export default defineComponent({
    components: { BasicTable, BreadCrumb, GIcon, UploadFile, CreateFolderModal, MoveModal },
    setup() {
      const { createMessage, createErrorModal } = useMessage();
      const path = ref([]);
      let dirId = '';
      const tableData = computed(() => {
        return folder.value.concat(files.value);
      });
      const folder = ref([]);
      const files = ref([]);
      function fetchData(params = { dirId: '' }) {
        useApollo()
          .query({
            query: driveListFiles,
            variables: params.dirId == '' ? {} : params,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            const list = res.data?.driveListFiles;
            folder.value = [];
            files.value = [];
            if (list) {
              if (list[1]) {
                console.log(list[1]);
                folder.value.push({
                  id: list[1].id,
                  type: 'folder',
                  fullName: '...',
                  size: 0,
                  createAt: '',
                  hash: '',
                  space: list[1].space,
                  desc: '',
                });
              }
              list.forEach((v) => {
                if (v && v.isDir) {
                  if (v.fullName.length > 0) {
                    if (params) {
                      if (v.id === params.dirId) {
                        return;
                      }
                    }
                    // console.log(v);
                    folder.value.push({
                      id: v.id,
                      type: 'folder',
                      fullName: v.fullName[v.fullName.length - 1],
                      size: 0,
                      createAt: moment(v.updatedAt).format('Y-M-D H:m:s'),
                      hash: v.hash,
                      space: v.space,
                      desc: v.info?.description,
                    });
                  }
                }
              });

              // console.log(data.driveListFiles);
            }
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

      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource, reload },
      ] = useTable({
        canResize: false,
        title: '文件列表',
        dataSource: (tableData as unknown) as any[],
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        rowSelection: {
          type: 'checkbox',
        },
        scroll: { x: 1800, y: 800 },
      });
      // 新建文件夹Modal
      const [
        registerCreateFolder,
        { openModal: openModal1, setModalProps: setModal1 },
      ] = useModal();
      const [registerMoveModal, { openModal: openModal2, setModalProps: setModal2 }] = useModal();

      function openCreateFolderModal() {
        openModal1(true, { folder, dirId });
        nextTick(() => {
          setModal1({
            canFullscreen: false,
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }

      function openMoveModal() {
        openModal2(true, getSelectRowKeys());
        nextTick(() => {
          setModal2({
            canFullscreen: false,
            width: '70%',
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }

      function del(file) {
        useApollo()
          .mutate({ mutation: driveDeleteFile, variables: file })
          .finally(() => {
            fetchData({ dirId });
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

      function openFile(file) {
        if (file.type === 'folder') {
          if (file.fullName === '...') {
            path.value.pop();
          } else {
            path.value.push(file.fullName);
          }
          dirId = file.id || '';
          fetchData({ dirId: file.id });
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
        registerCreateFolder,
        openCreateFolderModal,
        registerMoveModal,
        openMoveModal,
        del,
      };
    },
  });
</script>
