import React, { Component } from "react";
import styles from "./index.module.less";

interface IProps {
  /**
   * 子元素
   */
  children?: React.ReactNode;

}



/**
 * 抽屉右侧按钮容器，统一样式
 */
export default class OperatorContainer extends Component<IProps, any> {

  render() {
    const {
      children,
    } = this.props;

    return (
      <div className={`${styles["operator"]} drawer-right`}>
        {/* <div className={styles["operator-text"]}>操作</div> */}
        <div className={styles["operator-btns"]}>
          {children}
        </div>
      </div>
    )

  }
}
