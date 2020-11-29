<template>
  <Card hoverable>
    <template #title>
      <BasicTitle>{{ t('creditCardTitle') }}</BasicTitle>
    </template>
    <BasicForm @register="register" @submit="handleSubmit" layout="vertical" />
  </Card>
</template>

<script lang="ts">
  import { defineComponent, ref, unref, nextTick } from 'vue';
  import { BasicTitle } from '/@/components/Basic';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form/index';
  import { Card, Tag } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  const schemas: FormSchema[] = [
    {
      field: 'name',
      component: 'Input',
      label: 'Name',
      colProps: {
        span: 24,
      },
    },
    {
      field: 'number',
      component: 'Input',
      label: 'Credit Card Number',
      colProps: {
        span: 24,
      },
    },
    {
      field: 'month',
      component: 'Input',
      label: 'Month',
      colProps: {
        span: 7,
      },
    },
    {
      field: 'year',
      component: 'Input',
      label: 'Year',
      colProps: {
        span: 7,
        offset: 1,
      },
    },
    {
      field: 'cvc',
      component: 'Input',
      label: 'CVV/CVC',
      colProps: {
        span: 7,
        offset: 1,
      },
    },
  ];
  export default defineComponent({
    components: {
      BasicTitle,
      Tag,
      Card,
      CardMeta: Card.Meta,
      BasicForm,
    },
    setup() {
      const { t } = useI18n('general.account');
      const { createMessage } = useMessage();
      const [register, { setProps }] = useForm({
        schemas,
        showActionButtonGroup: false,
        compact: false,
      });
      function handleSubmit() {}
      return {
        t,
        register,
        handleSubmit,
      };
    },
  });
</script>
<style lang="less" scoped>
  .setRight {
    float: right;
  }

  .line {
    margin: 10px;
  }

  .strong {
    font-weight: bold;
  }
</style>
