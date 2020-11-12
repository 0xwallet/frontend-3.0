
import type { GlobalSetting } from '@/types/global'
import { reactive } from 'vue';

// 全局样式属性
let instance: object;

export function initInstance (input: object) {
  if (!instance) {
    instance = input;
  }
}

export function useGlobalProps () {
  return instance;
}

// 全局js属性
const globalSetting = reactive<GlobalSetting>({
  projectClassName: 'frontend',
  title: 'Front End'
});

function setGlobalSetting<T> (type: string, val: T | any): T | any {
  if (globalSetting[type] !== void (0)) {
    return (globalSetting[type] = val);
  }
  return null;
}

export function useGlobalSetting (): [GlobalSetting, Function] {
  return [globalSetting, setGlobalSetting];
}