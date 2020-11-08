import type { RouteRecordRaw } from 'vue-router';
import { RoleEnum } from '@/enums/roleEnum';

export interface RouteMeta {
  // title
  title?: string;
  // Whether to ignore permissions
  ignoreAuth?: boolean;
  // role info
  roles?: RoleEnum[];
  // Whether not to cache
  ignoreKeepAlive?: boolean;
  // Is it fixed on tab
  affix?: boolean;
  // icon on tab
  icon?: string;
  // Jump address
  frameSrc?: string;
  // Outer link jump address
  externalLink?: string;

  // current page transition
  transitionName?: string;

  // Whether the route has been dynamically added
  hideBreadcrumb?: boolean;

  // disabled redirect
  disabledRedirect?: boolean;

  // close loading
  afterCloseLoading?: boolean;

  inTab?: boolean;
}

export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'children'> {
  meta?: RouteMeta;
  component?: any;
  components?: any;
  children?: AppRouteRecordRaw[];
  props?: any;
}

export interface RouteRegExpMatcher {
  re: RegExp;
  name: string;
  component?: any;
  components?: any;
  children?: AppRouteRecordRaw[];
  props?: any;
  meta?: RouteMeta;
}