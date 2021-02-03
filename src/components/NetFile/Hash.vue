<template> </template>

<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { t } = useI18n('general.metanet');
  const { clipboardRef, copiedRef } = useCopyToClipboard();
  const { createMessage } = useMessage();
  export default defineComponent({
    components: { Tooltip },
    props: {
      type: propTypes.string,
    },
    setup(props) {
      const type = computed(() => {
        return props.type;
      });
      const list = computed(() => {
        if (props.hash === '') return '';
        let temp = [];
        for (let i = 1; i < 11; i++) {
          temp.push(props.hash.slice(2 + 6 * (i - 1), 2 + 6 * i));
        }
        return temp;
      });

      function copy() {
        clipboardRef.value = hash.value;
        if (unref(copiedRef)) {
          createMessage.warning(t('copySuccess'));
        }
      }
      return {
        t,
        copy,
        type,
        list,
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>
