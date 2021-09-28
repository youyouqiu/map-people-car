import React, { Component } from "react";
import { Drawer, Button } from "antd";
import { injectIntl } from 'react-intl';

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
   * 多语言
   */
  intl: any;
  /**
   * 抽屉最外层容器样式
   */
  style?: React.CSSProperties;
}



/**
 * 详情抽屉
 */
class DetailDrawer extends Component<IProps, any> {
  constructor(props: IProps) {
    super(props);

  }

  componentWillUnmount() {
    window.removeEventListener('click', this.windowClick);
  }

  windowClick = () => {
    window.addEventListener('remove', this.windowClick);
    document.querySelector('.ant-tr-active')?.classList.remove('ant-tr-active');
    this.handleClose();
  }

  afterVisibleChange = (visible: boolean) => {
    if (visible) {
      window.addEventListener('click', this.windowClick)
    }

  }

  handleClose = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      document.querySelector('.ant-tr-active')?.classList.remove('ant-tr-active');
      onClose();
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
      style
    } = this.props;
    const headerHeight = document.fullscreenElement ? 0 : 60;
    // console.log('fullscreen:', document.fullscreenElement, headerHeight);

    return (
      <div onClick={this.stopPropagation}>
        <Drawer
          title={title}
          width={width}
          mask={false}
          getContainer={false}
          visible={visible}
          drawerStyle={{ height: `calc(100% - ${headerHeight}px)` }}
          style={{ paddingTop: headerHeight, ...style }}
          bodyStyle={{ padding: 0 }}
          onClose={this.handleClose}
          afterVisibleChange={this.afterVisibleChange}
          footer={
            <div
              style={{
                textAlign: 'left',
              }}
            >
              <Button style={{ marginRight: 8 }} onClick={this.handleClose}>
                {messages.close_text}
              </Button>
            </div>
          }
        >
          {children}
        </Drawer>
      </div>
    )

  }
}


export default injectIntl(DetailDrawer)