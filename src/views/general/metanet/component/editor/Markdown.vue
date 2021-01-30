<template>
  <BasicModal
    v-bind="$attrs"
    @register="register"
    :title="t('markdownTitle')"
    :minHeight="height"
    width="80%"
    destroyOnClose
  >
    <a-button @click="toggleTheme" class="mb-2" type="primary">黑暗主题</a-button>
    <MarkDown v-model:value="valueRef" ref="markDownRef" :height="height * 0.9" />
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { MarkDown, MarkDownActionType } from '/@/components/Markdown';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { getFile } from '/@/api/general/metanet/file';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { MarkDown, BasicModal },
    setup() {
      const markDownRef = ref<Nullable<MarkDownActionType>>(null);
      const valueRef = ref('');
      const height = computed(() => {
        return document.body.clientHeight - 300;
      });
      const [register, { setModalProps }] = useModalInner(async (data) => {
        const f: NetFile = data;
        setModalProps({ loading: true });
        try {
          valueRef.value = '';
          const url = await f.preview();
          const d = await getFile(url);
          const markDown = unref(markDownRef);
          if (!markDown) return;
          const vditor = markDown.getVditor();
          vditor.setValue(d);
          // valueRef.value = d;
        } catch {
        } finally {
          setModalProps({ loading: false });
        }
      });

      function toggleTheme() {
        const markDown = unref(markDownRef);
        if (!markDown) return;
        const vditor = markDown.getVditor();
        vditor.setTheme('dark');
      }
      return {
        valueRef,
        toggleTheme,
        markDownRef,
        register,
        t,
        height,
      };
    },
  });
</script>
