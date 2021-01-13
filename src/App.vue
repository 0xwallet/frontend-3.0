<template>
  <ConfigProvider v-bind="lockEvent" :locale="antConfigLocale">
    <AppProvider>
      <router-view />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts">
  import { defineComponent, provide } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';

  import { initAppConfigStore } from '/@/setup/App';

  import { useLockPage } from '/@/hooks/web/useLockPage';
  import { initApollo } from '/@/hooks/apollo/apollo';
  import { initJS, useMClient, useWallet } from '/@/hooks/nkn/getNKN';

  import { useLocale } from '/@/hooks/web/useLocale';
  import { userStore } from '/@/store/modules/user';

  import { AppProvider } from '/@/components/Application';

  export default defineComponent({
    name: 'App',
    components: { ConfigProvider, AppProvider },
    setup() {
      // Initialize vuex internal system configuration
      initAppConfigStore();
      initApollo();
      //加载外部JS
      initJS();

      useWallet().then(() => {
        console.log('wallet ready');
        useMClient();
      });
      userStore.checkNKN();

      // Create a lock screen monitor
      const lockEvent = useLockPage();

      // support Multi-language
      const { antConfigLocale } = useLocale();

      return {
        antConfigLocale,
        lockEvent,
      };
    },
  });
</script>
