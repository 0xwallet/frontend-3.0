<template>
  <Tooltip :title="t('common.redo')" placement="bottom" :mouseEnterDelay="0.5">
    <span :class="`${prefixCls}__extra-redo`" @click="openMarkdown"> MD </span>
    <MarkdownEditModal @register="registerMarkdownModal" />
  </Tooltip>
</template>
<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { RedoOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Tooltip } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { MarkdownEditModal } from '/@/components/NetFile';
  import { fileStore } from '/@/store/modules/netFile';

  export default defineComponent({
    name: 'TabMarkdown',
    components: { RedoOutlined, Tooltip, MarkdownEditModal },

    setup() {
      const loading = ref(false);
      const { prefixCls } = useDesign('multiple-tabs-content');
      const { t } = useI18n();
      const [registerMarkdownModal, { openModal }] = useModal();
      watch(
        () => fileStore.getMarkdownVisible,
        (v) => {
          if (v) {
            openModal(true, {});
            fileStore.setMarkdownVisible(false);
          }
        },
        { deep: true }
      );
      function openMarkdown() {
        openModal(true);
      }
      return { prefixCls, t, loading, registerMarkdownModal, openMarkdown };
    },
  });
</script>
