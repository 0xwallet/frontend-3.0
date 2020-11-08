import { defineComponent } from 'vue';
import { Layout, BackTop, Menu } from 'ant-design-vue';
import LayoutHeader from './component/layout_header';
import LayoutSider from './component/layout_sider';

export default defineComponent({
  name: 'DefaultLayout',
  setup () {
      return (() => (
        <div>来了，老弟！/frontend/login</div>
      ))
  }
});


