<template>
  <Tooltip :title="t('common.markdown')" placement="bottom" :mouseEnterDelay="0.5">
    <Icon
      :icon="`fa-brands:markdown`"
      :class="`${prefixCls}__extra-markdown ${visible ? 'bg-gray-400' : ''} justify-center`"
      :color="`${visible ? 'white' : 'gray'}`"
      @click="openMarkdown"
    />
    <!--      <img-->
    <!--      :src="markdown"-->
    <!--      :class="`${prefixCls}__extra-markdown`"-->
    <!--      @click="openMarkdown"-->
    <!--    />-->
    <!--    <span :class="`${prefixCls}__extra-markdown`" @click="openMarkdown"> Markdown </span>-->
    <MarkdownEditModal @register="registerMarkdownModal" />
  </Tooltip>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { RedoOutlined } from '@ant-design/icons-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Tooltip } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { MarkdownEditModal } from '/@/components/NetFile';
  import { fileStore } from '/@/store/modules/netFile';

  import markdown from '/@/assets/svg/markdown.svg';
  import { Icon } from '/@/components/Icon';
  export default defineComponent({
    name: 'TabMarkdown',
    components: { RedoOutlined, Tooltip, MarkdownEditModal, Icon },

    setup() {
      const loading = ref(false);
      const { prefixCls } = useDesign('multiple-tabs-content');
      const { t } = useI18n();
      const [registerMarkdownModal] = useModal();
      const visible = computed(() => fileStore.getEditorVisible);
      function openMarkdown() {
        fileStore.setEditorVisible();
      }
      return { prefixCls, t, loading, registerMarkdownModal, openMarkdown, markdown, visible };
    },
  });
</script>
