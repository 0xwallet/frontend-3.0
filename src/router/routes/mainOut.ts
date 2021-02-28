/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

function getRoute(): AppRouteModule {
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ) !== null
  ) {
    return {
      path: '/s/file',
      name: 'MobileShareFile',
      component: () => import('/@/views/general/metanet/share/MobileShareFile.vue'),
      meta: {
        title: 'routes.menu.file',
        ignoreAuth: true,
      },
    };
  }
  return {
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
  };
}

// test
// http:ip:port/main-out
export const mainOutRoutes: AppRouteModule[] = [
  getRoute(),
  {
    path: '/p',
    name: 'Publish',
    component: () => import('/@/views/general/metanet/publish/publishFile.vue'),
    meta: {
      title: 'routes.menu.release',
      ignoreAuth: true,
    },
  },
];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
