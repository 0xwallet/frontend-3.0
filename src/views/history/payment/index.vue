<template>
  <div>
    <FileTree />
  </div>
</template>

<script lang="ts">
  import { FileTree } from '/@/components/NetFile';

  import { defineComponent } from 'vue';
  export default defineComponent({
    components: { FileTree },
    setup() {},
  });
</script>

<style scoped></style>
