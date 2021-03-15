import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const account: AppRouteModule = {
  path: '/history',
  name: 'History',
  component: LAYOUT,
  redirect: '/history/payment',
  meta: {
    icon: 'fa-solid:history',
    title: 'routes.menu.history',
  },

  children: [
    {
      path: 'payment',
      name: 'Payment',
      component: () => import('/@/views/history/payment/index.vue'),
      meta: {
        title: 'routes.menu.payment',
        icon:'fa-solid:receipt'
      },
    },
    {
      path: 'settlement',
      name: 'Settlement',
      component: () => import('/@/views/history/settlement/index.vue'),
      meta: {
        title: 'routes.menu.settlement',
        icon:'fa-solid:money-check-alt'
      },
    },
    {
      path: 'activity',
      name: 'Activity',
      component: () => import('/@/views/history/activity/index.vue'),
      meta: {
        title: 'routes.menu.settlement',
        icon:'fa-solid:random'
      },
    },
  ],
};

export default account;
