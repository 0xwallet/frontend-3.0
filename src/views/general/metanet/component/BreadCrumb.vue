<template>
  <Breadcrumb>
    <BreadcrumbItem v-for="(path, index) in paths" :key="index">
      <a-button @click="go(index)" type="link">{{ path }}</a-button>
    </BreadcrumbItem>
  </Breadcrumb>
</template>

<script>
  import { defineComponent, computed, ref, watch } from 'vue';
  import { Breadcrumb } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { propTypes } from '/@/utils/propTypes';
  const { t } = useI18n('general.metanet');
  export default defineComponent({
    name: 'BreadCrumb',
    props: {
      path: propTypes.array,
    },
    components: { Breadcrumb, BreadcrumbItem: Breadcrumb.Item },
    setup(props, { emit }) {
      const paths = computed(() => {
        // console.log(props.path);
        return ['~'].concat(props.path);
      });
      function go(i) {
        emit('jump', paths.value.slice(1, i + 1));
      }
      return {
        paths,
        go,
      };
    },
  });
</script>

<style scoped></style>
