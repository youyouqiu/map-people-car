import React, { Component } from 'react';
import DetailTable from './detailTable/detailTable';
import DetailMap,{Lnglat} from '@/common/map/detail';
import styles from './basic.module.less';

interface IProps {
    rowId: string;
    dataSource: any;
}

interface IState {
    loading: boolean;
    path: string;
    countyCode: string;
}

class BasicInfo extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: true,
            path: '',
            countyCode: '',
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        if (nextProps.dataSource.organization) {
            this.setState({
                loading: true,
                path: nextProps.dataSource.fenceLongLat,
                countyCode: nextProps.dataSource.organization.countyCode,
            });
        }
    }

    componentDidMount() {
        this.setState({
            path: this.props.dataSource.fenceLongLat,
        });
    }

    render() {
        const columns = [
            {
                name: '合同编号',
                key: 'contractNo',
            },
            {
                name: '合同名称',
                key: 'contractName',
            },
            {
                name: '主管单位',
                key: 'orgName',
            },
            {
                name: '中标企业',
                key: 'enterpriseName',
            },
            {
                name: '中标日期',
                key: 'biddingDate',
            },
            {
                name: '合同签订方式',
                key: 'contractSigningMethod',
                render: (record: number) => {
                    switch (record) {
                        case 0:
                            return '一年一签';
                        case 1:
                            return '三年一签';
                        default:
                            return '';
                    }
                },
            },
            {
                name: '合同金额',
                key: 'contractAmount',
            },
            {
                name: '服务开始日期',
                key: 'serviceStartDate',
            },
            {
                name: '服务结束日期',
                key: 'serviceEndDate',
            },
        ];
        const columns2 = [
            {
                name: '标段编号',
                key: 'sectionNo',
            },
            {
                name: '标段名称',
                key: 'sectionName',
            },
            {
                name: '项目负责人',
                key: 'leader',
            },
            {
                name: '负责人电话',
                key: 'leaderPhone',
            },
            {
                name: '应配小组长数',
                key: 'needGroupLeaders',
            },
            {
                name: '要求面积(m²)',
                key: 'requiredArea',
            },
            {
                name: '绘制面积(m²)',
                key: 'drawArea',
            },
            {
                name: '要求配置人数',
                key: 'requiredPerson',
            },
            {
                name: '要求配置车辆数',
                key: 'requiredVehicles',
            },
            {
                name: '备注',
                key: 'remark',
            },
        ];
        return (
            <div className={styles.box}>
                <p>合同信息</p>
                <DetailTable columns={columns} data={this.props.dataSource} style={{ marginBottom: '15px' }} colNum={4} />
                <p>标段信息</p>
                <DetailTable columns={columns2} data={this.props.dataSource} style={{ marginBottom: '15px' }} colNum={4} />
                <div className="amap" id="amap" style={{height: '390px', zIndex: 10, position: 'relative'}}>
                    <DetailMap type='polygon' pathStr={this.state.path} />
                </div>
            </div>
        );
    }
}

export default BasicInfo;
