import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import { Layout } from 'ant-design-vue';
import LayoutMent from './layout_menu';
import { useGlobalSetting } from '@/hooks/state/global';

export default defineComponent({
   name: 'LayoutSider',
   props: {
    collapsed: {
      type: Boolean as PropType<boolean>,
      default: true
    }
  },
   setup (props) {
    const [setting] = useGlobalSetting();

     return () => {
       const {collapsed} = props;

      return (
        <Layout.Sider class="frontend-layout-sider" collapsed={collapsed} trigger={null} collapsible>
          <div class="frontend-layout-sider-logo">{setting.title}</div>
          <LayoutMent></LayoutMent>
        </Layout.Sider>
      )
     };
   }
});