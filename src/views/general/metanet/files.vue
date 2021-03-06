<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Space>
          <!-- 创建 / 上传 -->
          <template v-if="!choose">
            <CreateButton :path="path" />
            <UploadButton ref="uploadRef" :path="path" />
          </template>
          <!-- 移动 / 复制 -->
          <template v-else>
            <Button type="primary" @click="openMoveModal">{{ t('moveButton') }}</Button>
            <Button type="primary" @click="openCopy">{{ t('copyButton') }}</Button>
            <Button type="danger" @click="delFiles">{{ t('batchDelete') }}</Button>
          </template>
          <!-- 点击切换上级目录 -->
          <BreadCrumb :path="currentPath" @jump="goPath" />
        </Space>
      </template>
      <template #name="{ record }">
        <Button type="link" @click="openFile(record)">
          <Icon :type="record.type" />
          {{ record.name }}{{ record.type === 'folder' ? '' : '.' + record.type }}</Button
        > </template
      ><template #hash="{ text }">
        <Hash :hash="text" v-if="text" />
      </template>
      <!-- 表格里右边的操作栏 -->
      <template #action="{ record }">
        <Dropdown v-if="record.name !== '...'">
          <a class="ant-dropdown-link"> ... </a>
          <template #overlay>
            <Menu>
              <MenuItem>
                <Button type="link" @click="openShareModal(record)">{{ t('shareButton') }}</Button>
              </MenuItem>
              <MenuItem>
                <Button type="link" @click="openPublishModal(record)">{{ t('publish') }}</Button>
              </MenuItem>

              <MenuItem>
                <Button type="link">{{ t('send') }}</Button>
              </MenuItem>
              <MenuItem>
                <Button type="link" @click="download(record)">{{ t('downloadButton') }}</Button>
              </MenuItem>
              <MenuItem>
                <Button type="link" @click="openMoveModal(record)">{{
                  t('moveButton')
                }}</Button></MenuItem
              >
              <MenuItem>
                <Button type="link" @click="openCopy(record)">{{
                  t('copyButton')
                }}</Button></MenuItem
              >
              <MenuItem>
                <Button type="link" @click="openRename(record)">{{ t('rename') }}</Button></MenuItem
              >
              <MenuItem>
                <Button type="link" color="error" @click="delFile(record)">{{
                  t('delButton')
                }}</Button></MenuItem
              >
            </Menu>
          </template>
        </Dropdown>
      </template>
      <template #toolbar>
        <Button @click="changeButton" type="link">
          <ExclamationCircleTwoTone
            :style="{ fontSize: '20px' }"
            :twoToneColor="`#${infoButton ? '2E2EFE' : '6E6E6E'}`" />{{
        }}</Button>
      </template>
    </BasicTable>
    <!-- 上传状态底部栏 -->
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
    MarkdownModal,
  } from '/@/components/NetFile';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { Button } from '/@/components/Button';
  import { useDrawer } from '/@/components/Drawer';
  import { useNetFileStore } from '/@/store/modules/netFile';
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
      const fileStore = useNetFileStore();
      // 信息框
      const { createMessage, createErrorModal, notification } = useMessage();
      // 通过watch fetch 变量来控制表格数据的刷新
      watch(
        () => fileStore.getRefetch,
        // (v,oldV) => {
        (v) => {
          // console.log('watch-fileStore.getRefetch',v,oldV)
          if (!v) return;
          // 重置表格选中状态 (from bug: 选中项 删除后,左上角的移动按钮没有根据状态改变)
          const beforeSelectRowKeys = getSelectRowKeys()
          // console.log('getSelectRowKeys',beforeSelectRowKeys)
          refetch().then(res=>{
            // console.log('refetch-res',res)
            if(res?.data?.driveListFiles) {
              const toSetRowKeys = res.data.driveListFiles.filter(i=>i && i.id && beforeSelectRowKeys.includes(i.id)).map(i=>i.id)
              // console.log('toSetRowKeys',toSetRowKeys)
              setSelectedRowKeys(toSetRowKeys)
            }
          })
          fileStore.setRefetch(false);
          // console.log('Refetch');
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

      const currentPath = ref<string[]>([]);

      const infoButton = computed(() => fileStore.getFileInfo.button);

      const searchValue = ref('');

      // 表格数据
      // 文件列表
      const tableData = computed<NetFile[]>(() => fileStore.getFiles);

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

      onResult(({ data }) => {
        // 取得返回值
        let list = data?.driveListFiles;
        // 重置文件夹列表，文件列表
        let temp: NetFile[] = [];
        if (!list) {
          return;
        }
        currentPath.value = list[0].fullName;
        fileStore.setSpace({
          total: list[0].user.driveSetting.totalSpace,
          used: list[0].user.driveSetting.usedSpace,
        });
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
        list.slice(1).forEach((v) => {
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
        fileStore.setFiles(temp.concat(p).concat(f));
      });

      // 文件列表表格
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
      ] = useTable({
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
            fileStore.setFileInfo({ file: record, mode: 'basic', collection: false });
          },
        }),
        pagination: false,
        showTableSetting: false,
        canResize: false,
        scroll: { x: null },
        // scroll: { x: 1000, y: window.innerHeight * 0.7 },
      });

      // 移动文件Modal
      const [registerMoveModal, { openModal: openModal2, setModalProps: setModal2 }] = useModal();
      //分享Modal
      const [registerShareModal, { openModal: openModal4, setModalProps: setModal4 }] = useModal();
      // MarkdownModal
      const [registerMarkdownModal, { openModal: openMarkdownModal }] = useModal();
      const [registerPublishModal, { openModal: openModal6, setModalProps: setModal6 }] =
        useModal();
      const [registerRenameModal, { openModal: openRenameModal, setModalProps: setRenameModal }] =
        useModal();
      const [registerCopyModal, { openModal: openCopyModal, setModalProps: setCopyModal }] =
        useModal();
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      // 打开新建文件夹modal
      // 打开复制窗口
      function openCopy(f: NetFile) {
        openCopyModal(true, { file: [...new Set([f.id, ...getSelectRowKeys()])] }, true);
        nextTick(() => {
          setCopyModal({
            canFullscreen: false,
            width: '50%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
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
            },
          });
        });
      }
      // 打开移动窗口
      function openMoveModal(f: NetFile) {
        openModal2(true, { folder: [...new Set([f.id, ...getSelectRowKeys()])], path });
        nextTick(() => {
          setModal2({
            canFullscreen: false,
            width: '70%',
            destroyOnClose: true,
            afterClose: () => {
              clearSelectedRowKeys();
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
              fileStore.setRefetch();
            },
          });
        });
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
                // 这个动作会触发 watch 然后重新获取列表
                fileStore.setRefetch();
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
            // const top = `${document.documentElement.clientHeight - 300}px`;
            // createMessage.config({ top });
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
                fileStore.setRefetch();
                // 删除后恢复原来 因为会影响所有的message提示
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
        console.log('setSelectedRowKeys',arr)
        setSelectedRowKeys(arr);
      }

      // 路径面包屑跳转
      function goPath(p: []) {
        if (p[0] === undefined) {
          fileStore.setFileInfo({
            file: new NetFile({ userFile: { fullName: ['Home'], isDir: true, info: { size: 0 } } }),
            mode: 'home',
            collection: false,
          });
        }
        console.log(p);
        if (p.length == 0) {
          path.value = [];
        }
        variables.value = { fullName: p };
      }
      // 打开文件或者进入目录
      function openFile(f: NetFile) {
        console.log('pcclick-openFile',f)
        if (f.isDir) {
          variables.value = { dirId: f.id };
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
        if (['png', 'jpg','jpeg'].includes(f.type)) {
          f.preview();
          return;
        }
        if (['md', 'txt', 'json'].includes(f.type)) {
          fileStore.appendMarkdownFile(f, true, path.value.slice(-1)[0]);
          return;
        }
        switch (f.type) {
          case 'pdf':
            openPdfDrawer(true, { file: f }, true);
            break;
          default:
            notification.warning({ message: '无法打开' });
        }

        // 根据ID获取最新进入目录文件
      }

      const uploadRef = ref(null);
      function openUploadModal() {
        uploadRef.value.openUploadModal();
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
        registerPublishModal,
        openPublishModal,
        searchValue,
        openUploadModal,
        uploadRef,
        registerPdfDrawer,
        registerRenameModal,
        openRename,
        registerCopyModal,
        openCopy,
        currentPath,
        infoButton,
        changeButton: fileStore.changeButton,
      };
    },
  });
</script>
