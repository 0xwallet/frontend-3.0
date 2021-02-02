import { defineComponent, CSSProperties, watch, nextTick } from 'vue';
import { fileListProps } from './props';
import { isFunction } from '/@/utils/is';
import './FileList.less';
import { useModalContext } from '/@/components/Modal/src/hooks/useModalContext';
import { Alert, Space } from 'ant-design-vue';
export default defineComponent({
  name: 'FileList',
  props: fileListProps,
  setup(props) {
    const modalFn = useModalContext();
    watch(
      () => props.dataSource,
      () => {
        nextTick(() => {
          modalFn?.redoModalHeight?.();
        });
      }
    );
    return () => {
      const { columns, actionColumn, dataSource } = props;
      const columnList = [...columns, actionColumn];
      return (
        <table class="file-table">
          <colgroup>
            {columnList.map((item) => {
              const { width = 0, dataIndex } = item;

              const style: CSSProperties = {
                width: `${width}px`,
                minWidth: `${width}px`,
              };

              return <col style={width ? style : {}} key={dataIndex} />;
            })}
          </colgroup>
          <thead>
            <tr class="file-table-tr">
              {columnList.map((item) => {
                const { title = '', align = 'center', dataIndex } = item;
                return (
                  <th class={['file-table-th', align]} key={dataIndex}>
                    <Space>
                      {title}
                      {dataIndex == 'name' ? (
                        <Alert
                          message="单个文件不超过20M"
                          type="info"
                          banner
                          class="upload-modal-toolbar__text"
                        ></Alert>
                      ) : (
                        ''
                      )}
                    </Space>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dataSource.map((record = {}, index) => {
              return (
                <tr class="file-table-tr" key={`${index + record.name || ''}`}>
                  {columnList.map((item) => {
                    const { dataIndex = '', customRender, align = 'center' } = item;
                    const render = customRender && isFunction(customRender);
                    return (
                      <td class={['file-table-td', align]} key={dataIndex}>
                        {render
                          ? customRender?.({ text: record[dataIndex], record })
                          : record[dataIndex]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    };
  },
});
