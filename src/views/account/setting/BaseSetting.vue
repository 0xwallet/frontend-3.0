<template>
  <CollapseContainer title="基本设置" :canExpan="false">
    <BasicForm @register="register" />
    <Button type="primary" @click="handleSubmit">更新基本信息</Button>
  </CollapseContainer>
</template>
<script lang="ts">
  import { Button } from 'ant-design-vue';
  import { defineComponent, onMounted } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { CollapseContainer } from '/@/components/Container/index';

  import { useMessage } from '/@/hooks/web/useMessage';

  import { baseSetschemas } from './data';
  import { getMe } from '/@/hooks/apollo/apollo';

  export default defineComponent({
    components: { BasicForm, CollapseContainer, Button },
    setup() {
      const { createMessage } = useMessage();

      const [register, { setFieldsValue }] = useForm({
        labelWidth: 120,
        schemas: baseSetschemas,
        showActionButtonGroup: false,
      });

      onMounted(async () => {
        getMe().then((res) => {
          const user = res.data?.me;
          setFieldsValue({
            id: user.id,
            email: user.email,
          });
        });
      });

      return {
        register,
        handleSubmit: () => {
          createMessage.success('更新成功！');
        },
      };
    },
  });
</script>
