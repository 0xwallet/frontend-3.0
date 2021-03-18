import { BasicColumn } from '/@/components/Table';

import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate } from '/@/utils/dateUtil';
import {Icon} from "/@/components/NetFile";

const { t } = useI18n('general.metanet');
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: t('fileName'),
      dataIndex: 'name',
      width: 400,
      align: 'left',
      // slots: { customRender: 'name' },
      customRender: ({ record }) => {

        return (
          <span>
            <Icon
              type={record.type}

            />
            <a-button type="link">
              {record.name}
              {record.type === 'folder' ? '' : '.' + record.type}
            </a-button>
          </span>
        );
      },
    },
    {
      title: t('createAt'),
      width: 200,
      dataIndex: 'createdAt',
      customRender: ({ text }) => {
        return formatToDate(text);
      },
    },
    {
      title: t('expiredAt'),
      width: 200,
      dataIndex: 'expiredAt',
      slots: { customRender: 'expire' },
    },
    {
      title: t('code'),
      dataIndex: 'code',
      slots: { customRender: 'code' },
    },
    {
      title: t('action'),
      fixed: 'right',
      width: 100,
      slots: { customRender: 'action' },
    },
  ];
}
