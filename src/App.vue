<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <!-- 增加开发环境的路由组件显示 -->
      <div v-if="isEnvDevelopment" class="fixed top-0 inset-x-0 m-auto px-10 w-max opacity-70 bg-gray-700 text-white z-999">
        <div>
          <span>当前路由:</span><span>{{curRouteObj.path}}</span>
        </div>
        <div>
          <span>路由组件:</span><span>{{curRouteObj.component}}</span>
        </div>
      </div>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts">
  import { defineComponent, watch ,reactive } from 'vue';
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '/@/components/Application';
  import { useRoute } from 'vue-router'
  import { initApollo } from '/@/hooks/apollo/apollo';
  import { initJS, useMClient, useWallet } from '/@/hooks/nkn/getNKN';
  import { useUserStore } from '/@/store/modules/user';
  import { useTitle } from '/@/hooks/web/useTitle';
  import { useLocale } from '/@/locales/useLocale';
  export default defineComponent({
    name: 'App',
    components: { ConfigProvider, AppProvider },
    setup() {
      const userStore = useUserStore();
      useTitle();

      // support Multi-language
      const { getAntdLocale } = useLocale();
      // 初始化 ApolloClient
      initApollo();
      // 加载外部JS pdf.js nkn.jsj
      initJS();

      useWallet().then(() => {
        console.log('wallet ready');
        useMClient();
      });
      userStore.checkNKN();

      // Create a lock screen monitor
      function useDevRouteComponentTips(){
        const isEnvDevelopment = import.meta.env.DEV;
        if(!isEnvDevelopment) return { isEnvDevelopment }
        const route = useRoute()
        const curRouteObj = reactive({
          path:'',
          component:''
        })
        watch(()=>route,(newVal)=>{
          let curRoute = [...newVal.matched].filter(i=>!i.redirect)[0]
          curRouteObj.path = curRoute.path
          curRouteObj.component  = curRoute.components.default['__file']
        },{
          immediate:true,
          deep:true
        })
        return {isEnvDevelopment,curRouteObj}
      }
      return { getAntdLocale,...useDevRouteComponentTips() };
    },
  });
</script>
