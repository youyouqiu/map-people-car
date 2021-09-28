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

            visible={popoverVisible}
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
                            showOk ?
                                <Button
                                    size="small"
                                    type='primary'
                                    onClick={onSubmit}
                                    style={{ marginRight: 8 }}
                                    data-type='1'
                                >
                                    通过
                                </Button>
                                : null
                        }
                        {
                            showOk ?
                                <Button
                                    id="no"
                                    size="small"
                                    type='primary'
                                    onClick={onSubmit}
                                    style={{ marginRight: 8 }}
                                    data-type='2'
                                >
                                    不通过
                                </Button>
                                : null
                        }
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
                                >
                                    {props.cancelText || '取消'}
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
