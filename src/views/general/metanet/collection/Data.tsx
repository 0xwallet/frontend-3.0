import { BasicColumn } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Icon, Hash } from '/@/components/NetFile';
dayjs.extend(duration);
dayjs.extend(relativeTime);
const { t } = useI18n('general.metanet');
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: t('fileName'),
      dataIndex: 'id',
      width: 400,
      align: 'left',
      // slots: { customRender: 'name' },
      customRender: ({ record }) => {
        // console.log(record);
        return (
          <span>
            <Icon type={record.file.type} size={30} />
            <a-button type="link">{record.file.fileName()}</a-button>
          </span>
        );
      },
    },
    {
      title: 'Hash',
      dataIndex: 'hash',
      customRender: ({ record }) => {
        return <Hash hash={record.file?.hash} />;
      },
    },
    {
      title: t('type'),
      dataIndex: 'type',
      customRender: ({ record }) => {
        if (record.item.__typename === 'DriveShare') return t('shareButton');
        if (record.item.__typename === 'DrivePublish') return t('publication');
        return '';
      },
    },
    {
      title: t('status'),
      dataIndex: 'file',
      customRender: ({ record }) => {
        if (record.item.__typename === 'DriveShare') {
          if (dayjs().isBefore(record.item.expiredAt)) {
            return t('accessible');
          } else {
            return t('invalid');
          }
          // if (record.item.userFile.isShared) {
          //   // console.log(record.item.userFile);
          // }
        }
        if (record.item.__typename === 'DrivePublish') return t('publish');
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
