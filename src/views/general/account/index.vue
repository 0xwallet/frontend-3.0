<template>
  <div class="bg">
    <Row :gutter="[10, 10]">
      <Col :span="12"><Profile /></Col>
      <Col :span="12"><CreditCard /><Apps /></Col>
    </Row>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Profile from './profile.vue';
  import CreditCard from './creditCard.vue';
  import Apps from './apps.vue';
  import { Row, Col } from 'ant-design-vue';
  export default defineComponent({
    components: {
      Profile,
      CreditCard,
      Apps,
      Row,
      Col,
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
