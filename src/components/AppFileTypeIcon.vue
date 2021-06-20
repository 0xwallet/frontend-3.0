<template>
  <span :class="`fiv-cla fiv-icon-${calcType}`"></span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    type: String,
  },
  setup(props) {
    const calcType = props.type ?? "blank";
    return { calcType };
  },
});
</script>
