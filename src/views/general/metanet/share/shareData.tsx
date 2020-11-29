import { BasicColumn } from '/@/components/Table';
import { byteTransfer } from '/@/utils/disk/file';
import GIcon from '/@/components/Icon';
export function getBasicColumns(): BasicColumn[] {
  return [
    {
      title: '文件',
      dataIndex: 'name',
      width: 400,
      align: 'left',
      // slots: { customRender: 'name' },
      customRender: ({ record }) => {
        if (record.name === 'deleted') {
          return (
            <span>
              <GIcon icon="bx-bx-question-mark" size="30" />
              分享文件已删除
            </span>
          );
        }
        return (
          <span>
            <GIcon
              icon={record.type === 'folder' ? 'bx-bx-folder' : 'bx-bxs-file-' + record.type}
              size="30"
            ></GIcon>
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
          <span>
            {text.slice(0, 2)}
            {list.map((value) => (
              <span style={'background-color:#' + value}>&nbsp;&nbsp;&nbsp;</span>
            ))}
            {text.slice(text.length - 2, text.length)}
          </span>
        );
      },
    },
    {
      // title: '网址',
      dataIndex: 'uri',
      width: 300,
      slots: { customRender: 'uri', title: 'urltitle' },
    },
    {
      title: 'code',
      fixed: 'right',
      dataIndex: 'code',
    },

    {
      title: '大小',
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
      title: '操作',
      fixed: 'right',
      slots: { customRender: 'action' },
    },
  ];
}
