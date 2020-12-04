import { defHttp } from '/@/utils/http/axios';

export function getFile(url: string) {
  return defHttp.request(
    {
      url: '',
      baseURL: url,
      method: 'GET',
    },
    { isTransformRequestResult: false }
  );
}
