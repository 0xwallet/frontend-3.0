import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const account: AppRouteModule = {
  layout: {
    path: '/history',
    name: 'History',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/history/payment',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'routes.menu.history',
    },
  },

  routes: [
    {
      path: '/payment',
      name: 'Payment',
      component: () => import('/@/views/history/payment/index.vue'),
      meta: {
        title: 'routes.menu.payment',
      },
    },
    {
      path: '/settlement',
      name: 'Settlement',
      component: () => import('/@/views/history/settlement/index.vue'),
      meta: {
        title: 'routes.menu.settlement',
      },
    },
    {
      path: '/activity',
      name: 'Activity',
      component: () => import('/@/views/history/activity/index.vue'),
      meta: {
        title: 'routes.menu.settlement',
      },
    },
  ],
};

export default account;
