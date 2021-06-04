<template>
  <div class="background h-full container">
    <SessionTimeoutLogin v-if="getIsSessionTimeout" />
    <div class="h-10 flex justify-between p-2">
      <Svg :width="30" :height="30" type="footer" />
      <div class="text-white" v-if="!!expired">{{ expired }}</div>
      <MoreOutlined :style="{ fontSize: '26px', color: 'white' }" @touchend="openShareDrawer"
    /></div>
    <div class="relative bg-white mt-10 rounded-lg m-4 h-10/12">
      <div class="flex justify-center">
        <Avatar
          class="absolute bottom-7 border-1 border-white"
          :size="60"
          :src="!expired ? `/resource/img/info.png` : userPreview.avatar"
        />
      </div>
      <div v-if="!!expired">
        <div class="flex justify-center">{{ userPreview.username }}</div>
        <div class="flex justify-center" v-if="userPreview.bio">{{ userPreview.bio }}</div>

        <div class="m-4"><Divider /></div>
        <div class="text-center text-red-500" v-if="codeError">{{ t('accessCodeWrong') }} </div>
        <div class="flex justify-center mt-10" v-show="needCode">
          <BasicForm @register="registerForm" layout="vertical"
        /></div>
      </div>
      <div class="flex justify-center" v-if="expired === 'expired'"
        >{{ t('shareButton') }} {{ t('expired') }}</div
      >
      <AppLocalePicker
        class="absolute bottom-2 right-2 enter-x text-black xl:text-gray-600"
        :showText="false"
        :reload="true"
      />
      <div class="m-2" v-if="!!expired">
        <List item-layout="horizontal" :data-source="files" v-if="!needCode">
          <template #renderItem="{ item }">
            <ListItem>
              <ListItemMeta @touchend="openFile(item)">
                <template #title>
                  <div class="w-3/4">
                    {{
                      item.fileName() === '...'
                        ? '...'
                        : item.fullName.slice(-1)[0].split('.').slice(0)[0].length > 20
                        ? item.fullName.slice(-1)[0].split('.').slice(0)[0].slice(0, 20) + '...'
                        : item.fullName.slice(-1)[0].split('.').slice(0)[0]
                    }}{{ item.type === 'folder' ? '' : '.' + item.type }}</div
                  >
                  <div class="flex justify-between">
                    <Desc
                      :desc="item.desc"
                      :id="item.id"
                      :share="true"
                      class="text-gray-300 flex-grow"
                    /><span>
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
    <ShareDrawer @register="registerDrawer" :file="file" />
    <PdfDrawer @register="registerPdfDrawer" :file="file" :scale="0.5" />
    <MarkdownDrawer @register="registerMarkdownDrawer" :file="file" />
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, nextTick, ref, unref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';
  import { Icon, PdfDrawer, NetFile, NetGql } from '/@/components/NetFile';
  import { Button, List, Avatar, Divider } from 'ant-design-vue';
  import { Svg } from '/@/components/Svg';
  import { useNetFileStore } from '/@/store/modules/netFile';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDrawer } from '/@/components/Drawer';
  import ShareDrawer from './component/ShareDrawer.vue';
  import MarkdownDrawer from './component/MarkdownDrawer.vue';
  import { MoreOutlined } from '@ant-design/icons-vue';
  const { t } = useI18n('general.metanet');
  import { AppLocalePicker } from '/@/components/Application';
  import { StarOutlined } from '@ant-design/icons-vue';
  import { dateUtil } from '/@/utils/dateUtil';
  import Desc from '/@/components/NetFile/components/Desc.vue';
  import SessionTimeoutLogin from '/@/views/sys/login/SessionTimeoutLogin.vue';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'MobileShareFile',
    components: {
      Svg,
      BasicForm,
      Button,
      ShareDrawer,
      MoreOutlined,
      PdfDrawer,
      Icon,
      MarkdownDrawer,
      List,
      ListItem: List.Item,
      ListItemMeta: List.Item.Meta,
      Avatar,
      AppLocalePicker,
      StarOutlined,
      Divider,
      Desc,
      SessionTimeoutLogin,
    },
    setup() {
      const userStore = useUserStore();
      const getIsSessionTimeout = computed(() => userStore.getSessionTimeout);
      const fileStore = useNetFileStore();
      const { currentRoute } = useRouter();
      const expired = ref('');
      const params = computed(() => {
        return unref(currentRoute).query;
      });
      const codeError = ref(false);
      const needCode = ref(false);
      const userPreview = ref({});
      const isDir = ref(true);
      const file = ref<NetFile>({});
      const files = computed<NetFile[]>(() => {
        if (fileStore.getShareFile[0]) {
          isDir.value = fileStore.getShareFile[0]?.isDir;
          file.value = fileStore.getShareFile[0];
        }
        return fileStore.getShareFile;
      });
      const [registerForm, { validateFields }] = useForm({
        schemas: [
          {
            field: 'code',
            component: 'Input',
            label: t('accessCode'),
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
          text: t('submit'),
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
          expired.value =
            '🗓️ ' +
            dateUtil(drivePreviewShare.insertedAt).format('YY-MM-DD ') +
            '⏳ ' +
            dateUtil(drivePreviewShare.expiredAt).fromNow(true);
          needCode.value = drivePreviewShare?.needCode;
          // needCode.value = true;
          userPreview.value = drivePreviewShare?.UserPreview;
          nextTick(() => {
            if (!needCode.value) fileStore.fetchShareFile(params.value);
          });
        } else {
          expired.value = 'expired';
        }
      });
      async function fetchData() {
        codeError.value = false;
        const { code } = await validateFields();
        params.value.code = code;
        const res = await fileStore.fetchShareFile(params.value);
        console.log(res);
        if (res) {
          needCode.value = false;
        } else {
          codeError.value = true;
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
        codeError,
        getIsSessionTimeout,
      };
    },
  });
</script>
<style>
  .background {
    background-color: #404a66;
  }
</style>
