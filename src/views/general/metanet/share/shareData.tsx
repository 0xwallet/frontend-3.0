import { BasicColumn } from '/@/components/Table';
import { byteTransfer } from '/@/utils/disk/file';
import GIcon from '/@/components/Icon';
import { Tooltip } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { unref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
const { clipboardRef, copiedRef } = useCopyToClipboard();
const { createMessage } = useMessage();
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
      title: 'HASH',
      dataIndex: 'hash',
      customRender: ({ text }) => {
        if (!text) {
          return '';
        }
        let list = [];
        for (let i = 1; i < 11; i++) {
          list.push(text.slice(2 + 6 * (i - 1), 2 + 6 * i));
        }
        return (
          <Tooltip title={t('copy')}>
            <span
              onClick={() => {
                clipboardRef.value = text;
                if (unref(copiedRef)) {
                  createMessage.success(t('copySuccess'));
                }
              }}
            >
              {text.slice(0, 2)}
              {list.map((value) => (
                <span style={'background-color:#' + value}>&nbsp;&nbsp;&nbsp;</span>
              ))}
              {text.slice(text.length - 2, text.length)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      // title: '网址',
      dataIndex: 'uri',
      width: 300,
      slots: { customRender: 'uri', title: 'urlTitle' },
    },
    {
      title: t('code'),
      fixed: 'right',
      dataIndex: 'code',
    },

    {
      title: t('size'),
      dataIndex: 'size',
      width: 80,
      fixed: 'right',
      customRender: ({ text }) => {
        if (text == undefined) {
          return '';
        }
        return byteTransfer(text);
      },
    },
    {
      title: t('action'),
      fixed: 'right',
      slots: { customRender: 'action' },
    },
  ];
}
