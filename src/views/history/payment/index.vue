<template> <CountDown :onClick="hah" :placeholder="123" /></template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { CountDown } from '/@/components/CountDown';
  export default defineComponent({
    components: { CountDown },
    setup() {
      function hah() {
        console.log(11123);
      }
      return { hah };
    },
  });
</script>

<style scoped></style>
