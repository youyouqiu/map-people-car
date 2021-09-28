import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Popover } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

export interface IPopconfirmProps {
    title: React.ReactNode;
    showOk?: boolean;
    okText?: string;
    showCancel?: boolean;
    cancelText?: string;
    icon?: any;
    onConfirm?: Function;
    onCancel?: Function;
    onVisibleChange?: any;
    disabled?: boolean;
    children: ReactElement;
    getPopupContainer?: any
    visible?: boolean
}

export default function Popconfirm(props: IPopconfirmProps): ReactElement {

    const [showOk, setShowOk] = useState(true)
    const [showCancel, setShowCancel] = useState(true)
    const [popoverVisible, setPopoverVisible] = useState(false)

    useEffect(() => {
        if ('showOk' in props) {
            setShowOk(props.showOk!)
        }
        if ('showCancel' in props) {
            setShowCancel(props.showOk!)
        }
    }, [props])

    // 确认事件
    function onSubmit(e: any) {
        e.stopPropagation()
        if (props.onConfirm) {
            props.onConfirm(e)
        }
        setPopoverVisible(false)
    }

    if (props.disabled) {
        return props.children;
    }

    function stopBubble(e: React.MouseEvent) {
        e.stopPropagation();
    }

    return (
        <Popover
            title={null}
            trigger="click"
            visible={props.visible !== undefined ? props.visible : popoverVisible}
            getPopupContainer={props.getPopupContainer ? props.getPopupContainer : undefined}
            onVisibleChange={(type) => {
                setPopoverVisible(type)
                if (props.onVisibleChange) {
                    props.onVisibleChange(type)
                }
            }}

            content={
                <div onClick={stopBubble} style={{ minWidth: '200px' }}>
                    <div style={{ marginBottom: 10, position: 'relative' }}>
                        {
                            props.icon ||
                            <ExclamationCircleFilled style={{ color: '#faad14', position: 'absolute', top: 4 }} />
                        }
                        <div style={{ paddingLeft: 22, maxWidth: 200 }}>
                            {
                                props.title || '请传入title参数！'
                            }
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {
                            showCancel ?
                                <Button
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPopoverVisible(false);
                                        if (typeof props.onCancel === 'function') {
                                            props.onCancel(e);
                                        }
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    {props.cancelText || '取消'}
                                </Button>
                                : null
                        }
                        {
                            showOk ?
                                <Button
                                    size="small"
                                    type='primary'

                                    onClick={onSubmit}
                                >
                                    {props.okText || '确定'}
                                </Button>
                                : null
                        }

                    </div>
                </div>
            }
        >
            {
                props.children
            }
        </Popover>
    )
}
