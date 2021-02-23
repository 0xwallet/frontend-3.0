<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('markdownTitle')"
    :minHeight="height"
    width="80%"
    destroyOnClose
    :closeFunc="handleCloseFunc"
  >
    <div ref="wrapRef"></div>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, createVNode, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  const { t } = useI18n('general.metanet');
  import Vditor from 'vditor';
  import 'vditor/dist/index.css';
  import { useLocale } from '/@/locales/useLocale';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
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

      const [register, { setModalProps, closeModal }] = useModalInner(async (data) => {
        const f: NetFile = data;
        setModalProps({
          loading: true,
          okText: t('saveButton'),
          title: f.fileName(),
        });

        const value = await f.raw();
        valueRef.value = value;
        init(value);
      });
      const edited = ref(false);
      async function handleCloseFunc() {
        if (!edited.value) return true;
        Modal.confirm({
          title: t('error'),
          icon: createVNode(ExclamationCircleOutlined),
          content: '文件内容有变化，不保存吗?',
          centered: true,
          okText: t('yes'),
          cancelText: t('cancelAll'),
          onOk() {
            closeModal();
          },
        });
        return false;
      }

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
          input: () => {
            edited.value = true;
          },
        });
        initedRef.value = true;
        setModalProps({ loading: false });
      }

      return {
        handleCloseFunc,
        valueRef,
        register,
        t,
        height,
        wrapRef,
      };
    },
  });
</script>
