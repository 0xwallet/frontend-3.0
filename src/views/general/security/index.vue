<template>
  <div class="bg">
    <Row :gutter="[10, 10]">
      <Col :span="12"><Authority /></Col>
      <Col :span="12"><Device /><Data /></Col>
    </Row>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Row, Col } from 'ant-design-vue';
  import Authority from './authority.vue';
  import Device from './device.vue';
  import Data from './data.vue';

  export default defineComponent({
    components: {
      Row,
      Col,
      Authority,
      Device,
      Data,
    },
    setup() {
      return {};
    },
  });
</script>
<style lang="less" scoped>
  .account {
    background: #fff;

    /deep/ .base-title {
      padding-left: 0;
    }

    /deep/ .ant-tabs {
      padding: 16px 0;
    }

    /deep/ .ant-tabs-tab-active {
      background-color: #e6f7ff;
    }
  }
  .bg {
    margin: 10px;
  }
</style>
