import React, { Component } from 'react';
import { Drawer, Button } from 'antd';
import { injectIntl } from 'react-intl';
import { antiShakeFun } from '@/framework/utils/utils';

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
   * 关闭后销毁组件 默认false
   */
  destroyOnClose?: boolean;
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
}

interface IState {
}

/**
 * 新增或者修改抽屉
 */
let confirmLoading = false;
class EditDrawer extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  handleClose = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      document.querySelector('.ant-tr-active')?.classList.remove('ant-tr-active');
      onClose();
    }
  };

  handleConfirm = async () => {
    const { onConfirm } = this.props;
    if (confirmLoading) return;
    if (typeof onConfirm === 'function') {
      confirmLoading = true;
      await onConfirm();
      confirmLoading = false;
    }
  };

  stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  render() {
    const {
      title,
      width,
      children,
      intl: { messages },
      visible,
      getContainer,
      onConfirm,
    } = this.props;
    const headerHeight = document.fullscreenElement ? 0 : 60;

    const getContainerValue = getContainer || false;
    return (
      <Drawer
        title={title}
        width={width}
        getContainer={getContainerValue}
        visible={visible}
        drawerStyle={{ height: `calc(100% - ${headerHeight}px)` }}
        style={{ paddingTop: headerHeight }}
        // bodyStyle={{ padding: 0 }}
        zIndex={1000}
        onClose={this.handleClose}
        destroyOnClose={true}
        // destroyOnClose={this.props.destroyOnClose}
        // afterVisibleChange={(visible: boolean) => {
        //     if (visible && this.props.onShow) {
        //         this.props.onShow();
        //     }
        // }}
        footer={
          <div>
            <Button style={{ marginRight: 8 }} onClick={this.handleClose}>
              {messages.cancel_text}
            </Button>
            {onConfirm ? (
              <Button type="primary" loading={confirmLoading} onClick={antiShakeFun(this.handleConfirm, 2000)}>
                {messages.confirm_text}
              </Button>
            ) : null}
          </div>
        }
      >
        {children}
      </Drawer>
    );
  }
}

export default injectIntl(EditDrawer);
