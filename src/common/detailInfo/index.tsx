import React, { useEffect, useState } from 'react'
import { Col } from 'antd';
import { Row } from 'antd';
import './index.modules.less'

export interface IDetailProps {
    /**
     * @param detailList
     * */
    detailList: IDetailListProps;
    /**
     * @param detailData // 详情数据 JSON对象格式
     * */
    detailData: any;
}

interface IDetailListProps {
    top?: IDetailListItemProps;
    body: IDetailListItemProps;
}

interface IDetailListItemProps {
    row?: number;
    list: IDetailInfo[];
}



interface IDetailInfo {
    title?: string | Function;
    dataIndex?: string;
    row?: number;
    dom?: any;
    render?: (value: any, record: any) => any;
}

function index(props: IDetailProps) {
    const { detailList, detailData } = props

    const [detailDom, setDetailDom] = useState([])
    const [detailHeaderDom, setDetailHeaderDom] = useState([])

    /**
     * 处理每个item
     * @param item 每个详情item对象
     * @param index 用于设置key
     * @param span 设置它的宽度占比
     * */ 
    function handleItem(item: IDetailInfo, index: number, span: number) {
        let text: any = '--'
        let title: any = '--'

        if (item.dom) {
            text = item.dom
        } else if (item.render && typeof item.render === 'function') {
            text = item.render(item.dataIndex && detailData[item.dataIndex] || '', detailData)
        } else if (item.dataIndex) {
            text = detailData[item.dataIndex] || '--'
        }

        if (typeof item.title === 'function') {
            title = item.title(detailData)
        } else {
            title = item.title
        }

        return (
            <Col key={`${index}_col`} span={span}>
                {
                    item.title ?
                        <div className='detail-info-title'>
                            {title}
                        </div>
                        : null
                }
                <div className='detail-title-text'>
                    {text}
                </div>
            </Col>
        )
    }

    /**
     * 处理详情
     * @param data 详情list
     * @param row 每行展示多少个 函数中默认为2进行处理
     * */ 
    function handleDetail(data: any,row?: number): any {

        if(!data && data.length === 0) return 

        const arr: any = []
        let obj: React.ReactNode[] = []
        let num = 1
        const _row = row || 2

        data.forEach((item: IDetailInfo, index: number) => {
            const span = item.row === _row ? 24 : 24 / _row
            obj.push(
                handleItem(item, index, span)
            )

            if ((num % _row === 0 || item.row === row) && row) {
                arr.push(<Row gutter={[12, 0]} key={`${index}_row`}>{obj}</Row>)
                obj = []
                num = 0
            } else if (index === data.length - 1) {
                arr.push(<Row gutter={[12, 0]} key={`${index}_row`}>{obj}</Row>)
                obj = []
                num = 0
            }
            num += 1
        })

        return arr
    }

    // 数据改变时
    useEffect(() => {

        if(detailList.top) {
            setDetailHeaderDom(handleDetail(detailList.top.list, detailList.top.row || 3))
        }

        if(detailList.body) {
            
            setDetailDom(handleDetail(detailList.body.list, detailList.body.row))
        }

    }, [detailData, detailList])

    return (
        <div className='detail-info'>
            {
                detailHeaderDom.length ?
                    <div className='detail-top'>
                        {detailHeaderDom}
                    </div>
                    : null
            }
            <div className='detail-content'>
                {detailDom}
            </div>
        </div>
    )
}

export default index
