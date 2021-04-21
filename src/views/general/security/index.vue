<template>
  <div class="m-2">
    <Row :gutter="[10, 10]">
      <Col :span="12"><Authority /></Col>
      <Col :span="12"><Device :list="deviceList" /><Recovery /></Col>
    </Row>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { Row, Col } from 'ant-design-vue';
  import Authority from './authority.vue';
  import Device from './device.vue';
  import Recovery from './recovery.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { me } from '/@/hooks/apollo/gqlUser';

  export default defineComponent({
    components: {
      Row,
      Col,
      Authority,
      Device,
      Recovery,
    },
    setup() {
      const deviceList = ref([]);
      const { onResult: getMe, refetch } = useQuery(me, null, { fetchPolicy: 'network-only' });
      getMe((res) => {
        deviceList.value = [];
        res.data?.me.wallets.forEach((v) => {
          if (v.tags[0] !== '' && v.info.publicKey !== null) {
            deviceList.value.push(v);
            //   value.value.nMobile = deviceList.value[0].list.length;
            //   deviceList.value[0].list.push({
            //     value: v.info.publicKey,
            //     title: v.info.publicKey,
            //     status: true,
            //   });
          }
        });
      });
      return { deviceList };
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
</style>
