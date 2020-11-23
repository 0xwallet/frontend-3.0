<template>
  <BasicDrawer v-bind="$attrs" @register="register" title="Dashboard" width="50%">
    <Tabs>
      <TabPane key="1" tab="Tab Title 1">
        <p>Content of Tab Pane 1</p>
        <p>Content of Tab Pane 1</p>
        <p>Content of Tab Pane 1</p>
      </TabPane>
      <TabPane key="2" tab="Tab Title 2">
        <p>Content of Tab Pane 2</p>
        <p>Content of Tab Pane 2</p>
        <p>Content of Tab Pane 2</p>
      </TabPane></Tabs
    >
    <a-button type="primary" @click="closeDrawer">内部关闭drawer</a-button>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Tabs } from 'ant-design-vue';

  export default defineComponent({
    components: { BasicDrawer, Tabs, TabPane: Tabs.TabPane },
    setup() {
      const [register, { closeDrawer }] = useDrawerInner();

      return { register, closeDrawer };
    },
  });
</script>
