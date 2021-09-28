import React, { Component } from 'react';
import { Form, Input, Empty } from 'antd';
import { IProps, DataItem } from "./type";
import { setFirstErrIsBottom } from '@/framework/utils/function';
import styles from './index.module.less';

/** 数据源格式示例 */
// const dataSource = [{
//   name: '姓名',
//   key: 'name',
//   validate: {
//     rules: [{
//       required: true,
//       message: '请输入',
//     }, {
//       pattern: new RegExp(/^[0-9]{0,3}$/),
//       message: '范围为1-999的整数',
//     }]
//   },
//   inputProps:{
//      maxLength:30,
//   }
//   component:<Select />,
//   colspan:4,
// }];

class TableForm extends Component<IProps, any, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      FirstTrErrBottomId: 'FirstTr' + new Date().getTime()
    }
  }
  componentDidMount() {
    setFirstErrIsBottom(this.state.FirstTrErrBottomId, 'formItem-bottom-explain')
  }


  /**
   * 获取字段将要渲染的组件
   * @param item 该字段相关信息
   */
  getComponent = (item: DataItem) => {
    const { type } = this.props;
    const { name, inputProps, component, renderData } = item;
    if (component) {
      if (typeof component === 'function') {
        return component(renderData);
      } else {
        return component;
      }
    } else {
      if (type === 'detail') {
        return <Input
          type="text"
          allowClear
          {...inputProps}
          readOnly
        />
      }
      const placeholder = (name && typeof name === 'string') ? `请输入${name}` : '';
      return <Input
        type="text"
        placeholder={placeholder}
        autoComplete='off'
        allowClear
        {...inputProps}
      />
    }
  }


  /**
   * 组装表单显示
   * 当colLen等于每列显示column数时,组装tr数据
   */
  renderForm = () => {
    const { dataSource, column = 2, header, className } = this.props;
    const { FirstTrErrBottomId } = this.state;
    if (!dataSource || dataSource.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    let trResult: any = [];
    let colLen = 0;
    const allTr: any = [];
    dataSource.map((item, index) => {
      const { name, key, validate, colWidth, nameWidth, formClassName } = item;
      let { colSpan = (name ? 1 : 2) } = item;
      colLen += colSpan + (name ? 1 : 0);
      // let fillTd = null;// 最后一行未占满,补位的td
      if (index === dataSource.length - 1 && colLen !== column) {
        colSpan = column - colLen + colSpan;
        // if (colSpan !== column - colLen + colSpan) {
        //     fillTd = React.createElement('td', {
        //         colSpan: column - colLen,
        //     }, '');
        // }
        colLen = column;
      }
      let nameTh = null;
      if (name) {
        let required = false;
        if (validate) {
          validate.rules.map((item) => {
            if (item.required) {
              required = true;
            }
          })
        }
        // 字段必填图标
        const icon = React.createElement('span', {
          className: styles.redIcon,
          key: `${key}_${index}_icon`,
        }, '*');
        nameTh = React.createElement('th', {
          key: `${key}_${index}_th`,
          style: { width: nameWidth ? `${nameWidth}px` : '100px' }
        }, required ? icon : null, typeof name == 'function' ? name() : name);
      }

      let tdWidth = (colSpan === column || colLen === column) ? undefined : colSpan * 160;
      if (colWidth) tdWidth = colWidth;
      // console.log(index)
      const tdHtml = React.createElement('td', {
        key: `${key}_${index}_td`,
        colSpan: colSpan,
        style: tdWidth ? { width: `${colWidth ? colWidth : colSpan * 160}px` } : undefined
      }, <Form.Item
        name={key}
        className={formClassName || ''}
        validateFirst
        {...validate}
      >
        {this.getComponent(item)}
      </Form.Item>
      );

      if (colLen <= column) {
        trResult.push(nameTh, tdHtml);
      }
      const firstTrId = allTr.length === 0 ? FirstTrErrBottomId : '';
      if (colSpan === column) {
        colLen = 0;
        const trHtml = React.createElement('tr', {
          key: `${key}_${index}_tr`,
          id: firstTrId
        }, nameTh, tdHtml);
        allTr.push(trHtml);
      } else if (colLen === column) {
        const trHtml = React.createElement('tr', {
          key: `${key}_${index}_tr`,
          id: firstTrId
        }, trResult);
        allTr.push(trHtml);
        colLen = 0;
        trResult = [];
      }
    })

    // 表单标题
    let tableTitle = null;
    if (header) {
      tableTitle = React.createElement('tr', null, React.createElement('th', {
        colSpan: column,
        className: styles.tableHeader
      }, header));
    }

    return React.createElement('table', {
      className: [styles.itemTable, className ? className : ''].join(' '),
    }, React.createElement('tbody', null, tableTitle, allTr));
  }

  render() {
    const { type } = this.props;

    return <div className={type ? styles.detailBox : ''} id='common-tableForm-box'   >
      {
        this.renderForm()
      }
    </div>
  }
}

export default TableForm;