import React, { Component } from 'react';
import { Form, Input } from 'antd';
import { IProps, DataItem } from "./type";

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
            return <Input
                type="text"
                placeholder={`${name ? `请输入${name}` : ''}`}
                autoComplete='off'
                allowClear
                {...inputProps}
                readOnly={type === 'detail' ? true : false}
            />
        }
    }


    /**
     * 组装表单显示
     * 当colLen等于每列显示column数时,组装tr数据
     */
    renderForm = () => {
        const { dataSource, column = 2, header } = this.props;
        let trResult: any = [];
        let colLen = 0;
        const allTr: any = [];
        dataSource.map((item, index) => {
            const { name, key, validate } = item;
            let { colSpan = (name ? 1 : 2) } = item;
            colLen += colSpan + (name ? 1 : 0);
            if (index === dataSource.length - 1 && colLen !== column) {
                colSpan = column - colLen + colSpan;
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
                }, '*');
                nameTh = React.createElement('th', {
                    key: `${key}_${index}_th`,
                }, required ? icon : null, name);
            }
            const tdHtml = React.createElement('td', {
                key: `${key}_${index}_td`,
                colSpan: colSpan
            }, <Form.Item
                label=''
                name={key}
                {...validate}
            >
                {this.getComponent(item)}
            </Form.Item>
            );
            if (colLen <= column) {
                trResult.push(nameTh, tdHtml);
            }
            if (colSpan === column) {
                colLen = 0;
                const trHtml = React.createElement('tr', { key: `${key}_${index}_tr}` }, nameTh, tdHtml);
                allTr.push(trHtml);
            } else if (colLen === column) {
                const trHtml = React.createElement('tr', { key: `${key}_${index}_tr}` }, trResult);
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
            className: styles.itemTable
        }, React.createElement('tbody', null, tableTitle, allTr));
    }

    render() {
        const { type } = this.props;
        return <div className={type ? styles.detailBox : ''}>
            {
                this.renderForm()
            }
        </div>
    }
}

export default TableForm;