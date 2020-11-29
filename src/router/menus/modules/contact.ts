import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 3,
  menu: {
    name: 'routes.menu.contact',
    path: '/contact',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/organization',
        name: 'routes.menu.organization',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/client',
        name: 'routes.menu.client',
      },
      {
        path: '/general',
        name: 'routes.menu.general',
      },
    ],
  },
};
export default menu;
