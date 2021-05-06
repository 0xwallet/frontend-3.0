import { BasicColumn } from '/@/components/Table/src/types/table';
import { byteTransfer } from '/@/utils/disk/file';
import { useI18n } from '/@/hooks/web/useI18n';
import { formatToDate } from '/@/utils/dateUtil';
import { Hash } from '/@/components/NetFile';

const { t } = useI18n('general.metanet');
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: t('fileName'),
      dataIndex: 'fullName',
      width: 200,
      align: 'left',
      ellipsis: true,
      slots: { customRender: 'name' },
    },
    {
      title: t('time'),
      width: 200,
      dataIndex: 'updatedAt',
      customRender: ({ text }) => {
        return text ? formatToDate(text) : '';

        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
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
      // width: 300,
      slots: { customRender: 'action' },
    },
  ];
}

export function getPublishColumns(): BasicColumn[] {
  return [
    {
      title: t('name'),
      dataIndex: 'name',
      width: 100,
      slots: { customRender: 'name' },
    },
    // {
    //   title: t('time'),
    //   width: 200,
    //   dataIndex: 'updatedAt',
    //   customRender: ({ text }) => {
    //     return text ? formatToDate(text) : '';
    //
    //     // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
    //   },
    // },
    // {
    //   title: '说明',
    //   dataIndex: 'desc',
    // },
    {
      title: 'Hash',
      dataIndex: 'file.hash',
      width: 150,
      customRender: ({ text }) => {
        return <Hash hash={text} />;
      },
    },

    {
      title: t('size'),
      dataIndex: 'file.size',
      width: 100,
      customRender: ({ record, text }) => {
        let v = byteTransfer(text);
        return record.type === 'folder' ? '' : v.value + ' ' + v.unit;
      },
    },
    {
      title: t('type'),
      dataIndex: 'file',
      width: 100,
      customRender: ({ text }) => text.fullType(),
    },
    {
      title: t('version'),
      dataIndex: 'file.publishInfo.version',
      width: 100,
    },

    {
      title: t('action'),
      fixed: 'right',
      width: 250,
      slots: { customRender: 'action' },
    },
  ];
}
