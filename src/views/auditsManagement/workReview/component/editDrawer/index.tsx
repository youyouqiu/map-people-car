/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from "react";
import { Drawer, Button } from "antd";
import { injectIntl } from 'react-intl';
import styles from './index.module.less'

interface IProps {
  /**
   * 标题
   */
  title: string;
  /**
   * 宽度
   */
  width: number;

  /**
   * 是否可见，等同于是否渲染
   */
  visible: boolean;
  /**
   * 子元素
   */
  children?: React.ReactNode;
  /**
   * 抽屉关闭事件
   */
  onClose?: Function;
  /**
   * 抽屉打开事件
   */
  onShow?: Function;
  /**
   * 点击确认事件
   */
  onConfirm?: Function;
  /**
   * 多语言
   */
  intl: any;
  /**
   * 如果是从详情抽屉打开，设置为 'body'
   */
  getContainer?: HTMLElement | (() => HTMLElement) | string | false;
  /**
   * 提交时获取通过或不通过 
   */
  onGetReviewStatus?: any
}

interface IState {
  confirmLoadingSuccess: boolean;
  confirmLoadingError: boolean
}

/**
 * 新增或者修改抽屉
 */
class EditDrawer extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      confirmLoadingSuccess: false,
      confirmLoadingError: false,
    }
  }

  handleClose = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  handleConfirm = async (e: any) => {
    const dom = e.currentTarget
    const type = dom.getAttribute('data-type');
    this.props.onGetReviewStatus(type);
    const { onConfirm } = this.props;

    if (type == 1) {
      this.setState({
        confirmLoadingSuccess: true,
      }, async () => {
        if (typeof onConfirm === 'function') {
          await onConfirm();
        }
        this.setState({
          confirmLoadingSuccess: false
        })
      })
    } else {
      this.setState({
        confirmLoadingError: true,
      }, async () => {
        if (typeof onConfirm === 'function') {
          await onConfirm();
        }
        this.setState({
          confirmLoadingError: false
        })
      })
    }



  }



  stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  render() {
    const {
      title,
      width,
      children,
      intl: { messages },
      visible,
      getContainer,
      onConfirm
    } = this.props;

    const { confirmLoadingSuccess, confirmLoadingError } = this.state;
    const headerHeight = document.fullscreenElement ? 0 : 60;

    const getContainerValue = getContainer || false;
    return (
      <Drawer
        title={title}
        width={width}
        getContainer={getContainerValue}
        visible={visible}
        className={styles.fix}
        drawerStyle={{ height: `calc(100% - ${headerHeight}px)` }}
        style={{ paddingTop: headerHeight }}
        // bodyStyle={{ padding: 0 }}
        zIndex={1000}
        onClose={this.handleClose}
        footer={
          <div>
            <Button
              style={{ marginRight: 8 }}
              onClick={this.handleClose}
            >
              {messages.cancel_text}
            </Button>
            {onConfirm ? <Button
              type="primary"
              loading={confirmLoadingSuccess}
              onClick={this.handleConfirm}
              data-type='1'
            >
              通过
                        </Button>
              : null
            }
            {onConfirm ? <Button
              type="primary"
              loading={confirmLoadingError}
              onClick={this.handleConfirm}
              style={{ marginLeft: 8 }}
              data-type='2'
            >
              不通过
                        </Button>
              : null
            }
          </div>
        }
      >
        {children}
      </Drawer>
    )

  }
}


export default injectIntl(EditDrawer)