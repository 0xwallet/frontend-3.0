<template>
  <div class="px-10 py-4">
    <a-button type="primary" class="my-4" @click="openDrawer">右侧Drawer</a-button>
    <DashboardDrawer @register="registerDrawer" />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Alert } from 'ant-design-vue';
  import { useDrawer } from '/@/components/Drawer';
  import DashboardDrawer from './DashboardDrawer.vue';

  export default defineComponent({
    components: { Alert, DashboardDrawer },
    setup() {
      const [registerDrawer, { openDrawer }] = useDrawer();
      function send() {
        // transferDrawerData({
        //   data: 'content',
        //   info: 'Info',
        // });
        openDrawer4(true, {
          data: 'content',
          info: 'Info',
        });
      }
      function openDrawerLoading() {
        openDrawer1();
        setDrawerProps({ loading: true });
        setTimeout(() => {
          setDrawerProps({ loading: false });
        }, 2000);
      }
      return {
        registerDrawer,
        openDrawer,
        send,
        openDrawerLoading,
      };
    },
  });
</script>
