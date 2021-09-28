import React, { Component } from 'react';
import { Button, Spin, Tabs } from 'antd';
import styles from '../index.module.less';
import Popconfirm from '@/common/popconfirm';
import BasicInfo from './basicInfo';
import VihecleInfo from './vihecleInfo';
import PeopleInfo from './peopleInfo';
import { IDetail } from '../../type';
import { getContractDetail } from '@/server/enterpriseAndContract';
import { DetailDrawer, OperatorContainer } from '@/common';
import OrgAddDrawer from '../add';
import moment from 'moment';
const { TabPane } = Tabs;

interface IProps {
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    delOrg: Function; //删除企业
    reload: () => void; //刷新列表
    hasPermission: Function; //用户操作权限
    rootId: string; //根节点id
}

interface IState {
    dataSource: any;
    pName: string;
    rowId: string;
    addVisible: boolean;
    loading: boolean;
}

class ContractDetailDrawer extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            dataSource: {},
            pName: '',
            rowId: this.props.rowId,
            addVisible: false,
            loading: true,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { rowId } = nextProps;

        if (rowId !== this.props.rowId) {
            this.setState({
                loading: true,
            });
            this.getDetail(rowId);
        }
    }

    componentDidMount() {
        const { rowId } = this.props;

        if (rowId) {
            
            this.getDetail(rowId);
        }
    }

    /**
     * 获取合同详情
     */
    getDetail = async (id: string) => {
        const datas = await getContractDetail<IDetail>(id);
        if (datas) {
            this.setState({
                dataSource: datas,
                loading: false,
            });
        }
    };

    /**
     * 抽屉底部
     */
    drawFooter = () => {
        return (
            <div
                style={{
                    textAlign: 'left',
                }}
            >
                <Button onClick={this.closeDrawer} style={{ marginLeft: 8 }}>
                    取消
                </Button>
            </div>
        );
    };

    closeDrawer = () => {
        this.props.closeDrawer();
    };

    /**
     * 修改组织
     */
    showUpdateDrawer = () => {
        this.setState({
            addVisible: true,
        });
    };
    closeAddDrawer = () => {
        this.setState({
            addVisible: false,
        });
    };

    /**
     * 删除组织
     */
    delConfirm = () => {
        const { rowId, delOrg } = this.props;
        delOrg(rowId);
    };

    render() {
        const { visible, rowId, reload, hasPermission, rootId } = this.props;

        const { addVisible, loading, dataSource } = this.state;

        return (
            <DetailDrawer title="合同标段详情" width={1240} visible={visible} onClose={this.closeDrawer}>
                <div className={styles['detail-wrapper']}>
                    <div className={styles['left-box']}>
                        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>
                            <TabPane tab="基本信息" key="1" className={styles['tab-pane']} style={{ height: '100%' }}>
                                <BasicInfo rowId={this.props.rowId} dataSource={dataSource} />
                            </TabPane>
                            <TabPane tab="人员信息" key="2" className={styles['tab-pane']} style={{ height: '100%' }}>
                                <PeopleInfo rowId={this.props.rowId} />
                            </TabPane>
                            <TabPane tab="车辆信息" key="3" className={styles['tab-pane']} style={{ height: '100%' }}>
                                <VihecleInfo rowId={this.props.rowId} />
                            </TabPane>
                        </Tabs>
                    </div>

                    <OperatorContainer>
                        <p>{dataSource.orgName}</p>
                        <p>
                            状态
                            <br />
                            {dataSource.status == 1 ? '启用' : '停用'}
                        </p>
                        <p>
                            最后修改时间
                            <br />
                            {moment(dataSource.updateDataTime).format('YYYY-MM-DD HH:mm')}
                        </p>
                        <Button block onClick={this.showUpdateDrawer} disabled={!hasPermission('修改')}>
                            修改标段
                        </Button>
                        {rootId != rowId && hasPermission('删除') ? (
                            <Popconfirm title="删除后无法找回！确认是否删除记录？" onConfirm={this.delConfirm} cancelText="取消" okText="确定">
                                <Button block>删除标段</Button>
                            </Popconfirm>
                        ) : (
                            <Button block disabled>
                                删除标段
                            </Button>
                        )}
                    </OperatorContainer>

                    {/* 加载框 */}
                    {loading && <Spin spinning className={styles['loading']} />}
                </div>

                {/* 修改标段抽屉 */}
                {addVisible && (
                    <OrgAddDrawer
                        visible={addVisible}
                        type={1}
                        rowId={rowId}
                        closeDrawer={this.closeAddDrawer}
                        closeDetailDrawer={this.closeDrawer}
                        reload={reload}
                        getContainer="body"
                    />
                )}
            </DetailDrawer>
        );
    }
}
export default ContractDetailDrawer;
