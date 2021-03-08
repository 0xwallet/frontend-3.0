<template>
  <div class="p-4">
    <Card>
      <BasicTable @register="registerTable">
        <template #name="{ record }">
          <a-button type="link" @click="openFile(record.file)"
            ><Icon :type="record.file.type" />{{ record.file.fullName.slice(-1)[0] }}</a-button
          >
        </template>

        <template #action="{ record, text }">
          <div>
            <!--          <a-button type="link" v-if="record.type !== 'folder'">详情</a-button>-->
            <!--            <a-button type="link" v-if="text.type !== 'folder'" @click="preview(record)">{{-->
            <!--              t('previewButton')-->
            <!--            }}</a-button>-->
            <!--          <a-button type="link">复制路径</a-button>-->
            <!--            <a-button type="link" @click="download(record)">{{ t('downloadButton') }}</a-button>-->

            <a-button type="link" @click="collection(text)">{{ t('collectionButton') }}</a-button>
            <a-button type="link" @click="comment(record)">{{ t('comment') }}</a-button></div
          >
        </template>
      </BasicTable>
    </Card>
    <CollectModal @register="registerCollectModal" />
    <PdfDrawer @register="registerPdfDrawer" />
    <MarkdownModal @register="registerMarkdownModal" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, unref, ref } from 'vue';
  import { Card, Space, Row, Col, Avatar } from 'ant-design-vue';
  import { useRouter } from 'vue-router';
  import { useTable, BasicTable } from '/@/components/Table';
  import { getPublishColumns } from './tableData';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Hash, Icon, PdfDrawer, NetFile, NetGql,CollectModal } from '/@/components/NetFile';
  import { useQuery } from '@vue/apollo-composable';
  import router from '/@/router';
  import MarkdownModal from '../component/editor/Markdown.vue';
  import { useDrawer } from '/@/components/Drawer';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    name: 'TestTab',
    components: {
      Hash,
      BasicTable,
      Card,
      CardMeta: Card.Meta,
      Space,
      Row,
      Col,
      Avatar,
      PdfDrawer,
      MarkdownModal,
      Icon,CollectModal
    },
    setup() {
      const { currentRoute } = useRouter();
      const { createMessage } = useMessage();
      if (
        navigator.userAgent.match(
          /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
        ) !== null
      ) {
        console.log(unref(currentRoute).fullPath.replace(`/p/`, `/p-m/`));
        router.replace(unref(currentRoute).fullPath.replace(`/p/`, `/p-m/`));
      }
      const params = computed(() => {
        return unref(currentRoute).query.txid;
      });
      const tableData = ref([]);

      const [registerTable] = useTable({
        canResize: false,
        title: '文件列表',
        dataSource: tableData.value,
        columns: getPublishColumns(),
        rowKey: 'id',
        showIndexColumn: false,
      });
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      const [registerMarkdownModal, { openModal: openMarkdownModal }] = useModal();
      const [registerCollectModal, { openModal: openCollectModal }] = useModal();
      const { onResult: PublishFind } = useQuery(NetGql.Publish.Find, { txid: params.value });
      PublishFind((res) => {
        const data = res.data?.driveFindPublish;
        const f = new NetFile(data.current);
        f.publishInfo.id = data.id;
        tableData.value.push({ id: data.id, file: f });
      });
      // async function fetchData() {
      //   const { code } = await validateFields();
      //   params.value.code = code;
      //   await fileStore.fetchShareFile(params.value);
      // }

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
        // if (!f.isDir) {
        //   return;
        // }
        // if (f.type === 'md') {
        //   // openMDModal(f);
        // } else if (f.type === 'png') {
        //   f.preview();
        // }
        // return;
      }

      async function collection(f: NetFile) {
        openCollectModal(true,{mode:'publish',id:f.publishInfo.id})
      }

      async function comment(f: NetFile) {
        await f.comment();
      }
      return {
        registerTable,
        openFile,
        preview,
        download,
        t,
        params,
        registerPdfDrawer,
        registerMarkdownModal,
        collection,
        comment,registerCollectModal
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
