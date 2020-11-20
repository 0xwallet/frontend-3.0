<template>
  <span>
    <Popconfirm v-bind="popConfig" :visible="visible" @visibleChange="handleVisibleChange">
      <Button v-bind="getBindValue" :class="[getColor, $attrs.class]">
        <template #default="data">
          <Icon :icon="preIcon" :class="{ 'mr-1': !getIsCircleBtn }" v-if="preIcon" />
          <slot v-bind="data" />
          <Icon :icon="postIcon" :class="{ 'ml-1': !getIsCircleBtn }" v-if="postIcon" />
        </template>
      </Button>
    </Popconfirm>
  </span>
</template>
<script lang="ts">
  import { PropType } from 'vue';

  import { defineComponent, computed, ref } from 'vue';
  import { Button, Popconfirm } from 'ant-design-vue';
  // import { extendSlots } from '/@/utils/helper/tsxHelper';
  // import { useThrottle } from '/@/hooks/core/useThrottle';
  // import { isFunction } from '/@/utils/is';

  import { defineComponent, computed } from 'vue';
  import { Button } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  export default defineComponent({
    name: 'AButton',
    inheritAttrs: false,
    components: { Button, Icon, Popconfirm },
    props: {
      // 按钮类型
      type: {
        type: String as PropType<'primary' | 'default' | 'danger' | 'dashed' | 'link'>,
        default: 'default',
      },
      color: {
        type: String as PropType<'error' | 'warning' | 'success' | ''>,
      },
      loading: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      disabled: {
        type: Boolean as PropType<boolean>,
        default: false,
      },
      preIcon: {
        type: String as PropType<string>,
      },
      postIcon: {
        type: String as PropType<string>,
      },
      pop: {
        type: Object as PropType<object>,
      },
    },
    setup(props, { attrs }) {
      const getIsCircleBtn = computed(() => {
        return attrs.shape === 'circle';
      });

      const getColor = computed(() => {
        const { color, disabled } = props;
        return [
          {
            [`ant-btn-${color}`]: !!color,
            [`is-disabled`]: disabled,
          },
        ];
      });

      const getBindValue = computed((): any => {
        return { ...attrs, ...props };
      });

      // 新增popComfirm扩展
      const visible = ref(false);
      const popConfig = computed(() => {
        if (props.pop === undefined) {
          return undefined;
        }
        let config = props.pop;
        if (config.okText === undefined) {
          config.okText = '是';
        }
        if (config.cancelText === undefined) {
          config.cancelText = '否';
        }

        if (config.onConfirm == undefined && getBindValue.value.onClick != undefined) {
          config.onConfirm = getBindValue.value.onClick;
          getBindValue.value.onClick = undefined;
        }
        return config;
      });

      function handleVisibleChange(v) {
        if (!v || popConfig.value === undefined) {
          visible.value = false;
          return;
        }
        visible.value = true;
      }

      return { getBindValue, getColor, getIsCircleBtn, visible, handleVisibleChange, popConfig };
    },
  });
</script>
