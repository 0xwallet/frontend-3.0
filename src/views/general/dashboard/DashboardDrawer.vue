<template>
  <BasicDrawer v-bind="$attrs" @register="register" title="Dashboard" width="50%">
    <Tabs>
      <TabPane key="1" tab="下载状态">
        <Download />
      </TabPane>
    </Tabs>
    <a-button type="primary" @click="closeDrawer">内部关闭drawer</a-button>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Tabs } from 'ant-design-vue';
  import Download from './download.vue';
  export default defineComponent({
    components: { BasicDrawer, Tabs, TabPane: Tabs.TabPane, Download },
    setup() {
      const [register, { closeDrawer }] = useDrawerInner();

      return { register, closeDrawer };
    },
  });
</script>
