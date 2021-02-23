import type { AppRouteModule } from '/@/router/types';

import { LAYOUT } from '/@/router/constant';
import { t } from '/@/hooks/web/useI18n';

const dashboard: AppRouteModule = {
  path: '/home',
  name: 'Home',
  component: LAYOUT,
  redirect: '/home/dashboard',
  meta: {
    icon: 'bx:bx-home',
    title: t('routes.dashboard.welcome'),
  },
  children: [
    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('/@/views/home/index.vue'),
      meta: {
        title: t('routes.dashboard.welcome'),
        affix: true,
        icon: 'bx:bx-home',
      },
    },
  ],
};

export default dashboard;
