import type { MenuModule } from '/@/router/types';
const menu: MenuModule = {
  orderNo: 4,
  menu: {
    name: 'routes.menu.history',
    path: '/history',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: 'payment',
        name: 'routes.menu.payment',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: 'settlement',
        name: 'routes.menu.settlement',
      },
      {
        path: 'activity',
        name: 'routes.menu.activity',
      },
    ],
  },
};
export default menu;
