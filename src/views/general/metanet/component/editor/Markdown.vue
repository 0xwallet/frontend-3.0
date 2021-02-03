<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('markdownTitle')"
    :minHeight="height"
    width="80%"
    destroyOnClose
  >
    <div ref="wrapRef"></div>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { getFile } from '/@/api/general/metanet/file';
  const { t } = useI18n('general.metanet');
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';
  import { useLocale } from '/@/locales/useLocale';
  type Lang = 'zh_CN' | 'en_US' | 'ja_JP' | 'ko_KR' | undefined;
  export default defineComponent({
    components: { BasicModal },
    setup() {
      const valueRef = ref('');
      const wrapRef = ref<ElRef>(null);
      const vditorRef = ref<Nullable<Vditor>>(null);
      const initedRef = ref(false);
      const height = computed(() => {
        return document.body.clientHeight - 300;
      });
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
      const [register, { setModalProps }] = useModalInner(async (data) => {
        const f: NetFile = data;
        setModalProps({ loading: true });
        // try {
        //   valueRef.value = '';
        //   const url = ;
        //   const d = await getFile(await f.preview());
        //   const markDown = unref(markDownRef);
        //   if (!markDown) return;
        //   const vditor = markDown.getVditor();
        //   vditor.setValue(d);
        //   // valueRef.value = d;
        // } catch (e) {
        //   console.log(e);
        // } finally {
        //   setModalProps({ loading: false });
        // }
        const value = await getFile(await f.preview());

        init(value);
      });
      function init(value) {
        const wrapEl = unref(wrapRef);

        if (!wrapEl) return;
        vditorRef.value = new Vditor(wrapEl, {
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
        });
        initedRef.value = true;
        setModalProps({ loading: false });
      }

      return {
        valueRef,
        register,
        t,
        height,
        wrapRef,
      };
    },
  });
</script>
