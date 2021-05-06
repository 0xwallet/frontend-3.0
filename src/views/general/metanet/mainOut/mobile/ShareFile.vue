<template>
  <div class="background h-full">
    <div class="h-10 flex justify-between p-2">
      <Svg :width="30" :height="30" />
      <div class="text-white">{{ expired || '' }}</div>
      <MoreOutlined :style="{ fontSize: '26px', color: 'white' }" @click="openShareDrawer"
    /></div>
    <div class="bg-white h-7/8 mt-10 m-4 rounded-lg static">
      <div class="flex justify-center">
        <Avatar
          class="absolute bottom-7 border-1 border-white"
          :size="60"
          :src="!expired ? `/resource/img/info.png` : userPreview.avatar"
        />
      </div>
      <div v-if="expired">
        <div class="flex justify-center">{{ userPreview.username }}</div>
        <div class="flex justify-center" v-if="userPreview.bio">{{ userPreview.bio }}</div>
        <div class="flex justify-center mt-10" v-if="needCode">
          <BasicForm @register="registerForm" layout="vertical"
        /></div>
        <div class="m-4"><Divider /></div
      ></div>
      <div class="flex justify-center" v-if="!expired">分享已过期</div>
      <AppLocalePicker
        class="absolute bottom-8 right-6 enter-x text-black xl:text-gray-600"
        :showText="false"
      />
      <div class="m-2" v-if="expired">
        <List item-layout="horizontal" :data-source="files">
          <template #renderItem="{ item }">
            <ListItem>
              <ListItemMeta @click="openFile(item)">
                <template #title>
                  <div class="w-3/4">
                    {{
                      item.fileName() == '...'
                        ? '...'
                        : item.fullName.slice(-1)[0].split('.').slice(0)[0].length > 20
                        ? item.fullName.slice(-1)[0].split('.').slice(0)[0].slice(0, 20) + '...'
                        : item.fullName.slice(-1)[0].split('.').slice(0)[0]
                    }}{{ item.type == 'folder' ? '' : '.' + item.type }}</div
                  >
                  <div class="flex justify-between">
                    <span class="text-gray-300">{{ item.desc }}</span
                    ><span>
                      <StarOutlined class="m-1" />{{ item.status.collectedCount || 0 }}</span
                    ></div
                  >
                </template>
                <template #avatar>
                  <Icon :type="item.type" />
                </template>
              </ListItemMeta>
            </ListItem>
          </template>
        </List>
      </div>
    </div>
    <!--    <Card>-->
    <!--      <template #title>-->
    <!--        <Space-->
    <!--          ><Svg :width="30" :height="30" />-->
    <!--          <span>{{ userPreview.username }} 给你{{ needCode ? '加密' : '' }}分享了文件 </span></Space-->
    <!--        ></template-->
    <!--      >-->
    <!--      <template #extra v-if="file"-->
    <!--        ><Button type="link" @click="openShareDrawer"-->
    <!--          ><MoreOutlined :style="{ fontSize: '26px' }" /></Button-->
    <!--      ></template>-->

    <!--      <div v-if="!isDir" class="grid grid-col-1 gap-2 place-items-center">-->
    <!--        <div><Icon :type="file.type" :size="100" /></div>-->
    <!--        <div>{{ file.fileName() }}</div>-->
    <!--        <div>{{ file.byteTransfer() }}</div>-->
    <!--        <div><Hash :hash="file.hash" v-if="file.hash" /></div>-->
    <!--        <div-->
    <!--          ><Button type="primary" @click="preview(file)">{{ t('previewButton') }}</Button></div-->
    <!--        >-->
    <!--        <div-->
    <!--          ><Button @click="comment(file)">{{ t('comment') }}</Button></div-->
    <!--        >-->
    <!--      </div>-->

    <ShareDrawer @register="registerDrawer" :file="file" />
    <PdfDrawer @register="registerPdfDrawer" :file="file" :scale="0.5" />
    <MarkdownDrawer @register="registerMarkdownDrawer" :file="file" />
    <!--    </Card>-->
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';
  import { Hash, Icon, PdfDrawer, NetFile, NetGql } from '/@/components/NetFile';
  import { Card, Space, Row, Col, Button, List, Avatar, Typography, Divider } from 'ant-design-vue';
  import { Svg } from '/@/components/Svg';
  import { useNetFileStore } from '/@/store/modules/netFile';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDrawer } from '/@/components/Drawer';
  import ShareDrawer from './component/ShareDrawer.vue';
  import MarkdownDrawer from './component/MarkdownDrawer.vue';
  import { MoreOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  const { t } = useI18n('general.metanet');
  import { AppLogo } from '/@/components/Application';
  import { AppLocalePicker } from '/@/components/Application';
  import { StarOutlined } from '@ant-design/icons-vue';
  import { dateUtil } from '/@/utils/dateUtil';

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
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      AppLogo,
      Avatar,
      AppLocalePicker,
      TypographyText: Typography.Text,
      StarOutlined,
      Divider,
      InfoCircleOutlined,
    },
    setup() {
      const fileStore = useNetFileStore();
      const { currentRoute } = useRouter();
      const expired = ref(false);
      const params = computed(() => {
        return unref(currentRoute).query;
      });
      const needCode = ref(false);
      const userPreview = ref({});
      const isDir = ref(true);
      const file = ref<NetFile>({});
      const files = computed<NetFile[]>(() => {
        if (fileStore.getShareFile[0]) {
          isDir.value = fileStore.getShareFile[0]?.isDir;
          file.value = fileStore.getShareFile[0];
        }
        console.log(fileStore.getShareFile);
        return fileStore.getShareFile;
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
      PreviewShare(({ data }) => {
        const { drivePreviewShare } = data;
        if (drivePreviewShare) {
          console.log();
          expired.value =
            '🗓️ ' +
            dateUtil(drivePreviewShare.expiredAt).format('YY-MM-DD ') +
            '⏳ ' +
            dateUtil(drivePreviewShare.expiredAt).fromNow(true);
          needCode.value = drivePreviewShare?.needCode;
          // needCode.value = true;
          userPreview.value = drivePreviewShare?.UserPreview;
          console.log(drivePreviewShare);
          fetchData();
        }
      });
      async function fetchData() {
        if (!needCode.value) {
          await fileStore.fetchShareFile(params.value);
        } else {
          const { code } = await validateFields();
          params.value.code = code;
          await fileStore.fetchShareFile(params.value);
        }
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
        openDrawer(true, { code: params.value.code });
      }
      async function comment(f: NetFile) {
        await f.comment();
      }

      function openFile(f: NetFile) {
        if (f.isDir) {
          if (f.id === 'root') {
            fetchData();
            return;
          }
          fileStore.fetchShareFiles({ token: f.shareInfo.token, dirId: f.id });
          return;
        }
        file.value = f;
        preview(f);
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
        isDir,
        files,
        openFile,
        expired,
      };
    },
  });
</script>
<style>
  .background {
    background-color: #404a66;
  }
</style>
