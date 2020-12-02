import { BasicColumn } from '/@/components/Table/src/types/table';
import { byteTransfer } from '/@/utils/disk/file';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { unref } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { Tooltip } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
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
          </Tooltip>
        );
      },
    },
    {
      title: t('action'),
      fixed: 'right',
      width: 300,
      slots: { customRender: 'action' },
    },
    {
      title: t('size'),
      dataIndex: 'size',
      fixed: 'right',
      width: 100,
      customRender: ({ text }) => {
        return byteTransfer(text);
      },
    },
    {
      title: t('time'),
      width: 150,
      dataIndex: 'updatedAt',
      fixed: 'right',
    },
  ];
}
