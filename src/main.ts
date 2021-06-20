import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// import store from "./store";
import { createPinia } from "pinia";
import "tailwindcss/tailwind.css";
import languages from "./languages";
import { useLocalStorage } from "@vueuse/core";
const app = createApp(App);
// 注册全局属性
// 专门给模板中调试事件用的 @click="$log"
app.config.globalProperties.$log = console.log;

// 国际化 --start
import { createI18n } from "vue-i18n";
import { DEFAULT_LANG } from "./const";
// 注意 是响应式的
const storageLocale = useLocalStorage("locale", DEFAULT_LANG);
export const i18n = createI18n({
  messages: languages,
  locale: storageLocale.value,
  fallbackLocale: DEFAULT_LANG,
});
app.use(i18n);
// 国际化 --end

// ant-design-vue --start
import {
  ConfigProvider,
  Menu,
  Dropdown,
  Form,
  Select,
  Checkbox,
  Button,
  Input,
  InputNumber,
  Row,
  Col,
  Tooltip,
  Divider,
  Breadcrumb,
  Avatar,
  Tabs,
  Table,
  Upload,
  Layout,
} from "ant-design-vue";
app
  .use(ConfigProvider)
  .use(Menu)
  .use(Dropdown)
  .use(Form)
  .use(Select)
  .use(Checkbox)
  .use(Button)
  .use(Input)
  .use(InputNumber)
  .use(Row)
  .use(Col)
  .use(Tooltip)
  .use(Divider)
  .use(Breadcrumb)
  .use(Avatar)
  .use(Tabs)
  .use(Table)
  .use(Upload)
  .use(Layout);
// ant-design-vue --end

// app.use(store)
app.use(createPinia()).use(router).mount("#app");
