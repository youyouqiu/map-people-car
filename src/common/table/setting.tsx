import React, { useEffect, useState } from 'react';
import { Popover, } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { MyColumns } from './index2';
import styles from './index.module.less'
import SettingColumns from './settingColumns'
export interface ITableSettingProps<T> {
    columns: MyColumns<T>[];
}

export default function Setting(props: any) {

    const [visible, setVisible] = useState<boolean>(false)
    const [columnsDom, setColumnsDom] = useState<Array<any>>([])

    useEffect(() => {
        const boxs = props.columns.map((item: any) => {
            return {
                title: item.title,
                dataIndex: item.dataIndex,
                disabled: !item.dataIndex
            }
        })

        setColumnsDom(boxs)
    }, [props.columns])

    return (
        <Popover
            title={null}
            trigger="click"
            placement="bottomRight"
            visible={visible}
            onVisibleChange={setVisible}
            content={
                <div className={styles["concrete-popconfirm"]}>
                    <SettingColumns
                        baseColumns={columnsDom}
                        selectColumns={[]}
                        handleCancel={() => {
                            setVisible(false)
                        }}
                        handleColumnsChange={(checkout: any) => {
                            setVisible(false)
                            if (props.onChange) {
                                props.onChange(checkout.filter((a: any) => !!a.dataIndex).map((b: any) => b.dataIndex))
                            }
                        }}
                    />
                </div>
            }
        >
            <SettingOutlined />
        </Popover>
    )
}