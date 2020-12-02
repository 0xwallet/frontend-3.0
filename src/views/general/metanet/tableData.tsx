import { FormProps, FormSchema } from '/@/components/Table';
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
      title: '文件名',
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
      title: '操作',
      fixed: 'right',
      width: 300,
      slots: { customRender: 'action' },
    },
    {
      title: '大小',
      dataIndex: 'size',
      fixed: 'right',
      width: 100,
      customRender: ({ text }) => {
        return byteTransfer(text);
      },
    },
    {
      title: '时间',
      width: 150,
      dataIndex: 'createAt',
      fixed: 'right',
    },
  ];
}

export function getBasicShortColumns(): BasicColumn[] {
  return [
    {
      title: 'ID',
      width: 150,
      dataIndex: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '编号',
      dataIndex: 'no',
      width: 80,
    },
  ];
}

export const getAdvanceSchema = (itemNumber = 6): FormSchema[] => {
  const arr: any = [];
  for (let index = 0; index < itemNumber; index++) {
    arr.push({
      field: `field${index}`,
      label: `字段${index}`,
      component: 'Input',
      colProps: {
        xl: 12,
        xxl: 8,
      },
    });
  }
  return arr;
};
export function getFormConfig(): Partial<FormProps> {
  return {
    labelWidth: 100,
    schemas: [
      ...getAdvanceSchema(5),
      {
        field: `field11`,
        label: `字段33`,
        component: 'Select',
        defaultValue: '1',
        componentProps: {
          options: [
            {
              label: '选项1',
              value: '1',
            },
            {
              label: '选项2',
              value: '2',
            },
          ],
        },
        colProps: {
          xl: 12,
          xxl: 8,
        },
      },
    ],
  };
}
