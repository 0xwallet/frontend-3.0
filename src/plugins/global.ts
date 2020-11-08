// import type { App } from 'vue';
import router from '@/router';
import { initProgress } from './init/process';
import { reactive, watch } from 'vue';
import {initInstance} from '@/hooks/state/global';

function setGlobalProperty (type: string, val: string): string {
  document.body.style.setProperty(type, val);
  return val;
}

const isPro = process.env.NODE_ENV === 'production';

// 代理访问和设置
const options = reactive({
  // 主题色
  '--theme-color': 'red',
  // h1 h2 h3 h4 h5
  '--h-1': '2rem',
  '--h-2': '1.7rem',
  '--h-3': '1.4rem',
  '--h-4': '1.1rem',
  '--h-5': '0.9rem',
  '--text-color': '#333'
});
const keys = Reflect.ownKeys(options);
watch(options, (newVal, oldVal) => {
  keys.forEach((key: any) => {
     if (newVal[key] !== oldVal[key]) {
       setGlobalProperty(key, newVal[key]);
     }
  });
});

// 开启顶部加载滚动条
const openNProgress = isPro;
openNProgress && initProgress(router);

function install () {
  Reflect.ownKeys(options).forEach((key: any) => {
    setGlobalProperty(key, options[key]);
 });
 initInstance(options);
}

export default { install };