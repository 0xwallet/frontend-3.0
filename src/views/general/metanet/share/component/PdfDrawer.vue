<template>
  <BasicDrawer
    @register="register"
    v-bind="$attrs"
    :title="title"
    placement="bottom"
    :closable="true"
    :height="'100%'"
    destroyOnClose
    :bodyStyle="{
      padding: '0px',
    }"
  >
    <FramePage :frameSrc="`./resource/web/viewer.html?file=${src}`" />
    <!--    <Loading :loading="loading" :absolute="absolute" :tip="tip" />-->
    <!--    <div class="pdf-document" v-if="pages.length > 0">-->
    <!--      <PdfPage-->
    <!--        v-for="page_single in pages"-->
    <!--        v-bind="{ scale }"-->
    <!--        :key="page_single.pageNumber"-->
    <!--        :page="page_single"-->
    <!--      >-->
    <!--      </PdfPage>-->
    <!--    </div>-->
    <!--    `./resource/web/viewer.html?file=${url}`-->
  </BasicDrawer>
</template>
<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Space, Button } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  import PdfPage from './PdfPage.vue';
  import { Loading } from '/@/components/Loading';
  import FramePage from '/@/views/sys/iframe/index.vue';
  export default defineComponent({
    components: { BasicDrawer, Space, Button, PdfPage, Loading, FramePage },
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
<style scoped></style>
