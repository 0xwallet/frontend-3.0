<template>
  <div class="p-4">
    <Row v-if="!form">
      <Col :xs="2" :sm="4" :md="6" :lg="8" :xl="9"></Col>
      <Col :xs="20" :sm="16" :md="12" :lg="8" :xl="6">
        <Card hoverable>
          <Space direction="vertical">
            <CardMeta>
              <template #title
                >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</template
              >
              <template #description> {{ userPreview.bio }} </template>
              <template #avatar>
                <Avatar :src="userPreview.avatar" />
              </template>
            </CardMeta>
            <BasicForm
              @register="registerForm"
              layout="vertical"
              style="margin: 5px"
              v-if="needCode"
            />
          </Space>
        </Card>
      </Col>
      <Col :xs="2" :sm="4" :md="6" :lg="8" :xl="9"></Col>
    </Row>
    <ShareFileMobile
      :uri="params.uri"
      :needCode="needCode"
      :user="userPreview"
      v-if="mobile && form"
    />
    <Card v-if="!mobile && form">
      <template #title
        ><Space
          ><Avatar :src="userPreview.avatar" /><span
            >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</span
          ></Space
        ></template
      >
      <BasicTable @register="registerTable">
        <template #name="{ record }">
          <a-button type="link" @click="openFile(record)"
            ><Icon :type="record.type" />{{ record.name
            }}{{ record.type === 'folder' ? '' : '.' + record.type }}</a-button
          >
        </template>
        <template #hash="{ text }">
          <Hash :hash="text" v-if="text" />
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
    </Card>

    <PdfDrawer @register="registerPdfDrawer" />
    <MarkdownModal @register="registerMarkdownModal" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref } from 'vue';
  import { Card, Space, Row, Col, Avatar } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { drivePreviewShare } from '/@/hooks/apollo/gqlFile';
  import { useTable, BasicTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Hash, Icon, PdfDrawer, NetFile } from '/@/components/NetFile';
  import { BasicForm, useForm } from '/@/components/Form';
  import { fileStore } from '/@/store/modules/netFile';
  import ShareFileMobile from '/@/views/general/metanet/share/component/ShareFileMobile.vue';
  import { useQuery } from '@vue/apollo-composable';
  import router from '/@/router';
  import MarkdownModal from '../component/editor/Markdown.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'TestTab',
    components: {
      Hash,
      BasicTable,
      Card,
      CardMeta: Card.Meta,
      Space,
      BasicForm,
      ShareFileMobile,
      Row,
      Col,
      Avatar,
      PdfDrawer,
      MarkdownModal,
      Icon,
    },
    setup() {
      const { currentRoute } = useRouter();
      if (
        navigator.userAgent.match(
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
        ) !== null
      ) {
        router.replace(unref(currentRoute).fullPath.replace(`/s/`, `/m/`));
      }
      const params = computed(() => {
        return unref(currentRoute).query;
      });
      const form = computed(() => {
        return tableData.value.length > 0 || file.value !== null;
      });
      const mobile = computed(() => {
        return (
          navigator.userAgent.match(
            /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
          ) !== null
        );
      });
      const file = computed(() => {
        return fileStore.getShareFile.find((f) => f.uri === params.value.uri) || null;
      });
      const tableData = computed(() => {
        const temp: NetFile[] = [];
        const f = fileStore.getShareFile.find((f) => f.uri === params.value.uri);
        if (f) temp.push(f);
        return temp;
      });
      // const tableData = ref([]);
      const needCode = ref(false);
      const userPreview = ref({});
      const [registerForm, { validateFields }] = useForm({
        schemas: [
          {
            field: 'code',
            component: 'Input',
            label: t('code'),
            required: true,
            colProps: {
              span: 24,
            },
            defaultValue: '',
          },
        ],
        showActionButtonGroup: true,
        showResetButton: false,
        submitButtonOptions: {
          text: 'Submit',
        },
        actionColOptions: {
          span: 24,
        },
        submitFunc: fetchData,
      });
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
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      const [registerMarkdownModal, { openModal: openMarkdownModal }] = useModal();
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
      // onMounted(() => {
      //   // nextTick(() => {
      //   //   setTimeout(() => {
      //   //     openModal(true, {}, true);
      //   //   }, 1000);
      //   // });
      // });
      const { onResult: PreviewShare } = useQuery(drivePreviewShare, params.value);
      PreviewShare((res) => {
        needCode.value = res.data?.drivePreviewShare.needCode;
        userPreview.value = res.data?.drivePreviewShare.UserPreview;
        if (!res.data?.drivePreviewShare.needCode) {
          fileStore.fetchShareFile(params.value);
        }
      });
      async function fetchData() {
        const { code } = await validateFields();
        params.value.code = code;
        await fileStore.fetchShareFile(params.value);
      }

      function preview(file: NetFile) {
        switch (file.type) {
          case 'pdf':
            openPdfDrawer(true, { file }, true);
            break;
          case 'md':
            openMarkdownModal(true, file, true);
            break;
          default:
            file.preview();
        }
      }
      function download(file: NetFile) {
        file.download();
      }
      // 打开文件或者进入目录
      function openFile(f: NetFile) {
        if (!f.isDir) {
          return;
        }
        if (f.type === 'md') {
          // openMDModal(f);
        } else if (f.type === 'png') {
          f.preview();
        }
        return;
      }
      return {
        registerTable,
        choose,
        setSelectedRowKeyList,
        clearSelect,
        openFile,
        preview,
        download,
        file,
        mobile,
        needCode,
        userPreview,
        t,
        registerForm,
        tableData,
        form,
        params,
        registerPdfDrawer,
        registerMarkdownModal,
      };
    },
  });
</script>
<style>
  .img {
    width: 100px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    z-index: 999;
  }
</style>
