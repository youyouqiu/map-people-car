import React, { useState, useEffect } from 'react';
import { Popconfirm, Switch } from 'antd';
import { getStore } from '@/framework/utils/localStorage';

interface IProps {
    value: number;
    record: any;
    onCheckChange: (checked: boolean, id: string) => void;
}

/**
 * 当前登录用户信息
 */
const loginUserInfo = getStore('loginUserInfo');

const WrapedPop = (props: IProps) => {
    const [status, setStatus] = useState(props.value);

    useEffect(() => {
        setStatus(props.value);
    }, [props.value]);
    // 企业用户禁用审核权限
    const switchDisabled = loginUserInfo && JSON.parse(loginUserInfo).user_type == 1 ? true : false;

    return (
        <>
            {!switchDisabled && <Popconfirm
                key={props.record.id}
                title={status == 1 ? '关闭后，该企业排班无需审核，确认是否关闭？' : '开启后，该企业排班需要审核，确认是否开启？'}
                onConfirm={() => {
                    const e: MouseEvent = document.createEvent('MouseEvents');
                    e.initEvent('click', true, true);
                    (document.getElementById(props.record.id) as HTMLDivElement).getElementsByTagName('button')[0].dispatchEvent(e);
                }}
                cancelText="取消"
                okText="确定"
            >
                <p
                    style={{
                        position: 'absolute',
                        width: '37px',
                        zIndex: 100,
                        height: '23px',
                        background: 'rgba(0, 0, 0, 0)',
                    }}
                ></p>
            </Popconfirm>
            }
            <p id={props.record.id}>
                <Switch
                    size="small"
                    disabled={switchDisabled}
                    checked={status == 1}
                    checkedChildren="开"
                    unCheckedChildren="关"
                    onChange={(checked) => {
                        props.onCheckChange(checked, props.record.id);
                        if (status == 1) {
                            setStatus(0);
                        } else {
                            setStatus(1);
                        }
                    }}
                />
            </p>
        </>
    );
};

export default WrapedPop;
