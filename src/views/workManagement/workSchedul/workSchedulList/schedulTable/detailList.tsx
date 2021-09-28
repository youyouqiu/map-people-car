import React, { ReactNode } from 'react';
import DragbleBox from './dragbleBox';

interface IMProps {
    updateData: (id: string, index: number, res: [number, number], initBoxInfo: [number, number]) => void;
    record: any;
    addSchedul: (record: any, index: number, width?: number) => void;
}

/**
 * 判断两个数组是否相等
 * @param arr1 数组一
 * @param arr2 数组二
 * @returns boolean
 */
const isArrayEqual = (arr1: string[], arr2: string[]): boolean => {
    return arr1.length == arr2.length && JSON.stringify(arr1) == JSON.stringify(arr2);
};
//渲染表格文字
const RenderString = (p: string[]): ReactNode => {
    const res = p.map((item, index: number) => {
        return <p key={index}>{item}</p>;
    });
    return <div>{res}</div>;
};

const DetailList = (props: IMProps) => {
    const { record, addSchedul } = props;
    const data = record.schedul;
    const allTd: any = [];
    let lastArr: any = 'lll';
    let number = 1;
    const handleClick = (record: any, index: number, width?: number) => {
        addSchedul(record, index, width);
    };
    const clickBoxWitdh = { number: 1 }; //使用对象形式 来使得下方的75行的onclick绑定函数的第三个参数指向同一个引用地址
    for (let i = 0; i < data.length; i++) {
        //空数组直接返回
        if (data[i].length == 0) {
            allTd.push(
                React.createElement(
                    'td',
                    {
                        colSpan: 1,
                        key: Math.random(),
                        width: 100 + 'px',
                        style: { border: '1px solid #e6e6e6' },
                        onClick: () => {
                            handleClick(record, i);
                        },
                    },
                    '--'
                )
            );
            number = 1;
            lastArr = data[i];
            continue;
        }

        //判断和前一个是否相等
        if (isArrayEqual(lastArr, data[i])) {
            number = number + 1;
            clickBoxWitdh.number++;
            allTd[allTd.length - 1] = React.createElement(
                'td',
                {
                    colSpan: number,
                    width: number * 100 + 'px',
                    key: Math.random(),
                    haschild: 1,
                    style: {
                        border: '1px solid #e6e6e6',
                        boxSizing: 'border-box',
                    },
                    onClick: (e: any) => {
                        const expand = e.target?.parentNode.parentNode.getAttribute('colspan');
                        handleClick(record, i, expand);
                    },
                },
                <DragbleBox updateData={props.updateData} uid={record.id} index={i - number + 1}>
                    {RenderString(data[i])}
                </DragbleBox>
            );
            lastArr = data[i];
        } else {
            allTd[allTd.length] = React.createElement(
                'td',
                {
                    colSpan: 1,
                    key: Math.random(),
                    width: 100 + 'px',
                    haschild: 1,
                    style: {
                        border: '1px solid #e6e6e6',
                        boxSizing: 'border-box',
                    },
                    onClick: () => handleClick(record, i),
                },
                <DragbleBox updateData={props.updateData} uid={record.id} index={i}>
                    {RenderString(data[i])}
                </DragbleBox>
            );
            number = 1;
        }
        lastArr = data[i];
    }
    return allTd;
};

export default DetailList;
