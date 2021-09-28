import React, { useState, useRef, useEffect } from "react";
import Input from "antd/es/input";
import Button from "antd/es/button";
import Checkbox from "antd/es/checkbox";
import styles from "./index.module.less";
import {
  SyncOutlined,
  SettingOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import event from "@/framework/utils/event";

interface IProps {
  // 包含有所有columns信息的
  baseColumns: Record<string, any>[];
  selectColumns: Record<string, any>[];
  handleColumnsChange: Function;
  // 文字的占位
  placeholder: string;
  // 模块名称用于事件监听
  moduleName: string;
  // 点击刷新按钮触发
  handleReset?: Function;
  // 文字更新触发
  handleTextChange?: Function;
}

declare function setTimeout(
  handler: (...args: any[]) => void,
  timeout: number
): number;

function SearchBar(props: IProps) {
  // 控制显示setting
  const [showSetting, setShowSetting] = useState(false);
  // 所有的选中, baseColumns顺序不会变 但是可能值会变
  const [columns, setColumns] = useState(props.baseColumns);
  // 控制是否checkbox全选,只负责样式控制
  const [indeterminate, setIndeterminate] = useState(false);
  // 控制是否checkbox全选
  const [checkAll, setCheckAll] = useState(true);
  // 控制Input值全选
  const [inputValue, setInputValue] = useState("");
  // 控制选中的参数
  const [checkList, setCheckList] = useState<string[]>(
    props.baseColumns.map((item) => item.dataIndex)
  );
  // 控制选中的dataIndex
  const [selectItem, setSelectItem] = useState("");

  const timer = useRef<number>(0);

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
    if (selectIndex !== -1 && selectIndex !== columns.length - 1) {
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
    setShowSetting(false);
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
    setShowSetting(false);
  }


  function handleHideSetting() {
    // 设置个延迟时间进行隐藏
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      setShowSetting(false);
    }, 500);
  }

  function handleJudgeShowSetting() {
    // 防止隐藏时移入会显示
    if (timer.current) {
      clearTimeout(timer.current);
    }
    if (showSetting === false) {
      return;
    }
  }
  

  // 点击文字搜索时触发给外部组件
  function handleSearch(value: string) {
    if (props.handleTextChange) {
      props.handleTextChange(value);
    }
  }

  // 点击重置icon触发外部组件传递的函数
  function handleResetFilter() {
    event.emit(props.moduleName);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  // 事件监听清空筛选项
  useEffect(() => {
    // 清空table和搜索栏的筛选项
    function resetAllFilterAndOrder() {
      setInputValue("");
    }
    event.on(props.moduleName, resetAllFilterAndOrder);
    return () => {
      event.remove(props.moduleName, resetAllFilterAndOrder);
    };
  }, [props.moduleName]);

  return (
    <div className={styles["search-out"]}>
      <Input.Search
        placeholder={props.placeholder}
        value={inputValue}
        onSearch={handleSearch}
        onChange={handleInputChange}
        style={{ width: 300, marginRight: 15 }}
      />
      <SyncOutlined
        style={{ marginRight: 15, cursor: "pointer" }}
        onClick={handleResetFilter}
      />
      <div className={styles["setting"]}>
        <SettingOutlined
          style={{ marginRight: 15, cursor: "pointer" }}
        // onMouseEnter={handleShowSetting}
        // onMouseLeave={handleHideSetting}
        />
        <div
          className={styles["setting-wrap"]}
          style={{
            opacity: showSetting ? "1" : "0",
            zIndex: showSetting ? 1000 : -1,
          }}
          // style={{ visibility: showSetting ? "visible" : "hidden" }}
          onMouseEnter={handleJudgeShowSetting}
          onMouseLeave={handleHideSetting}
        >
          <div className={styles["triangle"]}>
            <div className={styles["triangle-p"]}>
              <div className={styles["triangle-s"]}></div>
            </div>
          </div>
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
                    <div key={item.dataIndex}>
                      <Checkbox
                        value={item.dataIndex}
                        onChange={() => handleItemChange(item)}
                        disabled={item.disabled ? true : false}
                        style={
                          selectItem === item.dataIndex
                            ? { backgroundColor: "#eee" }
                            : {}
                        }
                      >
                        {item.title}
                      </Checkbox>
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
              onClick={handleConfirm}
              size="small"
              type="primary"
              style={{ marginRight: 15 }}
            >
              确定
            </Button>
            <Button size="small" onClick={handleCancel}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

SearchBar.defaultProps = {
  placeholder: "请输入出车单号/车号/车牌号",
  moduleName: "UNTRACT_EVENT",
};

export default SearchBar;
