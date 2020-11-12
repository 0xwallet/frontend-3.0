import type { App } from 'vue';
import { createApp } from 'vue';
import Root from './App.vue';
import graphql from './plugins/graphql';
import antd from './plugins/antd';
import global from './plugins/global';
import store from './store';
import router from './router';
import wallet from './plugins/wallet';
import i18n from './plugins/i18n';
import 'ant-design-vue/dist/antd.css';
import './styles/global.less';

const app: App = createApp(Root);

app.use(global).use(i18n).use(router).use(store).use(antd).use(graphql).use(wallet);

router.isReady().then(() => {
  app.mount('#app');
});
