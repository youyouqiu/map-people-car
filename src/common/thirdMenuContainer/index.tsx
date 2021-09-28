import React, { ReactNode, CSSProperties, useState } from "react";
import { SyncOutlined } from '@ant-design/icons';
import {
    useParams, useHistory
} from "react-router-dom";
import Tabs from "antd/es/tabs";
import styles from "./index.module.less";
import Fullscreen from "./fullscreen";
import { setStore } from "@/framework/utils/localStorage";

export interface IThirdMenuContainerProps {
    children: ReactNode | ReactNode[];
    containerStyle?: CSSProperties;
    style?: CSSProperties;
    tabBarStyle?: CSSProperties;
    contentFullHeight?: boolean;
}

interface IParam {
    param2: string;
    param3: string;
}

/**
 * 三级菜单容器
 * @param props 需要渲染的子Tab
 */
let refreshChildKeys: any = {};// 刷新的子节点 keys 
export default function ThirdMenuContainer(props: IThirdMenuContainerProps) {

    const history = useHistory();
    const params = useParams<IParam>();
    const [currentRefresh, setCurrentRefresh] = useState({ key: '', value: '' })
    let currentChild: any = {};

    const { children, style, tabBarStyle, contentFullHeight, containerStyle } = props;
    const param = params.param3;
    let className = styles['third-menu-container'];
    if (contentFullHeight) {
        className += ' ' + styles['full-height'];
    }
    setStore(`/view/${params.param2}`, `/view/${params.param2}/${params.param3}`)

    //刷新-每次刷新一个随机key，并更新到当前打开的页面组件。
    const refresh = () => {
        setCurrentRefresh({
            key: currentChild.key,
            value: Math.random() * 10 + ''
        })
    }
    const renderChild = () => {
        let childrenArr: any = Array.isArray(children) ? children : [children];// 只取第一个子元素 

        return childrenArr.map((node: any) => {
            if (typeof node === 'object') {
                // 获取当前选中的节点
                if (node.key === param) {
                    // setCurrentChild(node)
                    currentChild = node;
                }
                // 如果节点等于需要刷新的节点， 就存起来 
                if (node.key === currentRefresh.key) {
                    refreshChildKeys[node.key] = currentRefresh.value;
                }
                const childProps = node.props;
                let childOfChild = <div></div>;//默认空div
                if (childProps && childProps.children) {
                    // 修改 节点的子节点key=刷新生成的随机key
                    childOfChild = React.cloneElement(childProps.children, {
                        key: refreshChildKeys[node.key] ? refreshChildKeys[node.key] : ''
                    });
                }
                const newNode = React.cloneElement(node, {
                }, childOfChild)
                // console.log(node, refreshChildKeys)
                return newNode

            }
        })
    }


    return (
        <div className={styles['container']} style={containerStyle}>
            {/* <div><button onClick={() => refresh()} >刷新</button></div> */}
            <Tabs
                className={className}
                style={style}
                activeKey={param}
                // key={currentRefresh}
                tabBarStyle={tabBarStyle}
                onChange={(key: string) => {
                    console.log(key, param)
                    history.push(`/view/${params.param2}/${key}`);
                }}
            >
                {/* {children} */}
                {renderChild()}
            </Tabs>
            <SyncOutlined className={styles['refreshBtn']} onClick={() => refresh()} />
            <Fullscreen />
        </div>
    )
}


