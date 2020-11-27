import type { MenuModule } from '/@/router/types.d';
const menu: MenuModule = {
  orderNo: 10,
  menu: {
    name: 'routes.menu.disk',
    path: '/disk',
    // tag: {
    //   dot: true,
    // },
    children: [
      {
        path: '/files',
        name: 'routes.menu.files',
        // tag: {
        //   content: 'new',
        // },
      },
      {
        path: '/share',
        name: 'routes.menu.share',
      },
      {
        path: '/recycle',
        name: 'routes.menu.recycle',
      },
    ],
  },
};
export default menu;
