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
      <template #action="{ record }">
        <div>
          <!--          <a-button type="link" v-if="record.type !== 'folder'">详情</a-button>-->
          <a-button type="link" v-if="record.type !== 'folder'" @click="preview(record)"
            >预览</a-button
          >
          <!--          <a-button type="link">复制路径</a-button>-->
          <a-button type="link" @click="download(record)">下载</a-button>
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
        <a-button type="primary" v-show="choose"> 下载 </a-button>
      </template></BasicTable
    >
    <ShareFileModal @register="registerModal" @pushCode="pushCode" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { useApollo } from '/@/hooks/apollo/apollo';
  import { driveFindShare, drivePreviewToken } from '/@/hooks/apollo/gqlFile';
  import { useMessage } from '/@/hooks/web/useMessage';
  import ShareFileModal from './ShareFileModal.vue';
  import { useModal } from '/@/components/Modal';
  import { File } from '../type/file';
  import { useTable, BasicTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { toLower } from 'lodash-es';
  import { createImgPreview } from '/@/components/Preview';
  import { downloadByUrl } from '/@/utils/file/download';
  export default defineComponent({
    name: 'TestTab',
    components: { ShareFileModal, BasicTable },
    setup() {
      const { currentRoute } = useRouter();
      const params = computed(() => {
        return unref(currentRoute).params;
      });
      const tableData = ref([]);
      const { createMessage, createErrorModal } = useMessage();
      const [registerModal, { openModal, setModalProps }] = useModal();
      const [
        registerTable,
        { getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource },
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
      nextTick(() => {
        setModalProps({
          maskClosable: false,
          closable: false,
          canFullscreen: false,
          showCancelBtn: false,
        });

        openModal(true);
      });

      function pushCode(code) {
        params.value.code = code.code;
        fetchData();
      }
      function fetchData() {
        useApollo()
          .query({
            query: driveFindShare,
            variables: params.value,
            fetchPolicy: 'no-cache',
          })
          .then((res) => {
            const data = res.data?.driveFindShare;
            if (!data) {
              createErrorModal({ title: '错误', content: '分享文件信息错误' });
              return;
            }
            openModal(false);
            const f = new File(data);
            tableData.value = [f];
          });
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
                }/${file.fullName}?token=${token}`;

                // /preview/:user_id/:space/:user_file_id/:filename?token=:token
                downloadByUrl({
                  url: url,
                  target: '_self',
                });
              });
        }
      }
      // 打开文件或者进入目录
      function openFile(f: File) {
        if (!f.isDir) {
          return;
        }
        return;
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
        registerModal,
        registerTable,
        pushCode,
        choose,
        setSelectedRowKeyList,
        clearSelect,
        openFile,
        preview,
        download,
      };
    },
  });
</script>
