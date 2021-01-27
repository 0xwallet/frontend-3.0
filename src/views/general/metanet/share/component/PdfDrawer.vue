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
    <FramePage :frameSrc="`./resource/web/viewer.html?file=${src}`" />
  </BasicDrawer>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Space, Button } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  import FramePage from '/@/views/sys/iframe/index.vue';

  export default defineComponent({
    components: { BasicDrawer, Space, Button, FramePage },
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

      const [register, { closeDrawer }] = useDrawerInner(() => {
        getSrc();
      });
      async function getSrc(): string {
        src.value = encodeURIComponent(await file.value.preview());
      }

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
