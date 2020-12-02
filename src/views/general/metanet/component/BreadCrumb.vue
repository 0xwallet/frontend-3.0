<template>
  <Breadcrumb>
    <BreadcrumbItem v-for="(path, index) in paths" :key="index">
      <a-button @click="go(path)" type="link">{{ path.name }}</a-button>
    </BreadcrumbItem>
  </Breadcrumb>
</template>

<script>
  import { defineComponent, computed, ref, watch } from 'vue';
  import { Breadcrumb } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'BreadCrumb',
    props: {
      path: Array,
    },
    components: { Breadcrumb, BreadcrumbItem: Breadcrumb.Item },
    setup(props, { emit }) {
      const paths = computed(() => {
        return [{ name: t('root'), dirId: 'root' }].concat(props.path);
      });
      function go(path) {
        emit('jump', path);
      }
      return {
        paths,
        go,
      };
    },
  });
</script>

<style scoped></style>
