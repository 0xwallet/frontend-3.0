<template>
  <div>
    <div ref="wrapRef"></div>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, nextTick, ref, unref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';
  import { useLocale } from '/@/locales/useLocale';
  import { propTypes } from '/@/utils/propTypes';
  import { NetFile } from '/@/components/NetFile';

  type Lang = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' | undefined;
  export default defineComponent({
    props: {
      file: propTypes.object,
    },
    setup(props) {
      const valueRef = ref('');
      const wrapRef = ref<ElRef>(null);
      const id = ref('');
      const vditorRef = ref<Nullable<Vditor>>(null);
      const initedRef = ref(false);
      const height = computed(() => {
        return document.body.clientHeight - 300;
      });
      watch(
        () => props.file,
        () => {
          id.value = props.file.id;
          nextTick(() => {
            init(props.file);
          });
        },
        { immediate: true }
      );

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

      const edited = ref(false);

      async function init(file: NetFile) {
        const value = await file.raw();
        console.log(value);

        console.log(id.value);
        const wrapEl = unref(wrapRef);
        if (!wrapEl) return;
        vditorRef.value = new Vditor(id.value, {
          lang: unref(getCurrentLang),
          value,
          mode: 'ir',
          preview: {
            actions: [],
          },
          cache: {
            enable: false,
          },
          height: height.value,
          input: () => {
            edited.value = true;
          },
        });
        // initedRef.value = true;
      }

      return {
        valueRef,
        t,
        height,
        wrapRef,
        id,
      };
    },
  });
</script>
