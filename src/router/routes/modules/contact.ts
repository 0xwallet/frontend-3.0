import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';

const account: AppRouteModule = {
  path: '/contact',
  name: 'Contact',
  component: LAYOUT,
  redirect: '/contact/organization',
  meta: {
    icon: 'fa-solid:address-book',
    title: 'routes.menu.contact',
  },

  children: [
    {
      path: 'organization',
      name: 'Organization',
      component: () => import('/@/views/contact/organization/index.vue'),
      meta: {
        title: 'routes.menu.organization',
        icon:'fa-solid:sitemap'
      },
    },
    {
      path: 'client',
      name: 'Client',
      component: () => import('/@/views/contact/client/index.vue'),
      meta: {
        title: 'routes.menu.client',
        icon:'fa-solid:address-card'
      },
    },
    {
      path: 'general',
      name: 'ContactGeneral',
      component: () => import('/@/views/contact/general/index.vue'),
      meta: {
        title: 'routes.menu.general',
        icon:'fa-solid:globe'
      },
    },
  ],
};

export default account;
