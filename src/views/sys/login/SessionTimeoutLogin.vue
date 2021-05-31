<template>
  <transition>
    <div :class="prefixCls" @touchstart="touchstart" @touchend="touchend">
      <Login sessionTimeout />
    </div>
  </transition>
</template>
<script lang="ts">
  import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import Login from './Login.vue';

  import { useDesign } from '/@/hooks/web/useDesign';
  import { useUserStore } from '/@/store/modules/user';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useAppStore } from '/@/store/modules/app';
  import { PermissionModeEnum } from '/@/enums/appEnum';
  export default defineComponent({
    name: 'SessionTimeoutLogin',
    components: { Login },
    setup() {
      const { prefixCls } = useDesign('st-login');
      const permissionStore = usePermissionStore();
      const appStore = useAppStore();
      const userId = ref<Nullable<number | string>>(0);
      const userStore = useUserStore();
      const startX = ref(0);
      const moveX = ref(0);
      const startY = ref(0);
      const moveY = ref(0);
      function touchstart(e) {
        // 如果你要阻止点击事件，请反注释下一行代码
        e.preventDefault();
        startX.value = e.touches[0].clientX;
        startY.value = e.touches[0].clientY;
      }
      function touchmove(e) {
        e.preventDefault();
        moveX.value = e.touches[0].clientX;
        moveY.value = e.touches[0].clientY;
      }
      function touchend(e) {
        e.preventDefault();
        if (startX.value - e.changedTouches[0].clientX > 30) {
          userStore.setSessionTimeout(false);
        }
      }
      history.pushState(null, null, document.URL);

      window.addEventListener('popstate', () => {
        console.log(111);
        history.pushState(null, null, document.URL);
      });

      // const isBackMode = () => {
      //   return appStore.getProjectConfig.permissionMode === PermissionModeEnum.BACK;
      // };

      // onMounted(() => {
      //   // 记录当前的UserId
      //   userId.value = userStore.getUserInfo?.userId;
      //   console.log('Mounted', userStore.getUserInfo);
      // });
      //
      // onBeforeUnmount(() => {
      //   if (userId.value && userId.value !== userStore.getUserInfo.userId) {
      //     // 登录的不是同一个用户，刷新整个页面以便丢弃之前用户的页面状态
      //     document.location.reload();
      //   } else if (isBackMode() && permissionStore.getLastBuildMenuTime === 0) {
      //     // 后台权限模式下，没有成功加载过菜单，就重新加载整个页面。这通常发生在会话过期后按F5刷新整个页面后载入了本模块这种场景
      //     document.location.reload();
      //   }
      // });

      return { prefixCls, touchstart, touchmove, touchend };
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
