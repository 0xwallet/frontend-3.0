import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const account: AppRouteModule = {
  layout: {
    path: '/token',
    name: 'Token',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/token/organization',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'routes.menu.token',
    },
  },

  routes: [
    {
      path: '/issuer',
      name: 'Issuer',
      component: () => import('/@/views/token/issuer/index.vue'),
      meta: {
        title: 'routes.menu.issuer',
      },
    },
    {
      path: '/management',
      name: 'Management',
      component: () => import('/@/views/token/management/index.vue'),
      meta: {
        title: 'routes.menu.management',
      },
    },
    {
      path: '/wallet',
      name: 'Wallet',
      component: () => import('/@/views/token/wallet/index.vue'),
      meta: {
        title: 'routes.menu.wallet',
      },
    },
  ],
};

export default account;
