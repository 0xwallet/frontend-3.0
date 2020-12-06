<template>
  <InputSearch v-model:value="getBindValue" :placeholder="placeholder" @search="startCountdown">
    <template #enterButton>
      <Button type="primary"> {{ title }}</Button>
    </template>
  </InputSearch>
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { Input } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { Button } from '/@/components/Button';
  import { propTypes } from '/@/utils/propTypes';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { isFunction } from '/@/utils/is';

  const { t } = useI18n('component.countdown');

  export default defineComponent({
    name: 'CountDown',
    components: { Icon, InputSearch: Input.Search, Button },
    props: {
      time: propTypes.number.def(60),
      title: propTypes.string.def('Send'),
      value: propTypes.any,
      placeholder: propTypes.any,
      onClick: propTypes.func,
      msg: propTypes.string.def('sent'),
      unit: propTypes.string.def(t('seconds')),
    },
    setup(props) {
      const time = ref(0);
      const title = computed(() => {
        return time.value > 0 ? `${t('wait')} ${time.value} ${props.unit}` : `${props.title} `;
      });
      const placeholder = computed(() => {
        return String(props.placeholder);
      });
      const getBindValue = computed((): any => {
        return props.value;
      });
      const { createMessage } = useMessage();
      function startCountdown() {
        if (time.value > 0) {
          createMessage.warning(`${t('wait')} ${time.value} ${props.unit}`);
          return;
        } else {
          time.value = props.time;
          setInterval(() => {
            if (time.value > 0) {
              time.value -= 1;
            } else {
              clearInterval();
            }
          }, 1000);
          // createMessage.success(props.msg);
        }

        if (isFunction(props.onClick)) {
          props.onClick();
        }
      }

      return { getBindValue, startCountdown, title, placeholder };
    },
  });
</script>
