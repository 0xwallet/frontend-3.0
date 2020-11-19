<template>
  <Breadcrumb>
    <BreadcrumbItem v-for="(path, index) in paths" :key="index">{{ path }}</BreadcrumbItem>
  </Breadcrumb>
</template>

<script>
  import { defineComponent, computed } from 'vue';
  import { Breadcrumb } from 'ant-design-vue';

  export default defineComponent({
    name: 'BreadCrumb',
    props: {
      path: Array,
    },
    components: { Breadcrumb, BreadcrumbItem: Breadcrumb.Item },
    setup(props) {
      const paths = computed(() => {
        return ['全部'].concat(props.path);
      });
      return {
        paths,
      };
    },
  });
</script>

<style scoped></style>
