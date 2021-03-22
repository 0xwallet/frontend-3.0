import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n('general.metanet');
import { formatToDate } from '/@/utils/dateUtil';
import { Icon } from '/@/components/NetFile';
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: t('name'),
      dataIndex: 'name',
      width: 400,
      align: 'left',
      // slots: { customRender: 'name' },
      customRender: ({ record }) => {
        const { file } = record;
        if (file.name === 'deleted') {
          return (
            <span>
              <Icon type="bx-bx-question-mark" size={30} />
              {t('deleted')}
            </span>
          );
        }
        return (
          <span>
            <Icon type={file.type} size={30} />
            <a-button type="link">
              {file.name}
              {file.type === 'folder' ? '' : '.' + file.type}
            </a-button>
          </span>
        );
      },
    },
    {
      title: t('createDate'),
      width: 200,
      dataIndex: 'createdAt',
      customRender: ({ text }) => {
        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
        return formatToDate(text);
      },
    },
    {
      title: t('version'),
      width: 200,
      dataIndex: 'version',
    },
    // {
    //   title: t('publishLink'),
    //   dataIndex: 'txid',
    //   slots: { customRender: 'uri' },
    // },
    {
      title: t('state'),
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
