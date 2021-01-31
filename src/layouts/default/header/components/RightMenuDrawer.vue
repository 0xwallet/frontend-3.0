<template>
  <BasicDrawer v-bind="$attrs" @register="register" width="25%">
    <template #title></template>
    <Tabs>
      <TabPane key="1" :tab="t('todo')"> Content of Tab Pane 1 </TabPane>
      <TabPane key="2" :tab="t('message')"> Content of Tab Pane 2 </TabPane>
      <TabPane key="3" :tab="t('setting')"> Content of Tab Pane 3 </TabPane>
    </Tabs>
  </BasicDrawer>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useGo } from '/@/hooks/web/usePage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Tabs } from 'ant-design-vue';

  export default defineComponent({
    name: 'RightMenuDrawer',
    components: { BasicDrawer, Tabs, TabPane: Tabs.TabPane },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const [register, { closeDrawer, setDrawerProps }] = useDrawerInner(() => {
        // setDrawerProps({ mask: false });
        console.log(123);
      });
      const { t } = useI18n('layout.header');
      const go = useGo();
      return { t, register };
    },
  });
</script>
<style lang="less"></style>
