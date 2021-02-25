<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Space>
          <CreateButton :path="path" @refetch="refetch" v-if="!choose" />
          <a-button type="primary" @click="openMoveModal" v-if="choose">{{
            t('moveButton')
          }}</a-button>
          <UploadButton ref="uploadRef" :path="path" v-if="!choose" @refetch="refetch" />
          <a-button type="primary" v-if="choose" @click="openCopy">{{ t('copyButton') }}</a-button>
          <BreadCrumb :path="path" @jump="goPath" />
        </Space>
      </template>
      <template #name="{ record }">
        <a-button type="link" @click="openFile(record)">
          <Icon :type="record.type" />
          {{ record.name }}{{ record.type === 'folder' ? '' : '.' + record.type }}</a-button
        > </template
      ><template #hash="{ text }">
        <Hash :hash="text" v-if="text" />
      </template>
      <template #action="{ record }">
        <Dropdown v-if="record.name !== '...'">
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem>
                <a-button type="link" @click="openShareModal(record)">{{
                  t('shareButton')
                }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button type="link" @click="openPublishModal(record)">{{
                  t('publish')
                }}</a-button>
              </MenuItem>

              <MenuItem>
                <a-button type="link">{{ t('send') }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button type="link" @click="download(record)">{{ t('downloadButton') }}</a-button>
              </MenuItem>
              <MenuItem>
                <a-button type="link" @click="openMoveModal(record)">{{
                  t('moveButton')
                }}</a-button></MenuItem
              >
              <MenuItem>
                <a-button type="link" @click="openCopy(record)">{{
                  t('copyButton')
                }}</a-button></MenuItem
              >
              <MenuItem>
                <a-button type="link" @click="openRename(record)">{{
                  t('rename')
                }}</a-button></MenuItem
              >
              <MenuItem>
                <a-button type="link" color="error" @click="delFile(record)">{{
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
      :title="file.fullName?.slice(-1)[0] || 'none'"
      placement="right"
      :visible="infoVisible"
      :getContainer="`.ant-card-body`"
      @close="closeInfo"
      :mask="false"
      :width="400"
      :wrapClassName="'!mt-52'"
      ><FileInfo :file="file"
    /></Drawer>
    <UploadStatus @openUploadModal="openUploadModal" />
    <MoveModal @register="registerMoveModal" />
    <ShareModal @register="registerShareModal" />
    <MarkdownModal @register="registerMarkdownModal" />
    <PublishModal @register="registerPublishModal" />
    <PdfDrawer @register="registerPdfDrawer" />
    <RenameModal @register="registerRenameModal" />
    <CopyModal @register="registerCopyModal" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed, ref, nextTick, unref, createVNode, watch } from 'vue';
  import { BasicTable, useTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useMessage } from '/@/hooks/web/useMessage';
  import BreadCrumb from './component/BreadCrumb.vue';
  import ShareModal from './share/component/ShareModal.vue';
  import PublishModal from './component/PublishModal.vue';
  import CreateButton from './component/Files/CreateButton.vue';
  import UploadButton from './component/Files/UploadButton.vue';
  import UploadStatus from './component/Files/upload/UploadStatus.vue';
  import {
    DownOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined,
    ExclamationCircleTwoTone,
  } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Dropdown, Menu, Divider, Space, Row, Col, Modal, Drawer, Input } from 'ant-design-vue';
  import {
    Hash,
    Icon,
    PdfDrawer,
    NetFile,
    RenameModal,
    CopyModal,
    MoveModal,
    NetGql,
    FileInfo,
    MarkdownModal,
  } from '/@/components/NetFile';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { Button } from '/@/components/Button';
  import { useDrawer } from '/@/components/Drawer';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: {
      Hash,
      BasicTable,
      BreadCrumb,
      Icon,
      MoveModal,
      ShareModal,
      Dropdown,
      Menu,
      MenuItem: Menu.Item,
      MenuGroup: Menu.ItemGroup,
      MarkdownModal,
      DownOutlined,
      Divider,
      EllipsisOutlined,
      ExclamationCircleTwoTone,
      Space,
      Row,
      Col,
      FileInfo,
      PublishModal,
      CreateButton,
      UploadButton,
      Button,
      Drawer,
      InputSearch: Input.Search,
      UploadStatus,
      PdfDrawer,
      RenameModal,
      CopyModal,
    },
    setup() {
      // 信息框
      const { createMessage, createErrorModal, notification } = useMessage();
      watch(
        () => fileStore.getRefetch,
        (v) => {
          if (fileStore.getRefetch == 0) return;
          setTimeout(() => {
            refetch();
            console.log('刷新', v);
            fileStore.setRefetch(0);
          }, v * 1000);
        }
      );
      // 文件路径面包屑
      // 储存本级目录所有文件夹名
      let folder = ref([]);
      // 储存本级目录路所有文件
      let files = ref([]);
      // 当前选择的文件
      const file = ref({});
      //当前路径
      const path = ref([]);
      // info相关
      const infoButton = ref(false);
      const infoVisible = computed(() => {
        return infoButton.value && file.value.fullName !== undefined;
      });
      const searchValue = ref('');

      // 表格数据
      // 文件列表
      const tableData = computed(() => {
        return folder.value.concat(files.value);
      });

      //当前是否有选择文件
      const choose = computed(() => {
        return getSelectRowKeys().length !== 0;
      });
      // 根据ID获取数据 默认root目录

      const variables = ref({
        dirId: 'root',
      });
      const { onResult, refetch } = useQuery(NetGql.Basic.FileList, variables, () => ({
        fetchPolicy: 'network-only',
      }));

      onResult((res) => {
        // 取得返回值
        let list = res.data?.driveListFiles;
        // 重置文件夹列表，文件列表
        let temp: NetFile[] = [];
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
        let p: NetFile[] = [];
        let f: NetFile[] = [];
        list.forEach((v) => {
          if (!v) return;
          // 是目录
          if (v.isDir) {
            if (
              variables.value.dirId === v.id ||
              v.id === 'root' ||
              (temp.length > 0 && temp[0].id == v.id)
            ) {
              return;
            }
            p.push(new NetFile({ userFile: v }));
          } else {
            f.push(new NetFile({ userFile: v }));
          }
        });
        folder.value = temp.concat(p);

        files.value = f;
      });

      // 文件列表表格
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
        canResize: false,
        dataSource: tableData,
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
        customRow: (record) => ({
          onClick: () => {
            if (!infoButton.value) {
              file.value = {};
              return;
            }
            if (record.name === '...') return;
            file.value = record;
          },
        }),
        pagination: false,
        showTableSetting: false,
        scroll: { x: 1000, y: window.innerHeight * 0.7 },
      });

      // 移动文件Modal
      const [registerMoveModal, { openModal: openModal2, setModalProps: setModal2 }] = useModal();
      //分享Modal
      const [registerShareModal, { openModal: openModal4, setModalProps: setModal4 }] = useModal();
      // MarkdownModal
      const [registerMarkdownModal, { openModal: openMarkdownModal }] = useModal();
      const [
        registerPublishModal,
        { openModal: openModal6, setModalProps: setModal6 },
      ] = useModal();
      const [
        registerRenameModal,
        { openModal: openRenameModal, setModalProps: setRenameModal },
      ] = useModal();
      const [
        registerCopyModal,
        { openModal: openCopyModal, setModalProps: setCopyModal },
      ] = useModal();
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      // 打开新建文件夹modal
      // 打开移动窗口
      function openCopy(f: NetFile) {
        openCopyModal(true, { file: [f.id, ...getSelectRowKeys()] }, true);
        nextTick(() => {
          setCopyModal({
            canFullscreen: false,
            width: '50%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
              refetch();
            },
          });
        });
      }
      function openRename(f: NetFile) {
        openRenameModal(true, { file: f }, true);
        nextTick(() => {
          setRenameModal({
            canFullscreen: false,
            width: '50%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
              refetch();
            },
          });
        });
      }
      // 打开移动窗口
      function openMoveModal(f: NetFile) {
        openModal2(true, { folder: [f.id, ...getSelectRowKeys()], path });
        nextTick(() => {
          setModal2({
            canFullscreen: false,
            width: '70%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
              refetch();
            },
          });
        });
      }
      // 打开发布Modal
      function openPublishModal(file) {
        openModal6(true, file);
        nextTick(() => {
          setModal6({
            canFullscreen: false,
            destroyOnClose: true,
            width: '50%',
            afterClose: () => {
              refetch();
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
              refetch();
            },
          });
        });
      }

      function openMDModal(record) {
        openMarkdownModal(true, record, true);
      }
      // 文件预览
      function preview(f: NetFile) {
        f.preview();
      }
      // 文件下载
      function download(f: NetFile) {
        f.download();
      }
      // 删除文件或文件夹
      function delFile(file: NetFile) {
        Modal.confirm({
          title: t('error'),
          icon: createVNode(ExclamationCircleOutlined),
          content: t('delButton') + ' ' + file.fullName + '?',
          centered: true,
          okText: t('yes'),
          cancelText: t('cancelAll'),
          onOk() {
            file
              .delFile()
              .then(() => {
                createMessage.success('删除成功');
              })
              .finally(() => {
                refetch();
              });
          },
        });
      }
      const { mutate: DeleteFiles } = useMutation(NetGql.Basic.DeleteFiles);
      //批量删除文件
      function delFiles() {
        if (getSelectRowKeys().length === 0) {
          createErrorModal({ title: '错误', content: '未选择文件' });
          return;
        }
        t('delete');
        Modal.confirm({
          title: `${t('delete')} ${getSelectRowKeys().length} ${t('items')} ?`,
          icon: createVNode(ExclamationCircleOutlined),
          content: `${t('delContent1')} ${getSelectRowKeys().length} ${t('items')} ${t(
            'delContent2'
          )}?`,
          width: '50%',
          centered: true,
          onOk() {
            const top = `${document.documentElement.clientHeight - 300}px`;
            createMessage.config({ top });
            createMessage.loading({
              content: `${t('deleting')} ${getSelectRowKeys().length} ${t('items')}...`,
              key: 'deleteModal',
            });
            DeleteFiles({ ids: getSelectRowKeys(), space: 'PRIVATE' })
              .then((res) => {
                const count = res.data?.driveDeleteFiles;
                createMessage.success({ content: t('deleted'), key: 'deleteModal', duration: 2 });
              })
              .catch((err) => {
                createMessage.error({ content: err, key: 'deleteModal', duration: 2 });
              })
              .finally(() => {
                refetch();
              });
          },
          onCancel() {},
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
        variables.value.dirId = p.dirId;
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
      function openFile(f: NetFile) {
        if (f.isDir) {
          variables.value.dirId = f.id;
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
        if (['png', 'jpg'].includes(f.type)) {
          f.preview();
          return;
        }
        switch (f.type) {
          case 'md':
            openMDModal(f);
            break;
          case 'pdf':
            openPdfDrawer(true, { file: f }, true);
            break;
          default:
            notification.warning({ message: '无法打开' });
        }

        // 根据ID获取最新进入目录文件
      }

      function closeInfo() {
        infoButton.value = false;
      }
      function changeInfo() {
        infoButton.value = !infoButton.value;
      }
      const uploadRef = ref(null);
      function openUploadModal() {
        uploadRef.value.openUploadModal();
      }
      function infoRefetch() {
        refetch();
        file.value = {};
      }

      return {
        registerTable,
        setSelectedRowKeyList,
        choose,
        path,
        openFile,
        registerMoveModal,
        openMoveModal,
        registerShareModal,
        openShareModal,
        registerMarkdownModal,
        delFile,
        preview,
        download,
        goPath,
        delFiles,
        getSelectRowKeys,
        t,
        refetch,
        file,
        closeInfo,
        registerPublishModal,
        openPublishModal,
        changeInfo,
        infoButton,
        infoVisible,
        searchValue,
        openUploadModal,
        uploadRef,
        infoRefetch,
        registerPdfDrawer,
        registerRenameModal,
        openRename,
        registerCopyModal,
        openCopy,
      };
    },
  });
</script>
