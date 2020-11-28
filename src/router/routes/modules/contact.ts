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
      title: 'routes.menu.contact',
    },
  },

  routes: [
    {
      path: '/organization',
      name: 'Organization',
      component: () => import('/@/views/contact/organization/index.vue'),
      meta: {
        title: 'routes.menu.organization',
      },
    },
    {
      path: '/client',
      name: 'Client',
      component: () => import('/@/views/contact/client/index.vue'),
      meta: {
        title: 'routes.menu.client',
      },
    },
    {
      path: '/general',
      name: 'ContactGeneral',
      component: () => import('/@/views/contact/general/index.vue'),
      meta: {
        title: 'routes.menu.general',
      },
    },
  ],
};

export default account;
