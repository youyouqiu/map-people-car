import React, { Component } from 'react';
import styles from './index.module.less';
import { Table } from 'antd';
import { getVehicleDetail } from '@/server/enterpriseAndContract';

// import { getOperatingState } from '../../func';

interface IProps {
    rowId: string;
}
const columns = [
    {
        title: '车牌号',
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
        title: '终端号',
        dataIndex: 'deviceNumber',
        key: 'deviceNumber',
    },
    {
        title: 'SIM卡号',
        dataIndex: 'simCardNumber',
        key: 'simCardNumber',
    },
    {
        title: '车辆类型',
        dataIndex: 'vehicleType',
        key: 'vehicleType',
    },
    {
        title: '车辆状态',
        dataIndex: 'isStart',
        key: 'isStart',
        render: (value: number) => {
            return value == 1 ? '启用' : '停用';
        },
    },
];
interface IState {
    dataSource: any[];
    totalNum: number;
}
class VihecleInfo extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataSource: [],
            totalNum: 0,
        };
    }
    componentDidMount() {
        const { rowId } = this.props;
        getVehicleDetail(rowId).then((res: any) => {
            if (res) {
                this.setState({
                    dataSource: res.vehicleList,
                    totalNum: res.totalNum,
                });
            }
        });
    }
    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { rowId } = nextProps;
        if (rowId != this.props.rowId) {
            getVehicleDetail(rowId).then((res: any) => {
                if (res) {
                    this.setState({
                        dataSource: res.vehicleList,
                        totalNum: res.totalNum,
                    });
                }
            });
        }
    }
    render() {
        const { totalNum, dataSource } = this.state;
        return (
            <div className={styles['box']}>
                <div className={styles['top']}>
                    <p>
                        排班车辆总数：<span>{totalNum}</span>
                    </p>
                </div>
                <Table dataSource={dataSource} columns={columns} bordered={true} className={styles.table} />
            </div>
        );
    }
}
export default VihecleInfo;
