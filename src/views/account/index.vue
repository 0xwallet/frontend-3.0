<template> <a-button>111</a-button> </template>

<script lang="ts">
  import { defineComponent, nextTick } from 'vue';
  import { getNKN } from '/@/hooks/nkn/getNKN';

  export default defineComponent({
    setup() {
      // getNKN().then((nkn) => {
      //   console.log(nkn);
      // });
      // const wa = new nkn.Wallet({ password: '123' });
      // console.log(wa);
      return {};
    },
  });
</script>
<style lang="less" scoped></style>
