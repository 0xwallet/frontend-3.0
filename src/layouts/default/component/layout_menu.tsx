import { defineComponent, reactive } from 'vue';
import { Menu } from 'ant-design-vue';
import UserOutlined from '@ant-design/icons-vue/UserOutlined';

export default defineComponent({
  name: 'LayoutMenu',
  setup () {
    const selectedKeys = reactive(['1']);

    return (() => (
      <Menu theme="dark" mode="inline" v-model={[selectedKeys, 'selectedKeys']}>
        <Menu.Item key="1">
          <UserOutlined />
          <span>nav 1</span>
        </Menu.Item>
        <Menu.Item key="2">
          <UserOutlined />
          <span>nav 2</span>
        </Menu.Item>
        <Menu.Item key="3">
          <UserOutlined />
          <span>nav 3</span>
        </Menu.Item>
      </Menu>
    ));
  }
});