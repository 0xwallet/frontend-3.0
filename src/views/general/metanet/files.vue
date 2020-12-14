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
        <Dropdown>
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem>
                <a-button type="link" v-if="record.type !== 'folder'" @click="preview(record)">{{
                  t('previewButton')
                }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button type="link" @click="openShareModal(record)">{{
                  t('shareButton')
                }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button type="link" @click="download(record)" v-if="record.type !== 'folder'">{{
                  t('downloadButton')
                }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button
                  type="link"
                  color="error"
                  :pop="{ title: t('delButton') + ' ' + record.fullName + '?' }"
                  @click="delFile(record)"
                  >{{ t('delButton') }}</a-button
                >
              </MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #toolbar>
        <a-button type="primary" @click="setSelectedRowKeyList">
          {{ !choose ? t('selectAll') : t('cancelAll') }}
        </a-button>
        <a-button
          v-show="choose"
          type="primary"
          color="success"
          :pop="{ title: `${t('delSelect')} ${getSelectRowKeys().length} ${t('file')}?` }"
          @click="delFiles"
          >{{ t('delButton') }}</a-button
        >
        <a-button type="primary" v-show="choose"> {{ t('downloadButton') }} </a-button>
        <a-button type="primary" v-show="choose" @click="openMoveModal">
          {{ t('moveButton') }}
        </a-button>
        <a-button type="primary" v-show="choose"> {{ t('share') }} </a-button>
        <a-button type="primary" @click="openUploadModal"> {{ t('uploadButton') }} </a-button>

        <a-button type="primary" @click="openCreateFolderModal"> {{ t('createFolder') }} </a-button>
        <a-button type="primary" @click="refresh"> {{ t('refresh') }} </a-button>
      </template></BasicTable
    >
    <CreateFolderModal @register="registerCreateFolder" />
    <MoveModal @register="registerMoveModal" />
    <UploadModal @register="registerUploadModal" />
    <ShareModal @register="registerShareModal" />
    <MarkdownModal @register="registerMDModal" />
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
  import MarkdownModal from './component/editor/Markdown.vue';
  import GIcon from '/@/components/Icon/index';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveListFiles, driveDeleteFiles } from '/@/hooks/apollo/gqlFile';
  import { useModal } from '/@/components/Modal';
  import { File } from './type/file';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  import { Dropdown, Menu } from 'ant-design-vue';

  export default defineComponent({
    components: {
      BasicTable,
      BreadCrumb,
      GIcon,
      UploadModal,
      CreateFolderModal,
      MoveModal,
      ShareModal,
      Dropdown,
      Menu,
      MenuItem: Menu.Item,
      MarkdownModal,
    },
    setup() {
      // 信息框
      const { createMessage, createErrorModal } = useMessage();
      // 文件路径面包屑
      const path = ref([]);
      let dirId = 'root';
      // 表格数据
      // 文件列表
      const tableData = computed(() => {
        return folder.value.concat(files.value);
      });
      // 储存本级目录所有文件夹名
      const folder = ref([]);
      // 储存本级目录路所有文件
      const files = ref([]);
      //当前是否有选择文件
      const choose = computed(() => {
        return getSelectRowKeys().length !== 0;
      });
      // 根据ID获取数据 默认root目录
      function fetchData(params = { dirId: 'root' }) {
        console.log(params);
        useApollo()
          .query({
            query: driveListFiles,
            variables: params,
            fetchPolicy: 'network-only',
          })
          .then((res) => {
            // 取得返回值
            const list = res.data?.driveListFiles;
            // 重置文件夹列表，文件列表

            let temp: File[] = [];
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
                updatedAt: '',
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
                p.push(new File({ userFile: v }));
              } else {
                f.push(new File({ userFile: v }));
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
        title: t('files'),
        dataSource: (tableData as unknown) as any[],
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        rowSelection: {
          type: 'checkbox',
          getCheckboxProps: (record) => ({
            disabled: record.name === '...', // Column configuration not to be checked
            name: record.name,
          }),
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
      // MarkdownModal
      const [registerMDModal, { openModal: openModal5, setModalProps: setModal5 }] = useModal();

      // 打开新建文件夹modal
      // 传入上级文件夹ID dirId
      // 传入本级文件夹名，防止重名 folder
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
      // 打开移动窗口
      function openMoveModal() {
        openModal2(true, { folder: getSelectRowKeys(), path });
        nextTick(() => {
          setModal2({
            canFullscreen: false,
            width: '70%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
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
            width: '50%',
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }
      function openMDModal(record) {
        openModal5(true, { record }, true);

        nextTick(() => {
          setModal5({
            width: '80%',
            destroyOnClose: true,
            afterClose: () => {
              fetchData({ dirId });
            },
          });
        });
      }
      // 文件预览
      function preview(f: File) {
        f.preview();
      }
      // 文件下载
      function download(f: File) {
        f.download();
      }
      // 删除文件或文件夹
      function delFile(file) {
        const f: File = file;
        f.delFile()
          .then(() => {
            createMessage.success('删除成功');
          })
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

      // 全选，反选
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

      // 路径面包屑跳转
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
      function openFile(f: File) {
        if (f.isDir) {
          dirId = f.id;
          fetchData({ dirId: f.id });
          if (f.id === 'root') {
            path.value = [];
            return;
          }

          if (f.name === '...') {
            let p = unref(path);
            p.forEach((v) => {
              if (v.dirId == f.id) {
                path.value.pop();
                return;
              }
            });
            // TODO 这里有个迷之BUG，name自己变成...
            if (f.fullName.length > 0) {
              path.value.push({ name: f.fullName[f.fullName.length - 1], dirId: f.id });
              console.log(22, path.value);
              return;
            }
          }
          path.value.push({ name: f.name, dirId: f.id });
          return;
        }
        if (f.type === 'md') {
          openMDModal(f);
        } else if (f.type === 'png') {
          f.preview();
        }

        // 根据ID获取最新进入目录文件
      }
      function refresh() {
        fetchData({ dirId });
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        choose,
        path,
        openFile,
        registerCreateFolder,
        openCreateFolderModal,
        registerMoveModal,
        openMoveModal,
        registerUploadModal,
        openUploadModal,
        registerShareModal,
        openShareModal,
        registerMDModal,
        openMDModal,
        delFile,
        preview,
        download,
        goPath,
        delFiles,
        getSelectRowKeys,
        t,
        refresh,
      };
    },
  });
</script>
