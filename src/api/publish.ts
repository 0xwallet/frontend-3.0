import { defHttp } from '/@/utils/http/axios';

/**
 * @description: Get sample list value
 */
export function getPublishRaw(txid: string) {
  return defHttp.request<any>({
    url: `https://drive-s.owaf.io/publish/${txid}/raw`,
    method: 'GET',
    headers: {
      ignoreCancelToken: true,
    },
  });
}
