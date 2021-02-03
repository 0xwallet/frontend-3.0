<template>
  <GIcon :icon="type" :size="size" />
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import GIcon from '/@/components/Icon/index';
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
        switch (props.type) {
          case 'folder':
            return 'bx-bx-folder';
          default:
            return 'bx-bxs-file-' + props.type;
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
