import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const account: AppRouteModule = {
  layout: {
    path: '/account',
    name: 'Account',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/account/setting',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'Dashboard',
    },
  },

  routes: [
    {
      path: '/setting',
      name: 'AccountSetting',
      component: () => import('/@/views/account/setting/index.vue'),
      meta: {
        title: '个人设置',
      },
    },
  ],
};

export default account;
