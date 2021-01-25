<template>
  <BasicDrawer
    @register="register"
    v-bind="$attrs"
    :title="title"
    placement="bottom"
    :closable="true"
    :height="'100%'"
    destroyOnClose
  >
    <Loading :loading="loading" :absolute="absolute" :tip="tip" />
    <div class="pdf-document" v-if="pages.length > 0">
      <PdfPage
        v-for="page_single in pages"
        v-bind="{ scale }"
        :key="page_single.pageNumber"
        :page="page_single"
      >
      </PdfPage>
    </div>
  </BasicDrawer>
</template>
<script lang="ts">
  import { computed, defineComponent, reactive, ref, toRefs, watch } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { Space, Button } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile/netFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  import PdfPage from './MobilePdfPage.vue';
  import { useScript } from '/@/hooks/web/useScript';
  import { usePdf } from '/@/hooks/nkn/getNKN';
  import { Loading } from '/@/components/Loading';
  import { getFileRaw } from '/@/api/NetFile/file';

  export default defineComponent({
    components: { BasicDrawer, Space, Button, PdfPage, Loading },
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

      const compState = reactive({
        absolute: true,
        loading: true,
        tip: '加载中...',
      });
      const [register, { closeDrawer }] = useDrawerInner(() => {
        usePdf().then((res) => {
          res.GlobalWorkerOptions.workerSrc = `./resource/pdf/pdf.worker.js`;
        });
        initPDF();
      });

      useScript({
        src: `./resource/pdf/pdf.js`,
      }).toPromise();

      const scale = computed(() => {
        return props.scale;
      });
      let pdfDoc = ref(null);
      let pages = ref([]);
      async function initPDF() {
        // Asynchronous download of PDF
        const url = await file.value.preview();
        compState.loading = true;
        getBinaryData(url);
      }
      function onSubmit() {
        pdfDoc.value = null;
        initPDF();
      }

      function assign_list(source_list) {
        pages.value = source_list;
      }
      function getBinaryData(url) {
        // body...

        getFileRaw(url).then((data) => {
          console.log(data);
          usePdf().then((pdfjs) => {
            var loadingTask = pdfjs.getDocument(data);
            loadingTask.promise.then((pdfDoc_) => {
              pdfDoc.value = pdfDoc_;
              compState.loading = false;
            });
          });
        });
        // var xhr = new XMLHttpRequest();
        // // xhr.setRequestHeader("Origin", window.location.hostname);
        // xhr.open('GET', url, true);
        // xhr.responseType = 'arraybuffer';
        // xhr.onload = function (e) {
        //   //binary form of ajax response,
        //
        //
        // };
        // xhr.onerror = function () {
        //   // body...
        //   alert('xhr error');
        // };
        // xhr.send();
      }
      watch(pdfDoc, (new_value) => {
        if (new_value === null) return;
        var array_pages = [];
        for (var i = 0; i < new_value.numPages; i++) {
          array_pages.push(i + 1);
        }
        const promises = array_pages.map((number) => new_value.getPage(number));
        Promise.all(promises)
          .then(function (doc) {
            assign_list(doc);
          })
          .catch(function (err) {
            console.log(err);
          });
      });

      return {
        register,
        t,
        file,
        pdfDoc,
        pages,
        initPDF,
        assign_list,
        onSubmit,
        scale,
        title,
        ...toRefs(compState),
      };
    },
  });
</script>
<style></style>
