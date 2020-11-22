<template>
  <div class="p-4">
    <BreadCrumb :path="path" @jump="goPath" />
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
          <!--          <a-button type="link" v-if="record.type !== 'folder'">详情</a-button>-->
          <a-button type="link" v-if="record.type !== 'folder'" @click="preview(record)"
            >预览</a-button
          >
          <a-button type="link" @click="openShareModal(record)">分享</a-button>
          <!--          <a-button type="link">复制路径</a-button>-->
          <a-button type="link" @click="download(record)">下载</a-button>
          <a-button
            type="link"
            color="error"
            :pop="{ title: '删除' + record.fullName + '?' }"
            @click="delFile(record)"
            >删除</a-button
          ></div
        >
      </template>
      <template #toolbar>
        <a-button type="primary" @click="setSelectedRowKeyList">
          {{ !choose ? '全选' : '取消' }}
        </a-button>
        <a-button
          v-show="choose"
          type="primary"
          color="success"
          :pop="{ title: `删除选中的${getSelectRowKeys().length}个文件?` }"
          @click="delFiles"
          >删除</a-button
        >
        <a-button type="primary" v-show="choose"> 下载 </a-button>
        <a-button type="primary" v-show="!choose" @click="openMoveModal"> 移动 </a-button>
        <a-button type="primary" v-show="choose"> 分享 </a-button>
        <a-button type="primary" @click="openUploadModal"> 上传 </a-button>

        <a-button type="primary" @click="openCreateFolderModal"> 新建文件夹 </a-button>
        <a-button type="primary" @click="reload"> 刷新 </a-button>
      </template></BasicTable
    >
    <CreateFolderModal @register="registerCreateFolder" />
    <MoveModal @register="registerMoveModal" />
    <UploadModal @register="registerUploadModal" />
    <ShareModal @register="registerShareModal" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, nextTick, unref } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import BreadCrumb from './component/BreadCrumb.vue';
  import UploadModal from './component/upload/UploadModal.vue';
  import CreateFolderModal from './component/CreateFolderModal.vue';
  import ShareModal from './share/ShareModal.vue';
  import MoveModal from './component/MoveModal.vue';
  import GIcon from '/@/components/Icon/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import {
    driveListFiles,
    driveDeleteFile,
    drivePreviewToken,
    driveCreateShare,
    driveDeleteFiles,
  } from '/@/hooks/apollo/gqlFile';
  import { useModal } from '/@/components/Modal';
  import { createImgPreview } from '/@/components/Preview/index';
  import { toLower } from 'lodash-es';
  import { downloadByUrl } from '/@/utils/file/download';
  import { file } from '/@/views/disk/type/file';
  export default defineComponent({
    components: {
      BasicTable,
      BreadCrumb,
      GIcon,
      UploadModal,
      CreateFolderModal,
      MoveModal,
      ShareModal,
    },
    setup() {
      // 信息框
      const { createMessage, createErrorModal } = useMessage();
      // 文件路径面包屑
      const path = ref([]);
      let dirId = 'root';
      // 表格数据
      // 文件夹数据+文件数据
      const tableData = computed(() => {
        return folder.value.concat(files.value);
      });
      // 储存本级目录所有文件夹名
      const folder = ref([]);
      // 储存本级目录路所有文件
      const files = ref([]);
      // 根据ID获取数据 默认root目录
      function fetchData(params = { dirId: 'root' }) {
        console.log(params);
        useApollo()
          .query({
            query: driveListFiles,
            variables: params,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            // 取得返回值
            const list = res.data?.driveListFiles;
            // 重置文件夹列表，文件列表

            let temp = [];
            if (!list) {
              return;
            }
            // 列表[1]存在为存在上级目录，存入dirId，fullName设置为...
            if (list[1]) {
              temp.push({
                id: list[1].id,
                fullName: list[1].fullName,
                type: 'folder',
                name: '...',
                size: 0,
                createAt: '',
                hash: '',
                space: list[1].space,
                desc: '',
                isDir: true,
              });
            }
            // 遍历返回信息，组成表格信息
            let p = [];
            let f = [];
            list.forEach((v) => {
              if (!v) {
                return;
              }
              // 是目录
              if (v.isDir) {
                if (params.dirId === v.id) {
                  return;
                }
                if (dirId === '' && v.id === 'root') {
                  return;
                }
                if (temp.length > 0 && temp[0].id == v.id) {
                  return;
                }
                p.push(new file({ userFile: v }));
              } else {
                f.push(new file({ userFile: v }));
              }
            });
            folder.value = temp.concat(p);
            files.value = f;
          })
          .catch((err) => {
            console.log(err);
            createErrorModal({
              title: '错误',
              content: err.message,
            });
          });
      }
      // 获取数据
      fetchData();
      // 文件列表表格
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
        scroll: { x: 1000, y: 800 },
      });
      // 新建文件夹Modal
      const [
        registerCreateFolder,
        { openModal: openModal1, setModalProps: setModal1 },
      ] = useModal();
      // 移动文件Modal
      const [registerMoveModal, { openModal: openModal2, setModalProps: setModal2 }] = useModal();
      //上传Modal
      const [registerUploadModal, { openModal: openModal3, setModalProps: setModal3 }] = useModal();
      //分享Modal
      const [registerShareModal, { openModal: openModal4, setModalProps: setModal4 }] = useModal();

      // 打开新建文件夹modal
      // 传入上级文件夹ID dirId
      // 传入本级文件夹名，防止重名 folder
      function openCreateFolderModal() {
        console.log(dirId);
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
      // 打开移动窗口
      function openMoveModal() {
        openModal2(true, getSelectRowKeys(), true);
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
      // 打开上传窗口
      function openUploadModal() {
        openModal3(true, { path });

        nextTick(() => {
          setModal3({
            canFullscreen: false,
            width: '70%',
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }
      // 打开分享窗口
      function openShareModal(record) {
        openModal4(true, { record }, true);

        nextTick(() => {
          setModal4({
            canFullscreen: false,
            width: '30%',
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }
      // 删除文件或文件夹
      function delFile(file) {
        useApollo()
          .mutate({ mutation: driveDeleteFile, variables: file })
          .finally(() => {
            fetchData({ dirId });
          });
      }
      //批量删除文件
      function delFiles() {
        if (getSelectRowKeys().length === 0) {
          createErrorModal({ title: '错误', content: '未选择文件' });
          return;
        }
        useApollo()
          .mutate({
            mutation: driveDeleteFiles,
            variables: { ids: getSelectRowKeys(), space: 'PRIVATE' },
          })
          .then((res) => {
            const count = res.data?.driveDeleteFiles;
            createMessage.success(`成功删除${count}个文件`);
          })
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

      function preview(file) {
        switch (file.type) {
          case 'folder':
            break;
          default:
            const id = localStorage.getItem('uid');
            let token = '';
            useApollo()
              .mutate({ mutation: drivePreviewToken })
              .then((res) => {
                token = res?.data?.drivePreviewToken;
                let url = `https://drive-s.owaf.io/preview/${id}/${toLower(file.space)}/${
                  file.id
                }/${file.fullName}.${file.type}?token=${token}`;
                console.log(url);

                console.log(token);
                // /preview/:user_id/:space/:user_file_id/:filename?token=:token
                createImgPreview({
                  imageList: [url],
                });
              });
        }
      }
      function download(file) {
        switch (file.type) {
          case 'folder':
            break;
          default:
            const id = localStorage.getItem('uid');
            let token = '';
            useApollo()
              .mutate({ mutation: drivePreviewToken })
              .then((res) => {
                token = res?.data?.drivePreviewToken;
                let url = `https://drive-s.owaf.io/download/${id}/${toLower(file.space)}/${
                  file.id
                }/${file.fullName}.${file.type}?token=${token}`;

                // /preview/:user_id/:space/:user_file_id/:filename?token=:token
                downloadByUrl({
                  url: url,
                  target: '_self',
                });
              });
        }
      }

      function share(file) {
        switch (file.type) {
          case 'folder':
            break;
          default:
            console.log(file);
            useApollo()
              .mutate({
                mutation: driveCreateShare,
                variables: {
                  userFileId: file.id,
                },
              })
              .then((res) => {
                console.log(res);
              });
        }
      }

      function goPath(p) {
        fetchData({ dirId: p.dirId });
        if (p.dirId === 'root') {
          path.value = [];
          return;
        }
        let l = [];
        path.value.forEach((v) => {
          l.push(v);
          if (v.dirId == p.dirId) {
            path.value = [...l];
          }
        });
      }
      // 打开文件或者进入目录
      function openFile(f: file) {
        if (!f.isDir) {
          return;
        }
        dirId = f.id;
        fetchData({ dirId: f.id });
        // TODO 这里有个迷之BUG，name自己变成...
        if (f.name === '...') {
          if (f.fullName.length > 0) {
            path.value.push({ name: f.fullName[f.fullName.length - 1], dirId: f.id });
            return;
          }
          path.value.pop();
          return;
        }
        path.value.push({ name: f.name, dirId: f.id });
        // 根据ID获取最新进入目录文件
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
        registerUploadModal,
        openUploadModal,
        registerShareModal,
        openShareModal,
        delFile,
        preview,
        share,
        download,
        goPath,
        delFiles,
        getSelectRowKeys,
      };
    },
  });
</script>
