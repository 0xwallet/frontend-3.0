<template>
  <ConfigProvider v-bind="lockEvent" :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';

  import { useLockPage } from '/@/hooks/web/useLockPage';
  import { initApollo } from '/@/hooks/apollo/apollo';
  import { initJS, useMClient, useWallet } from '/@/hooks/nkn/getNKN';
  import { userStore } from '/@/store/modules/user';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';

  export default defineComponent({
    name: 'App',
    components: { ConfigProvider, AppProvider },
    setup() {
      useTitle();

      // support Multi-language
      const { getAntdLocale } = useLocale();

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

      return { getAntdLocale, lockEvent };
    },
  });
</script>
