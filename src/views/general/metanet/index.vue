<template>
  <Tabs>
    <TabPane key="1" :tab="t('files')"> <Files /></TabPane>
    <TabPane key="2" :tab="t('share')"> <Share /> </TabPane>
    <TabPane key="3" :tab="t('recycle')"> <Recycle /> </TabPane>
  </Tabs>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Tabs } from 'ant-design-vue';
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
    },
    setup() {
      return { t };
    },
  });
</script>
<style lang="less" scoped></style>
