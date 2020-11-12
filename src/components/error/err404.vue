<template>
  <div class="err-404">
    <div class="err-404-main">
      404
    </div>
    <div class="err-404-sub">
      {{ `路径${errorInfo}不存在` }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Err404',
  props: {
    error: {
      type: String,
      default: ''
    }
  },
  setup (props: { [error: string]: string }) {
    return {
      errorInfo: props.error 
    };
  }
});
</script>

<style lang="less">
.err-404 {
  font-size: var(--h-1);
  color: brown;
  margin: 0 auto;
  text-align: center;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
.err-404-sub {
  font-size: var(--h-2);
  color: #112345;
}
</style>