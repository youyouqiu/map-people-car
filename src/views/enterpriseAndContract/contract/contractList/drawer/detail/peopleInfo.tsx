import React, { Component } from 'react';
import styles from './index.module.less';
import { Table } from 'antd';
import { getPeopleDetail } from '@/server/enterpriseAndContract';
// import { getOperatingState } from '../../func';

const columns = [
    {
        title: '编号',
        dataIndex: 'number',
        key: 'number',
    },
    {
        title: '主管单位',
        dataIndex: 'orgName',
        key: 'orgName',
    },
    {
        title: '所属企业',
        dataIndex: 'enterpriseName',
        key: 'enterpriseName',
    },
    {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: '岗位类型',
        dataIndex: 'professionalsType',
        key: 'professionalsType',
    },
    {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        render: (value: number) => {
            return value == 1 ? '男' : '女';
        },
    },
    {
        title: '身份证号码',
        dataIndex: 'identity',
        key: 'identity',
    },
    {
        title: '电话',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: '终端号',
        dataIndex: 'deviceNumber',
        key: 'deviceNumber',
    },
    {
        title: 'SIM卡号',
        dataIndex: 'simCardNumber',
        key: 'simCardNumber',
    },
];
interface IProps {
    rowId: string;
}
interface IState {
    dataSource: any[];
    totalNum: number;
    leaderNum: number;
}
class BasicInfo extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataSource: [],
            totalNum: 0,
            leaderNum: 0,
        };
    }
    componentDidMount() {
        const { rowId } = this.props;
        getPeopleDetail(rowId).then((res: any) => {
            if (res) {
                this.setState({
                    dataSource: res.peopleList,
                    totalNum: res.totalNum,
                    leaderNum: res.leaderNum,
                });
            }
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { rowId } = nextProps;
        if (rowId != this.props.rowId) {
            getPeopleDetail(rowId).then((res: any) => {
                if (res) {
                    this.setState({
                        dataSource: res.peopleList,
                        totalNum: res.totalNum,
                        leaderNum: res.leaderNum,
                    });
                }
            });
        }
    }
    render() {
        const { totalNum, leaderNum, dataSource } = this.state;
        return (
            <div className={styles['box']}>
                <div className={styles['top']}>
                    <p>
                        排班人员总数：<span>{totalNum}</span>
                    </p>
                    <p>
                        管理组长总数：<span>{leaderNum}</span>
                    </p>
                </div>
                <Table dataSource={dataSource} columns={columns} bordered={true} className={styles.table} />
            </div>
        );
    }
}
export default BasicInfo;
