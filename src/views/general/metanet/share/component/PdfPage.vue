<template>
  <div>
    <canvas ref="myCanvas" v-bind="canvasAttrs">
      <div ref="textLayer" v-bind="canvasAttrs" />
    </canvas>
  </div>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
  import { usePdf } from '/@/hooks/nkn/getNKN';
  export default defineComponent({
    props: ['page', 'scale'],
    inheritAttrs: false,
    setup(props) {
      const myCanvas = ref(null);
      const textLayer = ref(null);
      const viewport = props.page.getViewport({ scale: props.scale });
      let actualSizeViewport = computed(() => viewport.clone({ scale: props.scale }));
      let canvasStyle = computed(() => {
        const { width: actualSizeWidth, height: actualSizeHeight } = actualSizeViewport.value;
        const pixelRatio = window.devicePixelRatio || 1;
        console.log(window.devicePixelRatio);
        const [pixelWidth, pixelHeight] = [actualSizeWidth, actualSizeHeight].map((dim) =>
          Math.ceil(dim / pixelRatio)
        );
        return `width: ${pixelWidth}px; height: ${pixelHeight}px;`;
      });
      let canvasAttrs = computed(() => {
        let { width, height } = actualSizeViewport.value;
        [width, height] = [width, height].map((dim) => Math.ceil(dim));
        const style = canvasStyle;
        return {
          width,
          height,
          style,
          class: 'pdf-page box-shadow',
        };
      });
      let page = computed(() => props.page.pageNumber);
      watch(page, (count, prevCount) => {
        destroyPage(prevCount);
      });
      async function renderPage() {
        const ctx = myCanvas.value.getContext('2d', { alpha: false });
        const renderTask = props.page.render(getRenderContext());
        props.page.getTextContent({ normalizeWhitespace: true }).then((textContent) => {
          textLayer.value.setAttribute('class', 'textLayer');
          usePdf().then((pdfjs) => {
            return pdfjs.renderTextLayer({
              textContent: textContent,
              container: textLayer.value,
              viewport: viewport,
              textDivs: [],
            });
          });
          // textLayerInside.setTextContent(textContent)
          // textContent.items.forEach(function (textItem) {
          //   var tx = global.pdfjsLib.Util.transform(
          //     global.pdfjsLib.Util.transform(viewport.transform, textItem.transform),
          //     [1, 0, 0, -1, 0, 0]
          //   );
          //   var style = textContent.styles[textItem.fontName];

          //   // adjust for font ascent/descent
          //   var fontSize = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
          //   if (style.ascent) {
          //     tx[5] -= fontSize * style.ascent;
          //   } else if (style.descent) {
          //     tx[5] -= fontSize * (1 + style.descent);
          //   } else {
          //     tx[5] -= fontSize / 2;
          //   }
          //   // adjust for rendered width
          //   if (textItem.width > 0) {
          //     ctx.font = tx[0] + 'px ' + style.fontFamily;

          //     var width = ctx.measureText(textItem.str).width;
          //     if (width > 0) {
          //       //tx[0] *= (textItem.width * viewport.scale) / width;
          //       tx[0] = (textItem.width * viewport.scale) / width;
          //     }
          //   }
          //   // var item = document.createElementNS('http://www.w3.org/2000/svg', 'svg:text');
          //   // item.textContent = textItem.str;
          //   // item.setAttribute('font-family', style.fontFamily);
          //   // item.setAttribute('transform', 'matrix(' + tx.join(' ') + ')');
          //   var item = document.createElement('span');
          //   item.textContent = textItem.str;
          //   item.style.fontFamily = style.fontFamily;
          //   //item.style.transform = 'matrix(' + tx.join(',') + ')';
          //   item.style.fontSize = fontSize + 'px';
          //   item.style.transform = 'scaleX(' + tx[0] + ')';
          //   item.style.left = tx[4] + 'px';
          //   item.style.top = tx[5] + 'px';
          //   textLayer.value.appendChild(item);
          // });
          // var textLayer = TextLayerBuilder(textLayer.value.get(0), props.page.pageNumber-1); //The second zero is an index identifying
          //the page. It is set to page.number - 1.
          // textLayer.setTextContent(textContent);
        });
        // const returnedTarget = Object.assign(getRenderContext(), {textLayer: textLayer.value});
        // console.log(returnedTarget)
        // props.page.render(viewport);
      }
      function getRenderContext() {
        const canvasContext = myCanvas.value.getContext('2d');
        return { canvasContext, viewport };
      }
      function destroyPage(page) {
        if (!page) return;
        // PDFPageProxy#_destroy
        // https://mozilla.github.io/pdf.js/api/draft/PDFPageProxy.html
        page._destroy();
        // RenderTask#cancel
        // https://mozilla.github.io/pdf.js/api/draft/RenderTask.html
        // if (renderTask) renderTask.cancel();
      }
      onMounted(() => {
        renderPage();
      });
      onBeforeUnmount(() => {
        destroyPage(props.page);
      });
      return {
        viewport,
        actualSizeViewport,
        canvasStyle,
        canvasAttrs,
        renderPage,
        getRenderContext,
        destroyPage,
        myCanvas,
        textLayer,
      };
    },
  });
</script>
<style>
  .pdf-page {
    display: block;
    margin: 0 auto 0.5em;
  }
</style>
