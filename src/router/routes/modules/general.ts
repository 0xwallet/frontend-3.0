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
      title: 'routes.menu.general',
    },
  },

  routes: [
    {
      path: '/account',
      name: 'Account',
      component: () => import('/@/views/general/account/index.vue'),
      meta: {
        title: 'routes.menu.account',
      },
    },
    {
      path: '/security',
      name: 'Security',
      component: () => import('/@/views/general/security/index.vue'),
      meta: {
        title: 'routes.menu.security',
      },
    },
    {
      path: '/metanet',
      name: 'Metanet',
      component: () => import('/@/views/general/metanet/index.vue'),
      meta: {
        title: 'routes.menu.metanet',
      },
    },
    {
      path: '/shareFile/:uri',
      name: 'ShareFile',
      component: () => import('/@/views/general/metanet/share/shareFile.vue'),
      meta: {
        title: 'routes.menu.shareFile',
      },
    },
  ],
};

export default general;
