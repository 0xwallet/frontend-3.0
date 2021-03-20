/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';
//调试
function getRoute(mode: string): AppRouteModule {
  const t = mode == 's' ? 'ShareFile' : 'PublishFile';
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ) !== null
  ) {
    return {
      path: `/${mode}/file`,
      name: t,
      component: () => import(`../../views/general/metanet/mainOut/mobile/${t}.vue`),
      meta: {
        title: 'routes.menu.file',
        ignoreAuth: true,
      },
    };
  }
  return {
    path: `/${mode}`,
    name: `${mode == 's' ? 'share' : 'publish'}MainOut`,
    component: LAYOUT,
    redirect: `/${mode}/file`,
    meta: {
      title: `routes.menu.${mode == 's' ? 'Share' : 'Publish'}`,
      ignoreAuth: true,
    },
    children: [
      {
        path: 'file',
        name: t,
        component: () => import(`../../views/general/metanet/mainOut/${t}.vue`),
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
export const mainOutRoutes: AppRouteModule[] = [getRoute('s'), getRoute('p')];

export const mainOutRouteNames = mainOutRoutes.map((item) => item.name);
