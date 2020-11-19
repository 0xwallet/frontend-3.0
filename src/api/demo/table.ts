import { defHttp } from '/@/utils/http/axios';
import { DemoParams, DemoListGetResultModel } from './model/tableModel';

enum Api {
  DEMO_LIST = '/table/getDemoList',
  SHARE_LIST = '/table/getShareList',
}

/**
 * @description: Get sample list value
 */
export function demoListApi(params: DemoParams) {
  return defHttp.request<DemoListGetResultModel>({
    url: Api.DEMO_LIST,
    method: 'GET',
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
}
export function demoShareList(params: DemoParams) {
  return defHttp.request<DemoListGetResultModel>({
    url: Api.SHARE_LIST,
    method: 'GET',
    params,
  });
}
