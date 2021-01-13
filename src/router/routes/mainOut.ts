import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

// test
// http:ip:port/main-out
export const mainOutRoutes: AppRouteModule[] = [
  {
    path: '/s',
    name: 'MainOut',
    component: LAYOUT,
    redirect: '/s/file',
    meta: {
      title: 'routes.menu.share',
      ignoreAuth: true,
    },
    children: [
      {
        path: 'file',
        name: 'ShareFile',
        component: () => import('/@/views/general/metanet/share/shareFile.vue'),
        meta: {
          hideBreadcrumb: true,
          title: 'routes.menu.file',
          ignoreAuth: true,
        },
      },
    ],
  },
  {
    path: '/h',
    name: 'Hash',
    component: () => import('/@/views/general/metanet/publish/releaseFile.vue'),
    meta: {
      title: 'routes.menu.release',
      ignoreAuth: true,
    },
  },
];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
