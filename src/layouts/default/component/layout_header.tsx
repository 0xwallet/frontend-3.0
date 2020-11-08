import { defineComponent } from 'vue';
import { Layout } from 'ant-design-vue';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';

export default defineComponent({
  name: 'LayoutHeader',
  setup () {
    return (
      <Layout.Header>
        <MenuUnfoldOutlined />
        <MenuFoldOutlined />
      </Layout.Header>
    );
  }
});