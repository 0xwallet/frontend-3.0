import loginRoute from './user';
import root from './root';
import error from './error';

// 基础路由 不用权限
export const basicRoutes = [loginRoute, root, error];