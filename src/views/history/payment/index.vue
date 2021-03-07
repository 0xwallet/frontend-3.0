<template>
  <div class="w-1/3 h-1/3 grid">
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
