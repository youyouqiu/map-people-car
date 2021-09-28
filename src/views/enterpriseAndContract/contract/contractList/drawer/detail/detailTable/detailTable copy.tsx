import React, { ReactNode } from 'react'
import styles from './index.module.less'

interface IProps {
    data: { //数据源  可以是 字符串\函数\ReactNode
        th: ReactNode | ReactNode[] | (() => ReactNode) | string;
        td: ReactNode | ReactNode[] | (() => ReactNode) | string;
    }[];
    colNum?: number; //每个tr包含几组{th,td}  注意：一个tr和一个td才算一组
    style?: React.CSSProperties; //样式
}

const createElement = React.createElement

const DetailTable = (props: IProps) => {
    const {data , colNum = 4} = props
    let count = 0
    const trArr: ReactNode[] = []
    let trHtml: ReactNode[] =[]
    const render = (item: string | ReactNode | Function) => {
        if(!item){
            return('--')
        }
        if (typeof item === 'function') {
            return item();
          } else {
            return item;
          }
    }
    //遍历数据
    data.map((item,index) => {
        trHtml.push(
            createElement('th',{
                className: styles.th,
                key: 'th_' + index
            },render(item.th)),
            createElement('td',{
                className: styles.td,
                key: 'td_' + index
            },render(item.td))
        )
        if(count == colNum - 1){ 
            trArr.push(createElement('tr',{
                className: styles.tr,
                key: 'tr' + index
            },trHtml))
            trHtml = []
            count = 0
            return
        }
        count++
    })
    //剩下不足一列的，在这里同意放到末尾
    trArr.push(createElement('tr',{
        className: styles.tr,
        key: 'tr_last' 
    },trHtml))

    return(
        createElement('table',{
            className: styles.table,
            style:props.style
        },
            createElement('tbody',null,trArr)
        )
    )
}


export default DetailTable
