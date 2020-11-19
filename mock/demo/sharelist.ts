import { MockMethod } from 'vite-plugin-mock';
import { resultPageSuccess } from '../_util';

const demoList = (() => {
  const result: any[] = [];
  for (let index = 0; index < 60; index++) {
    result.push({
      id: `${index}`,
      createAt: '@datetime',
      'time|1': ['永久', ''],
      'type|1': ['doc', 'pdf', 'txt'],
      'size|100000-10000000': 100000,
      'status|1': ['1', '0'],
      name: '@word()',
    });
  }
  return result;
})();

export default [
  {
    url: '/api/table/getShareList',
    timeout: 1000,
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20 } = query;
      return resultPageSuccess(page, pageSize, demoList);
    },
  },
] as MockMethod[];
