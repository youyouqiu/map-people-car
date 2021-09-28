import React, { ReactNode, CSSProperties } from "react";
import {
  useParams,
} from "react-router-dom";
import { Tabs } from 'antd';
import styles from "./index.module.less";

export interface IFourthMenuContainerProps {
  children: ReactNode | ReactNode[];
  containerStyle?: CSSProperties;
  style?: CSSProperties;
  tabBarStyle?: CSSProperties;
  /**
   * 内容区域100%高度
   */
  contentFullHeight?: boolean;
}

interface IParam {
  param4: string;
}

/**
 * 三级菜单容器
 * @param props 需要渲染的子Tab
 */
function FourthMenuContainer(props: IFourthMenuContainerProps) {
  const params = useParams<IParam>();

  const { children, style, tabBarStyle, contentFullHeight, containerStyle } = props;
  const param = params.param4;
  let className = styles['fourth-menu-container'];
  if (contentFullHeight) {
    className += ' ' + styles['full-height'];
  }
  return (
    <div className={`${styles['container']} fourth-menu-container`} style={containerStyle}>
      <Tabs
        className={className}
        style={style}
        defaultActiveKey={param}
        tabBarStyle={tabBarStyle}
      >
        {children}
      </Tabs>
    </div >
  )
}


export default FourthMenuContainer;