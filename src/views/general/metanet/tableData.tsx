import { BasicColumn } from '/@/components/Table/src/types/table';
import { byteTransfer } from '/@/utils/disk/file';
import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate } from '/@/utils/dateUtil';
const { t } = useI18n('general.metanet');
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: t('fileName'),
      dataIndex: 'fullName',
      width: 400,
      align: 'left',
      slots: { customRender: 'name' },
    },
    {
      title: t('time'),
      width: 200,
      dataIndex: 'updatedAt',
      customRender: ({ text }) => {
        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
        return formatToDate(text);
      },
    },
    // {
    //   title: '说明',
    //   dataIndex: 'desc',
    // },
    {
      title: 'Hash',
      dataIndex: 'hash',
      width: 150,
      slots: { customRender: 'hash' },
    },

    {
      title: t('size'),
      dataIndex: 'size',
      width: 100,
      customRender: ({ record, text }) => {
        let v = byteTransfer(text);
        return record.type === 'folder' ? '' : v.value + ' ' + v.unit;
      },
    },
    {
      title: t('type'),
      dataIndex: 'type',
      width: 100,
      customRender: ({ text }) => {
        return text === 'folder' ? '' : text;
      },
    },

    {
      title: t('action'),
      fixed: 'right',
      width: 100,
      slots: { customRender: 'action' },
    },
  ];
}
