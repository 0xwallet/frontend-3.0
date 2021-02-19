<!--
 * @Author: Vben
 * @Description: logo component
-->
<template>
  <div
    class="anticon"
    :class="[prefixCls, theme, { 'collapsed-show-title': getCollapsedShowTitle }]"
    @click="handleGoHome"
  >
    <Svg :width="40" :height="40" />
    <div
      class="ml-2 truncate xs:opacity-0 md:opacity-100"
      :class="`${prefixCls}__title`"
      v-show="showTitle"
    >
      {{ title }}
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  import { useGlobSetting } from '/@/hooks/setting';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';

  import { PageEnum } from '/@/enums/pageEnum';
  import { propTypes } from '/@/utils/propTypes';

  import { Svg } from '/@/components/Svg';
  export default defineComponent({
    name: 'AppLogo',
    components: { Svg },
    props: {
      /**
       * The theme of the current parent component
       */
      theme: propTypes.oneOf(['light', 'dark']),
      // Whether to show title
      showTitle: propTypes.bool.def(true),
    },
    setup() {
      const { prefixCls } = useDesign('app-logo');
      const { getCollapsedShowTitle } = useMenuSetting();

      const { title } = useGlobSetting();

      const go = useGo();

      function handleGoHome(): void {
        go(PageEnum.BASE_HOME);
      }

      return {
        handleGoHome,
        title,
        prefixCls,
        getCollapsedShowTitle,
      };
    },
  });
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding-left: 7px;
    cursor: pointer;
    transition: all 0.2s ease;

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light {
      border-bottom: 1px solid @border-color-base;
    }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: @primary-color;
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      font-size: 16px;
      font-weight: 700;
      transition: all 0.5s;
    }
  }
</style>
