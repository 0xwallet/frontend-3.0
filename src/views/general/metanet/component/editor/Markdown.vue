<template>
  <BasicModal v-bind="$attrs" @register="register" :title="t('markdownTitle')">
    <a-button @click="toggleTheme" class="mb-2" type="primary">黑暗主题</a-button>
    <MarkDown v-model:value="valueRef" ref="markDownRef" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref, unref } from 'vue';
  import { MarkDown, MarkDownActionType } from '/@/components/Markdown';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { File } from '/@/views/general/metanet/type/file';

  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { MarkDown, BasicModal },
    setup() {
      const markDownRef = ref<Nullable<MarkDownActionType>>(null);
      const valueRef = ref('');
      const [register, { setModalProps }] = useModalInner((data) => {
        const f: File = data.record;
        setModalProps({ loading: true });
        f.preview().then((res) => {
          const markDown = unref(markDownRef);
          if (!markDown) return;
          const vditor = markDown.getVditor();
          vditor.setValue(res);
          setModalProps({ loading: false });
        });
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
      };
    },
  });
</script>
