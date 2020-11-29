<template>
  <Tabs>
    <TabPane key="1" tab="我的文件"> <Files /></TabPane>
    <TabPane key="2" tab="我的分享"> <Share /> </TabPane>
    <TabPane key="3" tab="回收站"> <Recycle /> </TabPane>
  </Tabs>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Tabs } from 'ant-design-vue';
  import Files from './files.vue';
  import Share from './share/share.vue';
  import Recycle from './recycle.vue';

  export default defineComponent({
    components: {
      Tabs,
      TabPane: Tabs.TabPane,
      Files,
      Share,
      Recycle,
    },
    setup() {
      return {};
    },
  });
</script>
<style lang="less" scoped></style>
