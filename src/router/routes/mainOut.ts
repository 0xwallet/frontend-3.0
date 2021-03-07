/**
The routing of this file will not show the layout.
It is an independent new page.
the contents of the file still need to log in to access
 */
import type { AppRouteModule } from '/@/router/types';
import { LAYOUT } from '/@/router/constant';

function getRoute(mode: string): AppRouteModule {
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    ) !== null
  ) {
    const t = `/@/views/general/metanet/mainOut/mobile/${
      mode == 's' ? 'Share' : 'Publish'
    }File.vue`;
    console.log(t);
    return {
      path: `/${mode}/file`,
      name: `Mobile${mode == 's' ? 'Share' : 'Publish'}File`,
      component: () => import(t),
      meta: {
        title: 'routes.menu.file',
        ignoreAuth: true,
      },
    };
  }
  const t = `/@/views/general/metanet/mainOut/${mode == 's' ? 'Share' : 'Publish'}File.vue`;
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
        name: `${mode == 's' ? 'Share' : 'Publish'}File`,
        component: () => import(t),
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
