/**
 * 带搜索功能的下拉选组件
 */
import React, { Component } from 'react';
import { Input } from 'antd';
import Form from "antd/es/form";
import {
    DownOutlined
} from '@ant-design/icons';

import styles from './index.module.less';

interface IProps {
    /**
     * 下拉框显示数据
     */
    menuData: Array<any>;
    /**
    * 唯一标识,默认为id
    */
    uniqueKey?: string;
    /**
     * 下拉框显示项字段
     */
    titleKey: string;
    /**
     * 下拉框选项点击事件
     */
    optionClick?: Function;
    /**
     * 输入框相关prop配置
     */
    inputProps?: object;
    /**
    * 表单ref
    */
    formRef?: any;
    itemName?: string;
    /**
     * 联动字段,主要用于存放选中项id
     */
    linkageField?: string;
    itemRules?: Array<object>;
}

interface IState {
    menuStatus: any;
    inputValue: string;
    selectedKeys: { id: string } | null;
}

class SearchSelect extends Component<IProps, IState, any> {
    menuRef: any = React.createRef();
    constructor(props: IProps) {
        super(props);
        this.state = {
            menuStatus: false,// 下拉选项显示隐藏
            inputValue: '',// 输入框值
            selectedKeys: null,// 当前选中项
        };

    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { formRef, itemName, linkageField } = nextProps;
        if (formRef && itemName && linkageField) {
            const id = formRef.current.getFieldValue(linkageField);
            const newValue = formRef.current.getFieldValue(itemName);
            const { inputValue } = this.state;
            if (inputValue !== newValue) {
                this.setState({
                    selectedKeys: id ? { id } : null,
                    inputValue: newValue,
                })
            }
        }
    }

    inputChange = (e: any) => {
        const { value } = e.target;
        this.setState({
            selectedKeys: null,
            inputValue: value
        })
        const { formRef, linkageField, optionClick } = this.props;
        if (formRef && linkageField) {
            const obj: any = {};
            obj[linkageField] = '';
            formRef.current.setFieldsValue(obj);
        }
        if (typeof optionClick === 'function') {
            optionClick(null);
        }
    }

    /**
    * 渲染下拉显示项内容
    * */
    renderMenu = () => {
        const { menuData, titleKey, uniqueKey } = this.props;
        const { menuStatus, inputValue, selectedKeys } = this.state;
        const data = inputValue ? this.getRenderMenuData() : menuData;
        if (!data || data.length === 0) return null;
        let showStyle = {};
        if (menuStatus) {
            const top = this.menuRef.current.getBoundingClientRect().top;
            const left = this.menuRef.current.getBoundingClientRect().left;
            const width = this.menuRef.current.getBoundingClientRect().width;
            showStyle = {
                top: `${top + 35}px`,
                left: `${left}px`,
                width: `${width}px`,
            };
        }
        return <ul style={showStyle} className={[styles.menuList, menuStatus ? styles.menuShow : ''].join(' ')}>
            {data.map((item: any) => {
                const text = item[titleKey];
                const unique = uniqueKey ? uniqueKey : 'id';
                const isActive = selectedKeys ? (selectedKeys as any)[unique] === item[unique] : false;
                return (
                    <li
                        className={isActive ? styles.itemActive : ''}
                        key={item[unique]}
                        onClick={() => { this.itemClick(item) }}
                    >
                        {text}
                    </li>
                );
            })}
        </ul>
    }
    getRenderMenuData = () => {
        const { menuData, titleKey } = this.props;
        const { inputValue } = this.state;
        const result: any = [];
        if (!menuData) return [];
        menuData.map((item: any) => {
            const text = item[titleKey];
            if (text.indexOf(inputValue) > -1) {
                result.push(item);
            }
        })
        return result;
    }
    /**
     * 下拉项点击
     * @param item 点击项信息
     * */
    itemClick = (item: { id: string }) => {
        const { titleKey, formRef, itemName, linkageField, optionClick } = this.props;
        this.setState({
            inputValue: (item as any)[titleKey],
            selectedKeys: item
        });
        if (formRef && itemName) {
            const obj: any = {};
            obj[itemName] = (item as any)[titleKey];
            if (linkageField) {
                obj[linkageField] = item.id;
            }
            formRef.current.setFieldsValue(obj);
        }
        if (typeof optionClick === 'function') {
            optionClick(item);
        }
    }

    /**
    * 下拉列表显示隐藏控制
    * @param status
    * */
    changeMenuVisible = (status: boolean) => {
        const { inputProps } = this.props;
        const { readOnly, disabled } = inputProps as any;
        if (readOnly || disabled) return;
        this.setState({
            menuStatus: status
        })
    }

    render() {
        const { itemName, formRef, itemRules, inputProps } = this.props;
        const { inputValue, menuStatus, selectedKeys } = this.state;
        let itemValue = '';
        if (formRef && formRef.current) {
            itemValue = formRef.current.getFieldValue(itemName);
        }

        return (
            <div className={styles.selectWrapper} >
                <div
                    ref={this.menuRef}
                    className={(selectedKeys || !inputValue) ? styles.searchBox : `${styles.searchBox} ${styles.notHasInfo}`}
                    onClick={() => this.changeMenuVisible(true)}>
                    {
                        itemName
                            ? <Form.Item
                                name={itemName ? itemName : ''}
                                rules={itemRules ? itemRules : []}
                            >
                                <Input
                                    type="text"
                                    allowClear
                                    value={inputValue}
                                    onChange={this.inputChange}
                                    onBlur={() => {
                                        setTimeout(() => {
                                            this.changeMenuVisible(false)
                                        }, 200);
                                    }}
                                    className={styles.searchInput}
                                    {...inputProps}
                                    autoComplete='off'
                                />
                            </Form.Item>
                            : <Input
                                type="text"
                                allowClear
                                value={inputValue}
                                onChange={this.inputChange}
                                onBlur={() => {
                                    setTimeout(() => {
                                        this.changeMenuVisible(false)
                                    }, 200);
                                }}
                                className={styles.searchInput}
                                {...inputProps}
                                autoComplete='off'
                            />
                    }
                    <span className={(inputValue || itemValue) ? `${styles.searchIcon} ${styles.searchHide}` : styles.searchIcon}>
                        <DownOutlined className={menuStatus ? styles.downArrow : ''} />
                    </span>
                </div>
                {this.renderMenu()}
            </div>
        );
    }
}

export default SearchSelect;