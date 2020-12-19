import { BasicColumn } from '/@/components/Table/src/types/table';
import { byteTransfer } from '/@/utils/disk/file';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { unref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { Tooltip } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import moment from 'moment';
import projectSetting from '/@/settings/projectSetting';
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();
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
        moment.locale(projectSetting.locale.lang);
        // return moment(text).format('MMM DD YYYY, hh:mm:ss A');
        return moment(text).format('lll');
      },
    },
    // {
    //   title: '说明',
    //   dataIndex: 'desc',
    // },
    {
      title: 'Hash',
      dataIndex: 'hash',
      customRender: ({ text }) => {
        if (!text) {
          return '';
        }
        let list: any[] = [];
        for (let i = 1; i < 11; i++) {
          list.push(text.slice(2 + 6 * (i - 1), 2 + 6 * i));
        }

        return (
          <Tooltip title={t('copy')}>
            {{
              default: () => {
                return (
                  <span
                    onClick={() => {
                      clipboardRef.value = text;
                      if (unref(copiedRef)) {
                        createMessage.warning(t('copySuccess'));
                      }
                    }}
                  >
                    {text.slice(0, 2)}
                    {list.map((value) => (
                      <span style={'background-color:#' + value}>&nbsp;&nbsp;&nbsp;</span>
                    ))}
                    {text.slice(text.length - 2, text.length)}
                  </span>
                );
              },
            }}
          </Tooltip>
        );
      },
    },

    {
      title: t('size'),
      dataIndex: 'size',
      width: 100,
      customRender: ({ record, text }) => {
        return record.type === 'folder' ? '' : byteTransfer(text);
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
