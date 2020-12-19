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
    <template v-else-if="tabKey === 'share'"> <Share /> </template>
    <template v-else="tabKey === 'recycle'"> <Recycle /> </template>
  </Card>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Tabs, Card, Input } from 'ant-design-vue';
  import Files from './files.vue';
  import Share from './share/share.vue';
  import Recycle from './recycle.vue';
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
          key: 'recycle',
          tab: t('recycle'),
        },
      ];
      const tabKey = ref('files');
      function onTabChange(key) {
        tabKey.value = key;
      }
      return { t, tabList, tabKey, onTabChange };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>
