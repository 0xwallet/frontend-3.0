<template>
  <div>
    <div class="pdf-document" v-if="pages.length > 0">
      <PdfPage
        v-for="page_single in pages"
        v-bind="{ scale }"
        :key="page_single.pageNumber"
        :page="page_single"
      >
      </PdfPage>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, watch, onMounted } from 'vue';
  import { useScript } from '/@/hooks/web/useScript';
  import PdfPage from './MobilePdfPage.vue';
  import { getFileRaw } from '/@/api/NetFile/file';
  import { usePdf } from '/@/hooks/nkn/getNKN';

  export default defineComponent({
    name: 'Pdf',
    components: { PdfPage },
    setup() {
      useScript({
        src: `./resource/pdf/pdf.js`,
      }).toPromise();
      onMounted(() => {
        usePdf().then((res) => {
          res.GlobalWorkerOptions.workerSrc = `./resource/pdf/pdf.worker.js`;
        });
      });
      const scale = ref(1.0);
      let pdfDoc = ref(null);
      let pages = ref([]);
      function initPDF() {
        // Asynchronous download of PDF

        getBinaryData(`http://localhost:4000/resource/pdf/test.pdf`);
      }
      function onSubmit() {
        pdfDoc.value = null;
        initPDF();
      }
      initPDF();
      function assign_list(source_list) {
        pages.value = source_list;
      }
      function getBinaryData(url) {
        // body...

        // getFileRaw(url).then((data) => {
        //   console.log(data);
        // });
        var xhr = new XMLHttpRequest();
        // xhr.setRequestHeader("Origin", window.location.hostname);
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
          //binary form of ajax response,
          console.log(e.currentTarget.response);
          usePdf().then((pdfjs) => {
            var loadingTask = pdfjs.getDocument(e.currentTarget.response);
            loadingTask.promise.then((pdfDoc_) => {
              pdfDoc.value = pdfDoc_;
            });
          });
        };
        xhr.onerror = function () {
          // body...
          alert('xhr error');
        };
        xhr.send();
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
        pdfDoc,
        pages,
        initPDF,
        assign_list,
        onSubmit,
        scale,
      };
    },
  });
</script>
<style scoped lang="scss">
  @import './pdf_viewer.css';
</style>
