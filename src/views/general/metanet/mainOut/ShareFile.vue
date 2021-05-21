<template>
  <div class="p-4 h-full flex">
    <div class="bg-white w-full flex justify-center">
      <div v-if="expired === 'expired'" class="self-center flex flex-col text-center w-1/4">
        <Avatar :size="80" :src="`/resource/img/info.png`" class="self-center m-4" />
        <div>{{ t('expired') }}</div></div
      >

      <div
        class="self-center flex flex-col text-center w-1/4"
        v-if="expired !== 'expired' && needCode && tableData.length === 0"
      >
        <Avatar :size="80" :src="userPreview.avatar" class="self-center m-4" />
        <div class="m-10 text-3xl">{{ userPreview.username }}</div>
        <Input v-model:value="code" :placeholder="t('accessCode')" class="m-10 h-10" />
        <div class="mt-5 text-red-500" v-if="codeError">{{ t('accessCodeWrong') }}</div>
        <Button class="mt-10" type="primary" @click="fetchData">{{ t('submit') }}</Button>
        <div class="mt-10">{{ expired }}</div>
      </div>
      <div class="w-full flex flex-col divide-y" v-if="tableData.length > 0">
        <div class="m-5 text-2xl"
          ><Avatar
            :size="30"
            :src="!expired ? `/resource/img/info.png` : userPreview.avatar"
            class="self-center mr-10"
          />
          <span class="ml-4"
            >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</span
          ></div
        >
        <BasicTable @register="registerTable">
          <template #tableTitle
            ><span class="text-xl m-2">{{ t('allFiles') }}</span>
            <span class="text-gary-500">{{ toExpired }} {{ t('expired') }}</span></template
          >
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
              <a-button type="link" v-if="record.type !== 'folder'" @click="preview(record)">{{
                t('previewButton')
              }}</a-button>
              <!--          <a-button type="link">复制路径</a-button>-->
              <a-button type="link" @click="download(record)">{{ t('downloadButton') }}</a-button>

              <a-button type="link" @click="save(record)">{{ t('saveButton') }}</a-button>
              <a-button type="link" @click="collection(record)">{{
                t('collectionButton')
              }}</a-button>
              <a-button type="link" @click="comment(record)">{{ t('comment') }}</a-button></div
            >
          </template>

          <template #toolbar>
            <a-button type="primary" @click="setSelectedRowKeyList">
              {{ !choose ? '全选' : '取消' }}
            </a-button>
            <a-button type="primary" v-show="choose"> 下载 </a-button>
          </template></BasicTable
        >
      </div>
    </div>

    <!--    <Row v-if="!form">-->
    <!--      <Col :xs="2" :sm="4" :md="6" :lg="8" :xl="9"></Col>-->
    <!--      <Col :xs="20" :sm="16" :md="12" :lg="8" :xl="6">-->
    <!--        <Card hoverable>-->
    <!--          <Space direction="vertical">-->
    <!--            <CardMeta>-->
    <!--              <template #title-->
    <!--                >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</template-->
    <!--              >-->
    <!--              <template #description> {{ userPreview.bio }} </template>-->
    <!--              <template #avatar>-->
    <!--                <Avatar :src="userPreview.avatar" />-->
    <!--              </template>-->
    <!--            </CardMeta>-->
    <!--            <BasicForm @register="registerForm" layout="vertical" class="m-px-5" v-if="needCode" />-->
    <!--          </Space>-->
    <!--        </Card>-->
    <!--      </Col>-->
    <!--      <Col :xs="2" :sm="4" :md="6" :lg="8" :xl="9"></Col>-->
    <!--    </Row>-->

    <!--    <Card v-if="form">-->
    <!--      <template #title-->
    <!--        ><Space-->
    <!--          ><Avatar :src="userPreview.avatar" /><span-->
    <!--            >{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件</span-->
    <!--          ></Space-->
    <!--        ></template-->
    <!--      >-->

    <!--    </Card>-->
    <!--    <CollectModal @register="registerCollectModal" />-->
    <!--    <PdfDrawer @register="registerPdfDrawer" />-->
    <!--    <MarkdownModal @register="registerMarkdownModal" />-->
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref, nextTick } from 'vue';
  import { Card, Space, Row, Col, Avatar, Input } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { useTable, BasicTable } from '/@/components/Table';
  import { getBasicColumns } from './tableData';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Hash, Icon, PdfDrawer, NetFile, NetGql, CollectModal } from '/@/components/NetFile';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useNetFileStore } from '/@/store/modules/netFile';
  import { useQuery } from '@vue/apollo-composable';
  import router from '/@/router';
  import MarkdownModal from '../component/editor/Markdown.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { dateUtil } from '/@/utils/dateUtil';
  import { Button } from '/@/components/Button';
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
      Row,
      Col,
      Avatar,
      PdfDrawer,
      MarkdownModal,
      Icon,
      CollectModal,
      Input,
      Button,
    },
    setup() {
      const fileStore = useNetFileStore();
      const expired = ref('');
      const toExpired = ref('');
      const userPreview = ref({});
      const code = ref('');
      const codeError = ref(false);
      const { currentRoute } = useRouter();
      const { createMessage } = useMessage();
      if (
        navigator.userAgent.match(
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
        ) !== null
      ) {
        router.replace(unref(currentRoute).fullPath.replace(`/s/`, `/s-m/`));
      }
      const params = computed(() => {
        return unref(currentRoute).query;
      });
      const form = computed(() => {
        return tableData.value.length > 0;
      });
      const tableData = computed(() => {
        return fileStore.getShareFile;
      });
      const needCode = ref(false);
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
        dataSource: tableData as unknown as any[],
        columns: getBasicColumns(),
        rowKey: 'id',
        showIndexColumn: false,
        scroll: { x: 1000, y: 800 },
      });
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      const [registerMarkdownModal, { openModal: openMarkdownModal }] = useModal();
      const [registerCollectModal, { openModal: openCollectModal }] = useModal();
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

      const { onResult: PreviewShare } = useQuery(NetGql.Share.Preview, params.value);
      PreviewShare(({ data }) => {
        const { drivePreviewShare } = data;
        if (drivePreviewShare) {
          expired.value =
            '🗓️ ' +
            dateUtil(drivePreviewShare.insertedAt).format('YY-MM-DD ') +
            '⏳ ' +
            dateUtil(drivePreviewShare.expiredAt).fromNow(true);
          toExpired.value = dateUtil(drivePreviewShare.expiredAt).fromNow(true);
          needCode.value = drivePreviewShare?.needCode;
          // needCode.value = true;
          userPreview.value = drivePreviewShare?.UserPreview;
          nextTick(() => {
            if (!needCode.value) fileStore.fetchShareFile(params.value);
          });
        } else {
          expired.value = 'expired';
        }
        console.log(drivePreviewShare);
      });

      async function fetchData() {
        codeError.value = false;
        params.value.code = code.value;
        const res = await fileStore.fetchShareFile(params.value);
        if (res) {
          needCode.value = false;
        } else {
          codeError.value = true;
        }
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
        if (f.isDir) {
          if (f.name === '...') {
            fileStore.fetchShareFile(params.value);
            return;
          }
          fileStore.fetchShareFiles({ token: f.shareInfo.token, dirId: f.id });
          return;
        }
        if (f.type === 'md') {
          openMarkdownModal(true, f, true);
        }
        if (f.type === 'png' || f.type === 'jpg') {
          f.preview();
        }
        return;
      }

      async function save(f: NetFile) {
        await f.save();
      }
      async function collection(f: NetFile) {
        openCollectModal(true, { mode: 'share', id: f.shareInfo.id, code: params.code });
      }

      async function comment(f: NetFile) {
        await f.comment();
      }
      return {
        registerTable,
        choose,
        setSelectedRowKeyList,
        clearSelect,
        openFile,
        preview,
        download,
        needCode,
        userPreview,
        t,
        registerForm,
        tableData,
        form,
        params,
        registerPdfDrawer,
        registerMarkdownModal,
        save,
        collection,
        comment,
        registerCollectModal,
        expired,
        code,
        fetchData,
        codeError,
        toExpired,
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
