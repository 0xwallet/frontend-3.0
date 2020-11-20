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
  import { useScript } from '/@/hooks/web/useScript';
  import { useApolloWS } from '/@/hooks/apollo/apollo';
  import { driveFileUploaded } from '/@/hooks/apollo/gqlFile';
  import Observable from 'zen-observable';
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
      const time = setInterval(() => {
        console.log('检测ws');
        if (localStorage.getItem('token') && !useApolloWS()) {
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
          clearInterval(time);
        }
      }, 500);

      // 加载nkn.JS
      const { toPromise: loadNKN } = useScript({
        src: `./resource/nkn/nkn.js`,
      });
      loadNKN().then(() => {
        console.log('NKN加载成功');
      });
      // 加载crypto-js
      const { toPromise: loadCrypto } = useScript({
        src: `./resource/crypto-js/crypto-js.js`,
      });
      loadCrypto().then(() => {
        console.log('crypto加载成功');
      });
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
