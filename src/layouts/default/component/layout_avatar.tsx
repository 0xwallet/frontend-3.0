import { Badge, Avatar } from 'ant-design-vue';
import { defineComponent } from 'vue';
import UserOutlined from '@ant-design/icons-vue/UserOutlined';

export default defineComponent({
  name: 'layout-avatar',
  setup () {
    return (() => {
      const slots = {
        icon: () => <UserOutlined />
      };
      return (
        <Badge count="1">
          <Avatar shape="square" src={require('@/assets/images/login/dark.png')}>
          </Avatar>
      </Badge>
      )
    })
  }
})