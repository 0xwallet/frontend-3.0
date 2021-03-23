<template>
  <Tooltip :title="`[${mode}]`" v-if="hash !== ''">
    <span @click="copy"
      >{{ hash.slice(0, 2)
      }}<span v-for="v in list" :style="'background-color:#' + v">&nbsp;&nbsp;&nbsp;</span
      >{{ hash.slice(hash.length - 2, hash.length) }}</span
    >
    <CopyOutlined class="ml-4" @click="copy" />
  </Tooltip>
</template>

<script lang="ts">
  import { computed, defineComponent, unref } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { CopyOutlined } from '@ant-design/icons-vue';

  const { clipboardRef, copiedRef } = useCopyToClipboard();
  const { createMessage } = useMessage();
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { Tooltip, CopyOutlined },
    props: {
      hash: propTypes.string,
      mode: propTypes.string.def('sha256'),
    },
    setup(props) {
      const hash = computed(() => {
        return props.hash;
      });
      const mode = computed(() => {
        switch (props.mode) {
          case 'sha256':
            return 'SHA256';
          case 'txid':
            return 'TxID';
          default:
            return 'mode';
        }
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
        if (props.mode === 'txid') {
          clipboardRef.value = `${window.location.origin}/#/p?txid=${props.hash}`;
        } else {
          clipboardRef.value = hash.value;
        }
        if (unref(copiedRef)) {
          createMessage.warning(t('copySuccess'));
        }
      }
      return {
        t,
        copy,
        hash,
        list,
        mode,
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>
