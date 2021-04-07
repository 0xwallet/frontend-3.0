<template> </template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Row, Col } from 'ant-design-vue';

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
  .workbench {
    &__wokb-img {
      width: 100%;
      height: 240px;
    }
  }
</style>
