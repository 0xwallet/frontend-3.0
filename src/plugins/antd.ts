import type { App } from 'vue';

import { Form, Input, Button } from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

function install(app: App<Element>) {
  app.component(Button.Group.name, Button.Group);
  app.use(Button);
  app.use(Form);
  app.use(Input);
}

export default { install };
