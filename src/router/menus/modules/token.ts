import type { MenuModule } from '/@/router/types';
const menu: MenuModule = {
  orderNo: 2,
  menu: {
    name: 'routes.menu.token',
    path: '/token',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: 'issuer',
        name: 'routes.menu.issuer',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: 'management',
        name: 'routes.menu.management',
      },
      {
        path: 'wallet',
        name: 'routes.menu.wallet',
      },
    ],
  },
};
export default menu;
