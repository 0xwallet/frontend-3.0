import '/@/design/index.less';

// Register windi
import 'virtual:windi.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import { createApp } from 'vue';
import App from './App.vue';
import { initAppConfigStore } from '/@/logics/initAppConfig';
import { setupErrorHandle } from '/@/logics/error-handle';
import router, { setupRouter } from '/@/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { setupGlobDirectives } from '/@/directives';
import { setupI18n } from '/@/locales/setupI18n';
import { registerGlobComp } from '/@/components/registerGlobComp';

// Do not introduce on-demand in local development?
// In the local development for introduce on-demand, the number of browser requests will increase by about 20%.
// Which may slow down the browser refresh.
// Therefore, all are introduced in local development, and only introduced on demand in the production environment
if (import.meta.env.DEV) {
  import('ant-design-vue/dist/antd.less');
}

async function bootstrap() {
  const app = createApp(App);

  // Configure store
  // 1. 设置全局数据管理 pinia (类vuex)
  setupStore(app);

  // Initialize internal system configuration
  // 2. 初始化内部系统配置 语言/主题
  initAppConfigStore();

  // Register global components
  // 3. 初始化全局 Icon Button ButtonGroup 组件
  registerGlobComp(app);

  // Multilingual configuration
  // 4. 设置国际化语言
  await setupI18n(app);

  // Configure routing
  // 5. 安装路由
  setupRouter(app);

  // router-guard
  // 6. 路由守卫 page / pageLoading / http / scroll / message / progress / permission / state
  setupRouterGuard();

  // Register global directive
  // 7. 注册全局钩子 验证 v-auth / loading v-loading
  setupGlobDirectives(app);

  // Configure global error handling
  // 8. 错误处理 appError / windowError / promiseError / resourceError
  setupErrorHandle(app);

  // Mount when the route is ready
  // https://next.router.vuejs.org/api/#isready
  // 9. 等待路由 ready
  await router.isReady();
  // 10. 挂载 app
  app.mount('#app', true);
}

void bootstrap();
