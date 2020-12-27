<template>
  <Tooltip :title="t('copy')" v-if="hash !== ''">
    <span @click="copy"
      >{{ hash.slice(0, 2)
      }}<span v-for="v in list" :style="'background-color:#' + v">&nbsp;&nbsp;&nbsp;</span
      >{{ hash.slice(hash.length - 2, hash.length) }}</span
    >
  </Tooltip>
</template>

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
      hash: propTypes.string,
    },
    setup(props) {
      const hash = computed(() => {
        return props.hash;
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
        hash,
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
