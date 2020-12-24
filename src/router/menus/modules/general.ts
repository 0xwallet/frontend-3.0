import type { MenuModule } from '/@/router/types';
const menu: MenuModule = {
  orderNo: 5,
  menu: {
    path: '/general',
    name: 'routes.menu.GENERAL',

    children: [
      {
        path: 'account',
        name: 'routes.menu.account',
      },
      {
        path: 'security',
        name: 'routes.menu.security',
      },
      {
        path: 'metanet',
        name: 'routes.menu.metanet',
      },
    ],
  },
};
export default menu;
