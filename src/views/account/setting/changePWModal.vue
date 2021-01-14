<template>
  <BasicModal v-bind="$attrs" @register="register" title="修改密码" @ok="changePassword">
    <BasicForm @register="registerForm" :model="model" />
  </BasicModal>
</template>
<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, FormSchema, useForm } from '/@/components/Form';
  import { resetPassword } from '/@/hooks/apollo/gqlUser';

  const schemas: FormSchema[] = [
    {
      field: 'oldPassword',
      component: 'InputPassword',
      label: '原密码',
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'newPassword',
      component: 'InputPassword',
      label: '新密码',
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
    {
      field: 'newPassword2',
      component: 'InputPassword',
      label: '确认新密码',
      required: true,
      colProps: {
        span: 24,
      },
      defaultValue: '',
    },
  ];
  export default defineComponent({
    components: { BasicModal, BasicForm },
    setup(_, { emit }) {
      const modelRef = ref({});
      const [registerForm, { validateFields }] = useForm({
        labelWidth: 120,
        schemas,
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      const [register, { closeModal }] = useModalInner((data) => {});

      async function changePassword() {
        const data = await validateFields();
        //TODO 需要写业务
        console.log(data);
        // useApollo().mutate({mutation:resetPassword,variables:data})
      }

      return { register, registerForm, model: modelRef, changePassword };
    },
  });
</script>
