import type { AppRouteModule } from '/@/router/types';

import { PAGE_LAYOUT_COMPONENT } from '/@/router/constant';

const account: AppRouteModule = {
  layout: {
    path: '/contact',
    name: 'Contact',
    component: PAGE_LAYOUT_COMPONENT,
    redirect: '/contact/organization',
    meta: {
      icon: 'ant-design:home-outlined',
      title: 'Contact',
    },
  },

  routes: [
    {
      path: '/organization',
      name: 'Organization',
      component: () => import('/@/views/contact/organization/index.vue'),
      meta: {
        title: '组织',
      },
    },
    {
      path: '/client',
      name: 'Client',
      component: () => import('/@/views/contact/client/index.vue'),
      meta: {
        title: '客户',
      },
    },
    {
      path: '/general',
      name: 'ContactGeneral',
      component: () => import('/@/views/contact/general/index.vue'),
      meta: {
        title: '全部',
      },
    },
  ],
};

export default account;
