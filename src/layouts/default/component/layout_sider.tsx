import { defineComponent } from 'vue';
import { Layout } from 'ant-design-vue';
import LayoutMent from './layout_menu';
export default defineComponent({
   name: 'LayoutSider',
   setup () {
     return () => (
       <Layout.Sider>
         <LayoutMent></LayoutMent>
       </Layout.Sider>
     );
   }
});