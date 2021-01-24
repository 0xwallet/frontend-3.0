import { BasicColumn } from '/@/components/Table';
import GIcon from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n('general.metanet');
import { formatToDate } from '/@/utils/dateUtil';
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
      title: t('publishAt'),
      width: 200,
      dataIndex: 'createdAt',
      customRender: ({ text }) => {
        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
        return formatToDate(text);
      },
    },
    {
      title: t('publishVersion'),
      width: 200,
      dataIndex: 'version',
    },
    {
      title: t('publishLink'),
      dataIndex: 'txid',
      customRender: ({ text }) => {
        console.log(text);
        return text;
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
    },
    {
      title: t('action'),
      fixed: 'right',
      width: 100,
      slots: { customRender: 'action' },
    },
  ];
}
