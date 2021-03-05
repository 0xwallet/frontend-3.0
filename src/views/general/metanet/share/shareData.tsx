import { BasicColumn } from '/@/components/Table';
import GIcon from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate } from '/@/utils/dateUtil';

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
        if (record.name === 'deleted') {
          return (
            <span>
              <GIcon icon="bx-bx-question-mark" size="30" />
              {t('deleted')}
            </span>
          );
        }
        return (
          <span>
            <GIcon
              icon={record.type === 'folder' ? 'bx-bx-folder' : 'bx-bxs-file-' + record.type}
              size="30"
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
