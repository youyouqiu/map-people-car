## detailInfo

`定制化详情组件`

- 参数说明

| 参数名     | 类型                                                                               | 说明                                                     | 默认值 |
| ---------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- | ------ |
| detailList | `{ top:{row:number,list detailInfo[]},`<br>`body:{row:number,list detailInfo[]} }` | 详情列表,row 为每行显示多少个数据，<br> `top` 中默认为 3 | {}     |
| detailData | object                                                                             | 详情数据                                                 |        |

- detailInfo

| 参数名    | 类型                                  | 说明                                                      | 默认值 |
| --------- | ------------------------------------- | --------------------------------------------------------- | ------ |
| title     | `string | (detailData:any) => string | ReactDom` | 详情头                                                    |        |
| dataIndex | object                                | 详情数据对应的 key                                        |        |
| row       | number                                | 当前项占用位置数，当 row 等于 props 中的 row 时，占用整行 | 1      |
| dom       | ReactDom                              | 自定义 DOM                                                |        |
| render    | function                              | `ReactDom | (value:any,detailData:any) => string | ReactDom`         |        |

- 使用方式

```js
    const detailList = {
        top: {
            list: [
                    {
                        title: '测试',
                        dataIndex: 'name'
                    },
                    {
                        title: '测试',
                        dom: <Map> </Map>
                    },
                    {
                        title: '测试',
                        row: 2,
                        render: (value:any,detailData:any) => {
                            return detailData.text
                        }
                    },
                ]
        },
        body: {
            list: [
                 {
                        title: '测试',
                        dataIndex: 'name'
                    },
                    {
                        title: '测试',
                        dom: <Map> </Map>
                    },
                    {
                        title: '测试',
                        row: 2,
                        render: (value:any,detailData:any) => {
                            return detailData.text
                        }
                    },
            ]
        }
    }
    const detailData = {
        name : 'name',
        text : 'text'
    }

    <DetailInfo
        detailList={detailList}
        detailData={detailData}
    >
```
