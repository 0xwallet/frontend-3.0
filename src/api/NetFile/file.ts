import { defHttp } from '/@/utils/http/axios';

export function getFileRaw(url: string) {
  return defHttp.request<any>(
    {
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    },
    { isTransformRequestResult: false }
  );
}
