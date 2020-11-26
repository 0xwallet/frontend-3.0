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
      title: 'History',
    },
  },

  routes: [
    {
      path: '/payment',
      name: 'Payment',
      component: () => import('/@/views/history/payment/index.vue'),
      meta: {
        title: '支付',
      },
    },
    {
      path: '/settlement',
      name: 'Settlement',
      component: () => import('/@/views/history/settlement/index.vue'),
      meta: {
        title: '结算',
      },
    },
    {
      path: '/activity',
      name: 'Activity',
      component: () => import('/@/views/history/activity/index.vue'),
      meta: {
        title: '审计',
      },
    },
  ],
};

export default account;
