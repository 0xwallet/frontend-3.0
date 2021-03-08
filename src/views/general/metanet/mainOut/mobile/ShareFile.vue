<template>
  <Card>
    <template #title>
      <Space
        ><Svg :width="30" :height="30" />
        <span>{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件 </span></Space
      ></template
    >
    <template #extra v-if="file"
      ><Button type="link" @click="openShareDrawer"
        ><MoreOutlined :style="{ fontSize: '26px' }" /></Button
    ></template>

    <BasicForm @register="registerForm" layout="vertical" v-if="needCode && file == null" />
    <div v-if="file" class="row">
      <Space direction="vertical" align="center">
        <div><Icon :type="file.type" :size="100" /></div>
        <div>{{ file.fullName.slice(-1)[0] }}</div>
        <div>{{ file.byteTransfer() }}</div>
        <div><Hash :hash="file.hash" /></div>
        <div
          ><Button type="primary" @click="preview(file)">{{ t('previewButton') }}</Button></div
        >
        <div
          ><Button @click="comment(file)">{{ t('comment') }}</Button></div
        ></Space
      >
    </div>

    <ShareDrawer @register="registerDrawer" :file="file" />
    <PdfDrawer @register="registerPdfDrawer" :file="file" :scale="0.5" />
    <MarkdownDrawer @register="registerMarkdownDrawer" :file="file" />
  </Card>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Hash, Icon, PdfDrawer, NetFile, NetGql, } from '/@/components/NetFile';
  import { Card, Space, Row, Col, Button } from 'ant-design-vue';
  import { Svg } from '/@/components/Svg';
  import { fileStore } from '/@/store/modules/netFile';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDrawer } from '/@/components/Drawer';
  import ShareDrawer from './component/ShareDrawer.vue';
  import MarkdownDrawer from './component/MarkdownDrawer.vue';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import {useModal} from "/@/components/Modal";
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    name: 'ReleaseFile',
    components: {
      Card,
      Svg,
      BasicForm,
      Space,
      CardMeta: Card.Meta,
      Row,
      Col,
      Button,
      ShareDrawer,
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
        return unref(currentRoute).query;
      });
      const needCode = ref(false);
      const userPreview = ref({});
      const file = computed(() => {
        return fileStore.getShareFile.find((f) => f.uri === params.value.uri) || null;
      });
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
      const [registerDrawer, { openDrawer }] = useDrawer();
      const [registerPdfDrawer, { openDrawer: openPdfDrawer }] = useDrawer();
      const [registerMarkdownDrawer, { openDrawer: openMarkdownDrawer }] = useDrawer();
      const { onResult: PreviewShare } = useQuery(NetGql.Share.Preview, params.value);
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
      function openShareDrawer() {
        openDrawer(true,{code:params.value.code});
      }
      async function comment(f: NetFile) {
        await f.comment();
      }
      return {
        file,
        registerForm,
        needCode,
        userPreview,
        preview,
        registerDrawer,
        openShareDrawer,
        t,
        registerPdfDrawer,
        registerMarkdownDrawer,
        comment,
      };
    },
  });
</script>
<style scoped lang="less">
  .row {
    width: 100%;
    margin: 5px;
    display: flex;
    display: -webkit-flex; /* Safari */
    justify-content: center;
  }
</style>
