<template> </template>
<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    components: {
      [Row.name]: Row,
      [Col.name]: Col,
    },
    setup() {
      return {};
    },
  });
</script>
<style lang="less" scoped>
  .analysis {
    width: 100%;
  }
</style>
