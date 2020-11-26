import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const general: AppRouteModule = {
  layout: {
    path: '/general',
    name: 'General',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/general/account',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'General',
    },
  },

  routes: [
    {
      path: '/account',
      name: 'Account',
      component: () => import('/@/views/general/account/index.vue'),
      meta: {
        title: '账户',
      },
    },
    {
      path: '/security',
      name: 'Security',
      component: () => import('/@/views/general/security/index.vue'),
      meta: {
        title: '安全',
      },
    },
    {
      path: '/metanet',
      name: 'Metanet',
      component: () => import('/@/views/general/metanet/index.vue'),
      meta: {
        title: '元网',
      },
    },
  ],
};

export default general;
