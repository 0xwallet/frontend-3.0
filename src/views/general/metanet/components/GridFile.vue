<template>
  <div id="gridFile"></div>
</template>

<script lang="ts">
import { Grid } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import { defineComponent, PropType, onMounted } from "vue";
import { TColumn } from "gridjs/dist/src/types";
export default defineComponent({
  props: {
    columns: {
      type: Array as PropType<TColumn[]>,
    },
  },
  setup(props) {
    const gridApp = new Grid({
      // columns: ["Name", "Email", "Phone Number"],
      columns: props.columns,
      data: () => {
        return new Promise((resolve) => {
          setTimeout(
            () =>
              resolve([
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
                [
                  "John",
                  "john@example.com",
                  "(353) 01 222 3333",
                  "24234234234",
                  "00000",
                ],
              ]),
            1000
          );
        });
      },
      resizable: true,
      style: {
        th: {
          "background-color": "#fafafa",
        },
        td: {
          // border: "none",
          "border-color": "#f0f0f0",
          // border: "1px solid #f0f0f0",
        },
        container: {
          "border-radius": "0px",
        },
      },
    });
    onMounted(() => {
      const el = document.getElementById("gridFile");
      if (!el) return;
      gridApp.render(el);
    });
    return {};
  },
});
</script>

<style scoped>
::v-deep .gridjs-wrapper {
  border-radius: 0px;
  box-shadow: none;
  border: 1px solid #f0f0f0;
}
</style>