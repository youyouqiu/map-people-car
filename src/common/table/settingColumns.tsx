import React, { useState } from "react";
import Button from "antd/es/button";
import Checkbox from "antd/es/checkbox";
import styles from "./index.module.less";
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
} from "@ant-design/icons";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

interface IProps {
    // 包含有所有columns信息的
    baseColumns: Record<string, any>[];
    selectColumns: Record<string, any>[];
    handleColumnsChange: Function;
    handleCancel: Function;
    // 文字更新触发
    handleTextChange?: Function;
}

declare function setTimeout(
    handler: (...args: any[]) => void,
    timeout: number
): number;

function SearchBar(props: IProps) {

    // 所有的选中, baseColumns顺序不会变 但是可能值会变
    const [columns, setColumns] = useState(props.baseColumns);
    // 控制是否checkbox全选,只负责样式控制
    const [indeterminate, setIndeterminate] = useState(false);
    // 控制是否checkbox全选
    const [checkAll, setCheckAll] = useState(true);
    // 控制选中的参数
    const [checkList, setCheckList] = useState<string[]>(
        props.baseColumns.map((item) => item.dataIndex)
    );
    // 控制选中的dataIndex
    const [selectItem, setSelectItem] = useState("");

    // 全部勾选事件
    function handleCheckAllChange(e: CheckboxChangeEvent) {
        const isAllChecked = e.target.checked;
        setIndeterminate(false);
        setCheckList(
            isAllChecked
                ? columns.map((item) => item.dataIndex)
                : columns.filter((item) => item.disabled).map((item) => item.dataIndex)
        );
        setCheckAll(isAllChecked);
    }

    // checkbox 勾选改变事件 
    function handleCheckChange(checkedList: string[]) {
        setCheckList(checkedList);
        setIndeterminate(
            !!checkedList.length && checkedList.length < columns.length
        );
        setCheckAll(checkedList.length === columns.length);
    }

    // 选中某一项
    function handleItemChange(item: Record<string, any>) {
        if (item.disabled) {
            return;
        }
        if (selectItem !== item.dataIndex) {
            setSelectItem(item.dataIndex);
        } else {
            setSelectItem("");
        }
    }

    // 辅助函数
    function swapArrayItem(array: any[], index1: number, index2: number) {
        const value = array[index1];
        array[index1] = array[index2];
        array[index2] = value;
        return array;
    }

    // 上移
    function handleUpClick() {
        if (!setSelectItem) {
            return;
        }
        const selectIndex = columns.findIndex((item) => {
            return item.dataIndex === selectItem;
        });
        // 第一行是操作栏 不能移到index为0的位置
        if (selectIndex !== -1 && selectIndex !== 1) {
            setColumns(swapArrayItem([...columns], selectIndex, selectIndex - 1));
        }
    }

    // 下移
    function handleDownClick() {
        if (!setSelectItem) {
            return;
        }
        const selectIndex = columns.findIndex((item) => {
            return item.dataIndex === selectItem;
        });
        // 第一行是操作栏 不能移动
        if (selectIndex > 0 && selectIndex !== columns.length - 1) {
            setColumns(swapArrayItem([...columns], selectIndex, selectIndex + 1));
        }
    }



    // 点击确定
    function handleConfirm() {
        if (props.handleColumnsChange) {
            props.handleColumnsChange(
                columns.filter((item) => checkList.includes(item.dataIndex))
            );
        }

    }

    // 重置
    function handleReset() {
        setCheckAll(true);
        setCheckList(props.baseColumns.map((item) => item.dataIndex));
        setColumns(props.baseColumns);
        setIndeterminate(false);
    }

    // 点击取消
    function handleCancel() {
        handleReset();
        if (props.handleCancel) {
            props.handleCancel()
        }
    }




    return (
        <div className={styles["setting-columns"]}>
            <div className={styles["setting-top"]}>
                <div>
                    <Checkbox
                        indeterminate={indeterminate}
                        onChange={handleCheckAllChange}
                        checked={checkAll}
                    >
                        全选
              </Checkbox>
                </div>
                <div
                    style={{ color: "#40a9ff", cursor: "pointer" }}
                    onClick={handleReset}
                >
                    重置
            </div>
            </div>
            <div className={styles["setting-content"]}>
                <div className={styles["setting-checkbox"]}>
                    <Checkbox.Group onChange={handleCheckChange} value={checkList}>
                        {columns.map((item) => {
                            return (
                                <div key={item.dataIndex}
                                    style={
                                        selectItem === item.dataIndex
                                            ? { backgroundColor: "#eee" }
                                            : {}
                                    }>
                                    <Checkbox
                                        value={item.dataIndex}
                                        disabled={item.disabled ? true : false}
                                        style={{ width: '25px' }}
                                    >

                                    </Checkbox>
                                    <span
                                        onClick={() => handleItemChange(item)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                            );
                        })}
                    </Checkbox.Group>
                </div>
                <div>
                    <div
                        className={styles["icon-wrap"]}
                        style={{ marginBottom: 20 }}
                        onClick={handleUpClick}
                    >
                        <ArrowUpOutlined className={styles["icon"]} />
                    </div>
                    <div className={styles["icon-wrap"]} onClick={handleDownClick}>
                        <ArrowDownOutlined className={styles["icon"]} />
                    </div>
                </div>
            </div>
            <div className={styles["setting-foot"]}>
                <Button
                    size="small" onClick={handleCancel}
                    style={{ marginRight: 15 }}
                >
                    取消
                </Button>
                <Button
                    onClick={handleConfirm}
                    size="small"
                    type="primary"
                >
                    确定
            </Button>
            </div>
        </div>
    );
}

export default SearchBar;
