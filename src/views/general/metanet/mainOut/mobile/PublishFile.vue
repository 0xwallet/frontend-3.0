<template>
  <div>
    <Card v-if="file">
      <template #title>
        <Space><Svg :width="30" :height="30" /> <span>发布文件 </span></Space></template
      >
      <template #extra
        ><Button type="link" @click="openPublishDrawer"
          ><MoreOutlined :style="{ fontSize: '26px' }" /></Button
      ></template>

      <div class="grid grid-rows-1 flex justify-center text-center gap-y-4">
        <div><Icon :type="file.type" :size="100" /></div>
        <div>{{ file.fullName.slice(-1)[0] }}</div>
        <div>{{ file.byteTransfer() }}</div>
        <div><Hash :hash="file.hash" /></div>
        <div
          ><Button type="primary" @click="preview(file)">{{ t('previewButton') }}</Button></div
        >
        <div
          ><Button @click="comment(file)">{{ t('comment') }}</Button></div
        >
      </div>
    </Card>
    <PublishDrawer @register="registerDrawer" :file="file" />
    <PdfDrawer @register="registerPdfDrawer" :file="file" :scale="0.5" />
    <MarkdownDrawer @register="registerMarkdownDrawer" :file="file" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Hash, Icon, PdfDrawer, NetFile, NetGql } from '/@/components/NetFile';
  import { Card, Space, Row, Col, Button } from 'ant-design-vue';
  import { Svg } from '/@/components/Svg';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDrawer } from '/@/components/Drawer';
  import PublishDrawer from './component/PublishDrawer.vue';
  import MarkdownDrawer from './component/MarkdownDrawer.vue';
  import { MoreOutlined } from '@ant-design/icons-vue';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    name: 'ReleaseFile',
    components: {
      Card,
      Svg,
      CardMeta: Card.Meta,
      Row,
      Col,
      Space,
      Button,
      PublishDrawer,
      MoreOutlined,
      PdfDrawer,
      Icon,
      Hash,
      MarkdownDrawer,
    },
    setup() {
      const { currentRoute } = useRouter();

      const { createErrorModal } = useMessage();
      const params = computed(() => {
        return unref(currentRoute).query.txid;
      });

      const publish = ref({});
      const file: NetFile = ref<NetFile>({});
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      const [registerMarkdownDrawer, { openDrawer: openMarkdownDrawer }] = useDrawer();
      const { onResult: PublishFind } = useQuery(NetGql.Publish.Find, { txid: params.value });
      PublishFind((res) => {
        const data = res.data?.driveFindPublish;
        const f = new NetFile(data.current);
        f.publishInfo.id = data.id;
        file.value = f;
        publish.value = { id: data.id, file: f };
      });

      async function preview(f: NetFile) {
        switch (f.type) {
          case 'pdf':
            openPdfDrawer(true, { file: f }, true);
            break;
          case 'md':
            openMarkdownDrawer(true, {}, true);
            break;
          default:
            await f.preview();
        }
      }
      function openPublishDrawer() {
        openDrawer(true);
      }
      async function comment(f: NetFile) {
        await f.comment();
      }
      return {
        preview,
        registerDrawer,
        openPublishDrawer,
        t,
        publish,
        registerPdfDrawer,
        registerMarkdownDrawer,
        comment,
        file,
      };
    },
  });
</script>
