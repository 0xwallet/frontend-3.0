<template>
  <Card
    :tab-list="tabList"
    :active-tab-key="tabKey"
    @tabChange="(key) => onTabChange(key)"
    class="tabs"
  >
    <template #tabBarExtraContent>
      <InputSearch
        v-model:value="value"
        placeholder="input search text"
        enter-button
        @search="onSearch"
        style="margin: 10px"
      />
    </template>
    <template v-if="tabKey === 'files'"><Files /></template>
    <template v-if="tabKey === 'share'"> <Share /> </template>
    <template v-if="tabKey === 'recycle'"> <Recycle /> </template>
    <template v-if="tabKey === 'publish'"> <Publish /> </template>
  </Card>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Tabs, Card, Input } from 'ant-design-vue';
  import Files from './files.vue';
  import Share from './share/share.vue';
  import Recycle from './recycle.vue';
  import Publish from './publish/index.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: {
      Tabs,
      TabPane: Tabs.TabPane,
      Files,
      Share,
      Recycle,
      Card,
      Publish,
      InputSearch: Input.Search,
    },
    setup() {
      const tabList = [
        {
          key: 'files',
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
          key: 'recycle',
          tab: t('recycle'),
        },
      ];
      const tabKey = ref('files');
      function onTabChange(key) {
        tabKey.value = key;
      }
      const value = ref('');
      function onSearch() {}
      return { t, tabList, tabKey, onTabChange, onSearch, value };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>
