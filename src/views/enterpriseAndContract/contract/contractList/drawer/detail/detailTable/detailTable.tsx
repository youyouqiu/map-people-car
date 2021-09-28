import React, { ReactNode } from 'react';
import styles from './index.module.less';

interface IProps {
    data: any;
    columns: {
        name: string;
        key: string;
        render?: (params: any) => ReactNode;
    }[];
    colNum?: number; //每个tr包含几组{th,td}  注意：一个tr和一个td才算一组
    style?: React.CSSProperties; //样式
}

const createElement = React.createElement;

const DetailTable = (props: IProps) => {
    const { data, columns, colNum = 4 } = props;
    let renderData: {
        th: string;
        td: string | ReactNode;
    }[] = [];
    columns.forEach((item) => {
        if (item.render) {
            renderData.push({
                th: item.name,
                td: item.render(data[item.key]),
            });
        } else {
            renderData.push({
                th: item.name,
                td: data[item.key],
            });
        }
    });

    let count = 0;
    const trArr: ReactNode[] = [];
    let trHtml: ReactNode[] = [];
    const render = (item: string | ReactNode | Function) => {
        if (!item) {
            return '--';
        }
        if (typeof item === 'function') {
            return item();
        } else {
            return <div style={{ height: '22px', overflow: 'hidden' }}>{item}</div>;
        }
    };
    //遍历数据
    renderData.map((item, index) => {
        trHtml.push(
            createElement(
                'th',
                {
                    className: styles.th,
                    key: 'th_' + index,
                },
                render(item.th)
            ),
            createElement(
                'td',
                {
                    className: styles.td,
                    key: 'td_' + index,
                },
                render(item.td)
            )
        );
        if (count == colNum - 1) {
            trArr.push(
                createElement(
                    'tr',
                    {
                        className: styles.tr,
                        key: 'tr' + index,
                    },
                    trHtml
                )
            );
            trHtml = [];
            count = 0;
            return;
        }
        count++;
    });
    //剩下不足一列的，在这里同意放到末尾
    trArr.push(
        createElement(
            'tr',
            {
                className: styles.tr,
                key: 'tr_last',
            },
            trHtml
        )
    );

    return createElement(
        'table',
        {
            className: styles.table,
            style: props.style,
        },
        createElement('tbody', null, trArr)
    );
};

export default DetailTable;
