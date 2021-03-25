<template>
  <div>
    <Card :tab-list="tabList" :active-tab-key="tabKey" @tabChange="(key) => onTabChange(key)">
      <template #tabBarExtraContent
        ><InputSearch
          v-model:value="value"
          placeholder="input search text"
          enter-button
          @search="onSearch"
          class="search"
        />
      </template>
      <div class="tabsHeight">
        <template v-if="tabKey === 'basic'"><Files /></template>
        <template v-if="tabKey === 'share'"> <Share /> </template>
        <template v-if="tabKey === 'publish'"> <Publish /> </template>
        <template v-if="tabKey === 'collection'"> <Collection /> </template>
        <template v-if="tabKey === 'recycle'"> <Recycle /> </template>
      </div>
      <div class="h-28"></div>
    </Card>
    <FileInfo />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Tabs, Card, Input } from 'ant-design-vue';
  import Files from './files.vue';
  import Share from './share/share.vue';
  import Recycle from './recycle.vue';
  import Publish from './publish/index.vue';
  import Collection from './collection/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FileInfo } from '/@/components/NetFile';
  import { fileStore } from '/@/store/modules/netFile';
  const { t } = useI18n('general.metanet');
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
    },
    setup() {
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
      function onSearch() {}

      return { t, tabList, tabKey, onTabChange, onSearch, value };
    },
  });
</script>
<style>
  .tabsHeight {
    height: 74vh;
  }

  .search {
    margin: 10px;
  }
</style>
