<template>
  <ConfigProvider v-bind="lockEvent" :locale="zhCN" :transform-cell-text="transformCellText">
    <router-view />
  </ConfigProvider>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { createBreakpointListen } from '/@/hooks/event/useBreakpoint';

  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import moment from 'moment';
  import 'moment/dist/locale/zh-cn';

  import { getConfigProvider, initAppConfigStore } from '/@/setup/App';
  import { useLockPage } from '/@/hooks/web/useLockPage';

  moment.locale('zh-cn');
  import apollo from '/src/lib/esm/apollo';
  import { useApolloWS } from '/@/hooks/apollo/apollo';
  import { driveFileUploaded } from '/@/hooks/apollo/gqlFile';
  import Observable from 'zen-observable';
  import { initJS, useMClient, useWallet } from '/@/hooks/nkn/getNKN';
  apollo.init({
    apiUrl: 'https://owaf.io/api',
  });

  export default defineComponent({
    name: 'App',
    components: { ConfigProvider },
    setup() {
      // Initialize vuex internal system configuration
      initAppConfigStore();

      // Create a global breakpoint monitor
      createBreakpointListen();

      // Get ConfigProvider configuration
      const { transformCellText } = getConfigProvider();
      //加载外部JS
      initJS();
      //检测apolloWS链接

      useWallet().then(() => {
        console.log('wallet ready');
        useMClient();
      });
      const time = setInterval(() => {
        if (localStorage.getItem('token') !== 'undefined' && !useApolloWS()) {
          // 启动ws
          apollo.initWS({ url: 'wss://owaf.io/socket' });
          const ob = useApolloWS().subscribe({
            query: driveFileUploaded,
            variables: { userId: localStorage.getItem('uid') },
          }) as Observable<any>;
          ob.subscribe(
            (data) => {
              console.log('Data', data);
            },
            (e) => {
              console.log(e);
            }
          );
          console.log('ws ready');
          clearInterval(time);
        }
      }, 500);

      // Create a lock screen monitor
      const lockEvent = useLockPage();

      return {
        transformCellText,
        zhCN,
        lockEvent,
      };
    },
  });
</script>
