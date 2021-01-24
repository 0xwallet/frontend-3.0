import { BasicColumn } from '/@/components/Table';
import GIcon from '/@/components/Icon';
import { useI18n } from '/@/hooks/web/useI18n';
import moment from 'moment';
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
        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
        return moment(text).format('lll');
      },
    },
    {
      title: t('expiredAt'),
      width: 200,
      dataIndex: 'expiredAt',
      customRender: ({ record }) => {
        if (record.name === 'deleted') {
          return t('expired');
        }
        const m1 = moment(record.createAt);
        const m2 = moment(record.expiredAt);
        //@ts-ignore
        const du = moment.duration(m2 - m1, 'ms');
        return du.humanize();
      },
    },
    // {
    //   title: 'HASH',
    //   dataIndex: 'hash',
    //   customRender: ({ text }) => {
    //     if (!text) {
    //       return '';
    //     }
    //     let list = [];
    //     for (let i = 1; i < 11; i++) {
    //       list.push(text.slice(2 + 6 * (i - 1), 2 + 6 * i));
    //     }
    //     return (
    //       <Tooltip title={t('copy')}>
    //         <span
    //           onClick={() => {
    //             clipboardRef.value = text;
    //             if (unref(copiedRef)) {
    //               createMessage.success(t('copySuccess'));
    //             }
    //           }}
    //         >
    //           {text.slice(0, 2)}
    //           {list.map((value) => (
    //             <span style={'background-color:#' + value}>&nbsp;&nbsp;&nbsp;</span>
    //           ))}
    //           {text.slice(text.length - 2, text.length)}
    //         </span>
    //       </Tooltip>
    //     );
    //   },
    // },
    // {
    //   // title: '网址',
    //   dataIndex: 'uri',
    //   width: 300,
    //   slots: { customRender: 'uri', title: 'urlTitle' },
    // },
    {
      title: t('code'),
      dataIndex: 'code',
    },
    {
      title: t('action'),
      fixed: 'right',
      width: 100,
      slots: { customRender: 'action' },
    },
  ];
}
