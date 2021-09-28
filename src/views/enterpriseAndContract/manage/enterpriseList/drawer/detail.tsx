import React, { Component } from 'react';
import { Button, Spin, Tabs } from 'antd';
import styles from './index.module.less';
import { showEmpty } from '@/framework/utils/function';
import Popconfirm from '@/common/popconfirm';
import { IDetail } from '../type';
import { getEnterpriseDetail } from '@/server/enterpriseAndContract';
// import { getOperatingState } from '../../func';
import { DetailDrawer, OperatorContainer } from '@/common';
import OrgAddDrawer from './add';
import moment from 'moment';
const { TabPane } = Tabs;

interface IProps {
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    delOrg: Function; //删除组织
    reload: () => void; //刷新列表
    hasPermission: Function; //用户操作权限
    rootId: string; //根节点id
}

interface IState {
    dataSource: IDetail;
    pName: string;
    rowId: string;
    addVisible: boolean | undefined;
    loading: boolean;
}

const detials = [
    {
        name: '企业名称',
        key: 'name',
    },
    {
        name: '管理员账号',
        key: 'enterpriseAdmin',
    },
    {
        name: '组织机构名称代码',
        key: 'organizationCode',
    },
    {
        name: '主管单位',
        key: 'orgName',
    },
    {
        name: '经营许可证号',
        key: 'businessLicenseNo',
    },
    {
        name: '法人',
        key: 'principal',
    },
    {
        name: '联系人',
        key: 'contactName',
    },
    {
        name: '联系电话',
        key: 'phone',
    },
    {
        name: '成立日期',
        key: 'registerDate',
    },
    {
        name: '执照有效期',
        key: 'licenseValidityStartDate',
    },
    {
        name: '地址',
        key: 'address',
    },
    {
        name: '是否审核',
        key: 'auditStatus',
        render: (value: number) => {
            if (value == 1) {
                return '开启';
            }
            return '关闭';
        },
    },
    {
        name: '状态',
        key: 'status',
        render: (value: number) => {
            if (value == 1) {
                return '启用';
            }
            return '停用';
        },
    },
    {
        name: '备注',
        key: 'remark',
    },
];

class OrgDetailDrawer extends Component<IProps, IState> {
    // static defaultProps = {
    //     showUpdateDrawer: null
    // }

    constructor(props: IProps) {
        super(props);
        this.state = {
            dataSource: {},
            pName: '',
            rowId: this.props.rowId,
            addVisible: undefined,
            loading: true,
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { rowId, visible } = nextProps;

        if (visible && rowId) {
            this.setState({
                loading: true,
            });
            this.getOrgDetail(rowId);
        }
    }

    componentDidMount() {
        const { rowId, visible } = this.props;

        if (visible && rowId) {
            this.getOrgDetail(rowId);
        }
    }

    /**
     * 获取组织详情
     */
    getOrgDetail = async (id: string) => {
        const data: any = await getEnterpriseDetail(id);
        if (data) {
            this.setState({
                dataSource: data,
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

        const { dataSource, pName, addVisible, loading } = this.state;

        return (
            <DetailDrawer title="企业详情" width={720} visible={visible} onClose={this.closeDrawer}>
                <div className={styles['detail-wrapper']}>
                    <div className={styles['left-box']}>
                        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>
                            <TabPane tab="基本信息" key="1" className={styles['tab-pane']} style={{ height: '100%' }}>
                                <div
                                    className={styles['con-box']}
                                    style={{
                                        height: 'calc(100vh - 300px)',
                                        overflowY: 'auto',
                                        padding: '24px',
                                    }}
                                >
                                    <table className={styles['table']}>
                                        <tbody>
                                            {detials.map((item: { name: string; key: string; render?: Function }) => {
                                                let value = dataSource && showEmpty(dataSource[item.key]);
                                                if (item.key == 'pName') {
                                                    value = pName;
                                                } else if (item.key == 'operatingState') {
                                                    // value = getOperatingState(value);
                                                }
                                                return (
                                                    <tr key={item.key}>
                                                        <th className={styles['tit']}>{item.name}</th>
                                                        <td className={styles['body']}>{item.render ? item.render(value) : value}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>

                    <OperatorContainer>
                        <p>
                            企业名称 <br /> {dataSource.name}
                        </p>
                        <p>
                            状态 <br /> {dataSource.status == 1 ? '启用' : '停用'}
                        </p>
                        <p>
                            最后修改时间 <br /> {dataSource.updateDataTime ? moment(dataSource.updateDataTime).format('YYYY-MM-DD HH:mm') : '--'}
                        </p>
                        <Button block onClick={this.showUpdateDrawer} disabled={!hasPermission('修改')}>
                            修改企业
                        </Button>
                        {rootId != rowId && hasPermission('删除') ? (
                            <Popconfirm title="删除后无法找回！确认是否删除记录？" onConfirm={this.delConfirm} cancelText="取消" okText="确定">
                                <Button block>删除企业</Button>
                            </Popconfirm>
                        ) : (
                            <Button block disabled>
                                删除企业
                            </Button>
                        )}
                    </OperatorContainer>

                    {/* 加载框 */}
                    {loading && <Spin spinning className={styles['loading']} />}
                </div>

                {/* 修改组织抽屉 */}
                {addVisible !== undefined && (
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
export default OrgDetailDrawer;
