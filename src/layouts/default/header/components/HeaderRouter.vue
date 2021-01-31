<template>
  <div :class="[prefixCls, `${prefixCls}--${theme}`]">
    <Space
      ><Button type="link">{{ t('dashboard') }}</Button>
      <Button type="link">{{ t('blog') }}</Button>
      <Button type="link">{{ t('help') }}</Button></Space
    >
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import { Space, Button } from 'ant-design-vue';
  import Icon from '/@/components/Icon';
  import { propTypes } from '/@/utils/propTypes';
  import { useGo } from '/@/hooks/web/usePage';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useI18n } from '/@/hooks/web/useI18n';

  export default defineComponent({
    name: 'HeaderRouter',
    components: { Icon, Space, Button },
    props: {
      theme: propTypes.oneOf(['dark', 'light']),
    },
    setup() {
      const { t } = useI18n('layout.header');
      const { prefixCls } = useDesign('layout-breadcrumb');
      const go = useGo();
      console.log(t('blog'));
      return { t, prefixCls };
    },
  });
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-layout-breadcrumb';

  .@{prefix-cls} {
    display: flex;
    padding: 0 8px;
    align-items: center;

    .ant-breadcrumb-link {
      .anticon {
        margin-right: 4px;
        margin-bottom: 2px;
      }
    }

    &--light {
      .ant-breadcrumb-link {
        color: @breadcrumb-item-normal-color;

        a {
          color: rgba(0, 0, 0, 0.65);

          &:hover {
            color: @primary-color;
          }
        }
      }

      .ant-breadcrumb-separator {
        color: @breadcrumb-item-normal-color;
      }
    }

    &--dark {
      .ant-breadcrumb-link {
        color: rgba(255, 255, 255, 0.6);

        a {
          color: rgba(255, 255, 255, 0.8);

          &:hover {
            color: @white;
          }
        }
      }

      .ant-breadcrumb-separator,
      .anticon {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
</style>
