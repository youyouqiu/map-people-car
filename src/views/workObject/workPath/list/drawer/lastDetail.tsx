import React from 'react';
// import { Table } from '@/common';
import { Table } from 'antd';

/**
 * @param obj1 比较对象1
 * @param obj2 比较对象2
 */
const compare = (obj1: any, obj2: any) => {
    const result: any = {};
    Object.keys(obj1).map((key: string) => {
        if (!obj2[key]) return (result[key] = '新增');
        if (typeof obj1[key] == 'object') {
            if (obj1[key].workNum != obj2[key].workNum) {
                result[key] = '修改';
                return;
            }
        } else {
            if (obj1[key] != obj2[key]) {
                result[key] = '修改';
                return;
            } else {
                result[key] = ' ';
            }
        }
    });
    return result;
};

interface IState {
    data: any[];
    columns: any[];
}
interface IProps {
    allWorkList: {
        curWorkObject: any; //当前作业对象
        lastApproveWorkObject: any; //历史生效的作业对象
    };
}

class LastDetail extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            data: [],
            columns: [
                {
                    title: '作业对象名称',
                    dataIndex: 'workName',
                    key: 'workName',
                    width: 100,
                },
                {
                    title: '宽度(m):',
                    dataIndex: 'roadWidth',
                    key: 'roadWidth',
                },
                {
                    title: '长度(m):',
                    dataIndex: 'roadLength',
                    key: 'roadLength',
                },
                {
                    title: '管理组长',
                    dataIndex: 'groupLeader',
                    key: 'groupLeader',
                },
                {
                    title: '负责人',
                    dataIndex: 'contactName',
                    key: 'contactName',
                },
                {
                    title: '负责人电话',
                    dataIndex: 'contactPhone',
                    key: 'contactPhone',
                },
                {
                    title: '备注',
                    dataIndex: 'remark',
                    key: 'remark',
                },
            ],
        };
    }
    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { allWorkList } = nextProps;
        if (this.props.allWorkList != allWorkList) {
            let { curWorkObject, lastApproveWorkObject } = allWorkList;
            if (curWorkObject?.workModeList) {
                const { workModeList } = curWorkObject;
                this.handleColunm(workModeList);
            }

            curWorkObject = this.handleData(curWorkObject);
            lastApproveWorkObject = this.handleData(lastApproveWorkObject);

            lastApproveWorkObject = lastApproveWorkObject
                ? lastApproveWorkObject
                : {
                      ...curWorkObject,
                  };
            if (curWorkObject && lastApproveWorkObject) {
                this.setState({
                    // data: [curWorkObject, lastApproveWorkObject, compare(curWorkObject, lastApproveWorkObject)],
                    data: [lastApproveWorkObject, compare(curWorkObject, lastApproveWorkObject)],
                });
            }
        }
    }
    handleColunm = (workModeList: []) => {
        //展开workModeList，合并到cloumns上
        const addColumns = workModeList.map((item: any) => {
            return {
                title: item.workModeName,
                dataIndex: item.workModeId,
                key: item.workModeId,
                render: (item: any) => {
                    if (typeof item == 'string') return item;
                    if (!item) return;
                    if (item.unitType == 'peopleNum') {
                        return item.workNum + '人';
                    } else if (item.unitType == 'trips') {
                        const res = item.workNum.split(',') || [];
                        return res[0] + '趟' + ' ' + res[1] + '次';
                    }
                },
            };
        });
        const newColumns = JSON.parse(JSON.stringify(this.state.columns));
        newColumns.splice(4, 0, ...addColumns);
        this.setState(() => ({
            columns: newColumns,
        }));
    };
    handleData = (data: any) => {
        if (!data) return null;
        const { workModeList } = data;
        const modeListData: any = {};
        workModeList.forEach((item: any) => {
            modeListData[item.workModeId] = item;
        });
        //展开workModeList 以workModeId为key合并到data上
        data = {
            ...data,
            ...modeListData,
        };
        return data;
    };
    render() {
        return (
            <div>
                <p style={{ fontSize: '16px', fontWeight: 'bold', background: '#eee', margin: 0, padding: '10px' }}>原作业详情</p>
                <div>
                    <Table dataSource={this.state.data} columns={this.state.columns} scroll={{ y: 'calc(100vh - 340px)' }} pagination={false} />
                </div>
            </div>
        );
    }
}

export default LastDetail;
