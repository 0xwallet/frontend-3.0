<template>
  <GIcon :icon="type" :size="size" />
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import GIcon from '/@/components/Icon';
  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    components: { GIcon },
    props: {
      type: propTypes.string,
      size: propTypes.number.def(30),
    },
    setup(props) {
      const type = computed(() => {
        if (props.type === 'folder') {
          return 'bx-bx-folder';
        }
        if (
          ['txt', 'pdf', 'md', 'jpg', 'png', 'gif', 'html', 'css', 'doc', 'js', 'json'].includes(
            props.type
          )
        ) {
          return `bx-bxs-file-${props.type}`;
        }
        switch (props.type) {
          case 'zip':
            return `bx-bxs-file-archive`;
          default:
            return 'bx-bx-file-blank';
        }
      });
      const size = computed(() => {
        return props.size;
      });

      return {
        t,
        type,
        size,
      };
    },
  });
</script>
<style lang="less" scoped>
  .tabs {
    margin: 5px;
  }
</style>
