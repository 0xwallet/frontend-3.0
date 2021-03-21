<template>
  <BasicDrawer
    @register="register"
    v-bind="$attrs"
    :title="title"
    placement="bottom"
    :closable="true"
    :height="'100%'"
    destroyOnClose
    wrapClassName="scroll"
  >
    <div ref="wrapRef"></div>
  </BasicDrawer>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import 'vditor/dist/index.css';
  import Vditor from 'vditor';
  type Lang = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' | undefined;
  import { useLocale } from '/@/locales/useLocale';
  import { getFile } from '/@/api/general/metanet/file';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { BasicDrawer },
    props: {
      file: {
        type: Object,
        default: null,
      },
    },
    setup(props) {
      const file: NetFile = computed(() => {
        return props.file;
      });
      const title = computed(() => {
        return file.value.fullName?.slice(-1)[0] || 'PDF';
      });
      const [register] = useDrawerInner(async () => {
        const url = await file.value.preview();
        const d = await getFile(url);
        init(d);
      });
      const wrapRef = ref<ElRef>(null);
      const vditorRef = ref<Nullable<Vditor>>(null);
      const { getLang } = useLocale();
      const getCurrentLang = computed((): 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' => {
        let lang: Lang;
        switch (unref(getLang)) {
          case 'en':
            lang = 'en_US';
            break;
          case 'ja':
            lang = 'ja_JP';
            break;
          case 'ko':
            lang = 'ko_KR';
            break;
          default:
            lang = 'zh_CN';
        }
        return lang;
      });
      const initedRef = ref(false);
      function init(value: string) {
        const wrapEl = unref(wrapRef);
        if (!wrapEl) return;
        vditorRef.value = new Vditor(wrapEl, {
          lang: unref(getCurrentLang),
          mode: 'ir',
          preview: {
            actions: [],
          },
          toolbarConfig: {
            pin: true,
          },
          counter: {
            enable: true,
          },
          toolbar: [
            'emoji',
            'link',
            'upload',
            'edit-mode',
            {
              name: 'more',
              toolbar: ['insert-after', 'fullscreen', 'preview', 'info', 'help'],
            },
          ],
          height: window.innerHeight * 0.9,
          value,
          cache: {
            enable: false,
          },
        });
        initedRef.value = true;
      }

      return {
        register,
        t,
        file,
        title,
        wrapRef,
      };
    },
  });
</script>
<style lang="less"></style>
