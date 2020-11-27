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
  import { defineComponent, computed, ref } from 'vue';
  import { Button, Popconfirm } from 'ant-design-vue';
  // import { extendSlots } from '/@/utils/helper/tsxHelper';
  // import { useThrottle } from '/@/hooks/core/useThrottle';
  // import { isFunction } from '/@/utils/is';
  import Icon from '/@/components/Icon';
  import { propTypes } from '/@/utils/propTypes';

  export default defineComponent({
    name: 'AButton',
    inheritAttrs: false,
    components: { Button, Icon, Popconfirm },
    props: {
      type: propTypes.oneOf(['primary', 'default', 'danger', 'dashed', 'link']).def('default'),
      color: propTypes.oneOf(['error', 'warning', 'success', '']),
      loading: propTypes.bool,
      disabled: propTypes.bool,
      preIcon: propTypes.string,
      postIcon: propTypes.string,
      pop: propTypes.object,
    },
    setup(props, { attrs }) {
      const getIsCircleBtn = computed(() => attrs.shape === 'circle');

      const getColor = computed(() => {
        const { color, disabled } = props;
        return {
          [`ant-btn-${color}`]: !!color,
          [`is-disabled`]: disabled,
        };
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
