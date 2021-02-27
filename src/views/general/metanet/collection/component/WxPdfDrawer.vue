<template>
  <BasicDrawer
    @register="register"
    v-bind="$attrs"
    :title="title"
    placement="bottom"
    :closable="true"
    :height="'100%'"
    destroyOnClose
    wrapClassName="scroll"
  >
  </BasicDrawer>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Space, Button } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';

  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');

  export default defineComponent({
    components: { BasicDrawer, Space, Button },
    props: {
      file: {
        type: Object,
        default: null,
      },
      scale: {
        type: Number,
        default: 1,
      },
    },
    setup(props) {
      const file: NetFile = computed(() => {
        return props.file;
      });
      const title = computed(() => {
        return file.value?.fullName.slice(-1)[0] || 'PDF';
      });
      const src = ref('');

      // const url = encodeURIComponent();

      const [register, { closeDrawer }] = useDrawerInner((data) => {
        const { uri } = data;
        init(uri);
      });
      async function init(uri: string): string {}

      return {
        register,
        t,
        file,
        title,
        src,
      };
    },
  });
</script>
<style lang="less">
  .scroll {
    .vben-basic-drawer {
      .ant-drawer-body {
        .scrollbar__wrap {
          padding: 0 !important;
        }
      }
    }
  }
</style>
