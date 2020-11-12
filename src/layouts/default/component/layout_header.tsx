import type { PropType } from 'vue';
import { defineComponent, withModifiers } from 'vue';
import { Layout } from 'ant-design-vue';
import LayoutAvatar from './layout_avatar';
import MenuFoldOutlined from '@ant-design/icons-vue/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons-vue/MenuUnfoldOutlined';

export default defineComponent({
  name: 'LayoutHeader',
  props: {
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: true
    },
    changeCollapsed: {
      type: Function as PropType<Function>,
      default: new Function
    }
  },
  setup (props) {
    return () => {
      const { collapsed, changeCollapsed } = props;
      return (
        <Layout.Header class="frontend-layout-header">
          {
            props.collapsed ?
              <MenuUnfoldOutlined
                class="trigger"
                onClick={withModifiers(() => changeCollapsed(!collapsed), ['stop'])}
              /> :
              <MenuFoldOutlined
                class="trigger"
                onClick={withModifiers(() => changeCollapsed(!collapsed), ['stop'])}
                />
          }
          <div class="frontend-layout-header right">
            <LayoutAvatar></LayoutAvatar>
          </div>
        </Layout.Header>
      )
    };
  }
});