<template>
  <div :class="prefixCls" @touchstart="touchstart" @touchend="touchend">
    <Login sessionTimeout />
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import Login from './Login.vue';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useUserStore } from '/@/store/modules/user';

  export default defineComponent({
    name: 'SessionTimeoutLogin',
    components: { Login },
    setup() {
      const { prefixCls } = useDesign('st-login');
      const userStore = useUserStore();
      const startX = ref(0);
      const startY = ref(0);
      function touchstart(e) {
        // 如果你要阻止点击事件，请反注释下一行代码
        // e.preventDefault();
        startX.value = e.touches[0].clientX;
        startY.value = e.touches[0].clientY;
      }

      function touchend(e) {
        // e.preventDefault();
        if (startX.value - e.changedTouches[0].clientX > 30) {
          userStore.setSessionTimeout(false);
        }
      }
      history.pushState(null, null, document.URL);

      window.addEventListener('popstate', () => {
        userStore.setSessionTimeout(false);
        history.pushState(null, null, document.URL);
      });

      return { prefixCls, touchstart, touchend };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-st-login';

  .@{prefix-cls} {
    position: fixed;
    z-index: 9999999;
    width: 100%;
    height: 100%;
    background: @component-background;
  }
</style>
