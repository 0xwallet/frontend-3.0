<template>
  <BasicModal v-bind="$attrs" @register="register" @ok="shareFile">
    <template #appendFooter
      ><Button type="primary" @click="copy(3)" v-if="shareUrl"> {{ button }}</Button></template
    >
    <div class="ml-20">
      <div> <BasicForm @register="registerForm" v-if="!shareUrl" /></div>

      <div class="w-2/3" v-if="shareUrl">
        <div class="flex flex-col">
          <div>{{ t('shareUrl') }}</div>
          <Input v-model:value="shareUrl">
            <template #suffix>
              <span @click="copy(1)" class="text-blue-600">{{ t('copyButton') }}</span>
            </template>
          </Input>
        </div>

        <div class="mt-3 w-2/3 flex flex-col" v-if="file.shareInfo.code"
          ><div>{{ t('accessCode') }}</div>

          <Input v-model:value="file.shareInfo.code" placeholder=""
            ><template #suffix>
              <span @click="copy(6)" class="text-blue-600">{{ t('copyButton') }}</span>
            </template></Input
          >
        </div>
        <div class="mt-10"
          >{{ t('linkValidTime') }}<span class="text-blue-500">{{ day }} {{ t('days') }}</span>
        </div>
      </div>
    </div>
  </BasicModal>
</template>
<script lang="ts">
  import { computed, defineComponent, ref, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form';
  import { Input } from 'ant-design-vue';
  import { NetFile } from '/@/components/NetFile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Button } from '/@/components/Button';

  const { t } = useI18n('general.metanet');
  function randomString(len) {
    len = len || 32;
    const chars =
      'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    const maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  }
  export default defineComponent({
    components: {
      BasicModal,
      BasicForm,
      Input,
      Button,
    },
    setup() {
      const file = ref<NetFile>({});
      const day = ref(7);
      const button = ref('');
      const shareUrl = computed(() => {
        if (!file.value.shareInfo?.uri) return '';
        return `${window.location.origin}/#/s/file?uri=${file.value.shareInfo.uri}`;
      });
      const radioStyle = {
        height: '30px',
        lineHeight: '30px',
      };
      const [register, { setModalProps }] = useModalInner((data) => {
        file.value = unref(data.record);
        file.value.shareInfo.uri = '';
        setModalProps({
          showOkBtn: true,
          okText: t('createShare'),
          title: `${t('shareFile')}:${data.record.fileName()}`,
          height: 300,
        });
      });

      const [registerForm, { validateFields }] = useForm({
        schemas: [
          {
            field: 'shareType',
            label: t('shareType'),
            component: 'RadioGroup',
            defaultValue: 'public',
            componentProps: {
              options: [
                {
                  value: 'public',
                  label: t('public'),
                },
                {
                  value: 'private',
                  label: t('private'),
                },
              ],
            },
          },

          {
            field: 'day',
            component: 'InputNumber',
            label: t('validTime'),
            required: true,
            defaultValue: day.value,
          },
          {
            field: 'code',
            component: 'Input',
            label: t('accessCode'),
            required: true,
            componentProps: {
              style: { width: '200px' },
            },
            defaultValue: randomString(4),
            ifShow: ({ values }) => {
              return values.shareType === 'private';
            },
          },
        ],
        showActionButtonGroup: false,
        actionColOptions: {
          span: 24,
        },
      });

      async function shareFile() {
        try {
          const params = await validateFields();
          day.value = params.day;
          console.log(params);
          if (params.shareType == 'public') {
            button.value = t('copyLink');
          } else {
            button.value = t('copyShare');
          }
          await file.value.share(params);
        } catch (e) {
          console.log(e);
        } finally {
          setModalProps({ showOkBtn: false });
        }
      }
      function copy(v) {
        console.log('vvv',v)
        file.value.copyShareUrl(v);
      }
      return {
        register,
        registerForm,
        shareFile,
        file,
        shareUrl,
        copy,
        t,
        radioStyle,
        day,
        button,
      };
    },
  });
</script>
