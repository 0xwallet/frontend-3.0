<template>
  <ConfigProvider :locale="locale">
    <router-view />
  </ConfigProvider>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { ConfigProvider } from 'ant-design-vue';
import { useI18n } from '@/hooks/vue';

export default defineComponent({
  name: 'App',
  components: {
    ConfigProvider
  },
  setup() {
    const [localeRef] = useI18n();

    return {
      locale: computed(() => ({
         en: () => require('ant-design-vue/es/locale/en_US'),
         'zh-CN': () => require('ant-design-vue/es/locale/zh_CN')
        }[localeRef.value])()
      )
    }
  }
});
</script>
<style lang="less">
html,
body,
#app {
  height: 100%;
  width: 100%;
}
</style>
