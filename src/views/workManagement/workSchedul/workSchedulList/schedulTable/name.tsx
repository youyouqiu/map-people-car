import React from 'react';
import { Popconfirm } from '@/common';
import copyIcon from '@/static/image/copy.png';
import clearIcon from '@/static/image/saoba.png';
import closeIcon from '@/static/image/close.png';
import styles from './name.module.less';

interface IName {
    children: React.ReactNode;
    item: any;
    copy: Function;
    clean: Function;
    id: number;
    deleteObject: Function;
    isLeader?: boolean; //是否管理组长
    isMobileGroup: boolean; //是否机动组
    index: number;
}
const Name = (props: IName) => {
    const { children, item, copy, clean, id, deleteObject, index, isMobileGroup, isLeader = false } = props;
    const isSchedulNull = item.schedul?.every((item: []) => {
        return item.length == 0;
    });

    return React.createElement(
        'td',
        {
            className: styles.box,
            haschild: 1,
            key: id ? id : Math.random(),
        },
        // id,
        children,
        <>{!isSchedulNull ? <img src={clearIcon} onClick={() => clean(id)} /> : null}</>,
        <>
            {!isLeader && !isMobileGroup ? (
                <Popconfirm title="删除后无法找回！确认是否删除？" onConfirm={() => deleteObject(id)} cancelText="取消" okText="确定">
                    <img className={styles.deleteBtn} src={closeIcon} />
                </Popconfirm>
            ) : null}
        </>,
        <>{isSchedulNull ? <img src={copyIcon} onClick={() => copy(index)} /> : null}</>
    );
};

export default Name;
