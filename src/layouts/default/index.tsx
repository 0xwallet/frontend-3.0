import { defineComponent, ref, reactive } from 'vue';
import { Layout, BackTop, Menu } from 'ant-design-vue';
import LayoutHeader from './component/layout_header';
import LayoutSider from './component/layout_sider';
import './style/index.less';

export default defineComponent({
  name: 'DefaultLayout',
  setup() {
    const collapsed = ref(true);
    
    function changeCollapsed (val: boolean) {
      collapsed.value = val;
    }

    return (() => (
      <>
        <Layout class='frontend-default-layout'>
          <LayoutSider collapsed={collapsed.value}>
          </LayoutSider>
          <Layout>
            <LayoutHeader collapsed={collapsed.value} changeCollapsed={changeCollapsed}>
            </LayoutHeader>
            <Layout.Content
              style={{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }}
            >
              Content
          </Layout.Content>
          </Layout>
        </Layout>
      </>
    ))
  }
});


