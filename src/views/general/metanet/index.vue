<template>
  <PageWrapper dense contentFullHeight>
    <Card :tab-list="tabList" :active-tab-key="tabKey" @tabChange="(key) => onTabChange(key)">
      <template #tabBarExtraContent>
        <div class="m-2">
          <InputSearch
            v-model:value="value"
            placeholder="input search text"
            enter-button
            @search="onSearch"
            :loading="loading"
            allow-clear
        /></div>
      </template>
      <div>
        <!-- 我的 文件 / 分享 / 发布 / 收藏 / 回收站 -->
        <template v-if="tabKey === 'basic'"><Files /></template>
        <template v-if="tabKey === 'share'"> <Share /> </template>
        <template v-if="tabKey === 'publish'"> <Publish /> </template>
        <template v-if="tabKey === 'collection'"> <Collection /> </template>
        <template v-if="tabKey === 'recycle'"> <Recycle /> </template>
      </div>
      <div class="h-28"></div>
    </Card>
    <!-- 文件信息 点击右上角的 info 弹出来的弹窗 -->
    <FileInfo />
  </PageWrapper>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Tabs, Card, Input } from 'ant-design-vue';
  import Files from './files.vue';
  import Share from './share/index.vue';
  import Recycle from './recycle.vue';
  import Publish from './publish/index.vue';
  import Collection from './collection/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FileInfo } from '/@/components/NetFile';
  import { useNetFileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
  import { PageWrapper } from '/@/components/Page';
  export default defineComponent({
    components: {
      FileInfo,
      Tabs,
      TabPane: Tabs.TabPane,
      Files,
      Share,
      Recycle,
      Card,
      Publish,
      InputSearch: Input.Search,
      Collection,
      PageWrapper,
    },
    setup() {
      const fileStore = useNetFileStore();
      fileStore.useWs();
      const tabList = [
        {
          key: 'basic',
          tab: t('files'),
        },
        {
          key: 'share',
          tab: t('share'),
        },
        {
          key: 'publish',
          tab: t('publishTitle'),
        },
        {
          key: 'collection',
          tab: t('collectionTitle'),
        },
        {
          key: 'recycle',
          tab: t('recycle'),
        },
      ];
      const tabKey = ref('basic');
      function onTabChange(key) {
        fileStore.setFileInfo({
          file: fileStore.getFileInfo.file,
          mode: key,
          collection: key === 'collection',
        });
        tabKey.value = key;
      }
      const value = ref('');
      const loading = ref(false);
      async function onSearch(v) {
        if (!v) return;
        loading.value = true;
        try {
          await fileStore.searchFile(v);
        } catch (e) {
          console.log(e);
        } finally {
          loading.value = false;
        }
      }

      return { t, tabList, tabKey, onTabChange, onSearch, value, loading };
    },
  });
</script>
