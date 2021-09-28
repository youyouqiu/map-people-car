/**
 * 车辆详情
 */
import React, { Component } from 'react';
import {
    Button,
    Spin,
} from 'antd';
import styles from './index.module.less';
import { Tabs } from 'antd';
import { Row } from 'antd';
import { Col } from 'antd';
import { Form } from 'antd';
import { showEmpty } from '@/framework/utils/function';
import { getOrgDetail } from '@/server/orgMgm';
import Popconfirm from '@/common/popconfirm';
import { IDetail } from '../type';
// import { getOperatingState } from '../../func';
import { DetailDrawer, OperatorContainer } from '@/common';
import OrgAddDrawer from './add';
import Newtable from '@/common/tableForm';
import { FormInstance } from 'antd/lib/form';
const { TabPane } = Tabs;


interface IProps {
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    delOrg: Function;//删除组织
    reload: () => void;//刷新列表
    refreshOrgtTree: () => void;//刷新组织树
    hasPermission: Function;//用户操作权限
    rootId: string;//根节点id
}

interface IState {
    dataSource: IDetail;
    pName: string;
    rowId: string;
    addVisible: boolean | undefined;
    loading: boolean;
}

const dataList = [
    {
        name: '组织名称',
        key: 'name',
    },
    {
        name: '组织机构代码',
        key: 'organizationCode',
    },
    {
        name: '上级组织',
        key: 'parentName',
    },
    {
        name: '省份',
        key: 'provinceName',
    },
    {
        name: '地市',
        key: 'cityName',
    },
    {
        name: '区县',
        key: 'countyName',
    },
    {
        name: '行政区划代码',
        key: 'areaNumber',
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
        name: '地址',
        key: 'address',
    },
    {
        name: '备注',
        key: 'remark',
    },
]


class OrgDetailDrawer extends Component<IProps, IState, any> {
    formRef: any = React.createRef<FormInstance>()
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
        const {
            rowId,
            visible
        } = nextProps;

        if (visible && rowId) {
            this.setState({
                loading: true
            })
            this.getOrgDetail(rowId);
        }
    }

    componentDidMount() {
        const {
            rowId,
            visible
        } = this.props;

        if (visible && rowId) {
            this.getOrgDetail(rowId);
        }
    }

    /**
     * 获取组织详情
     */
    getOrgDetail = async (id: string) => {
        const params = {
            id: id
        };
        const datas = await getOrgDetail<IDetail>(params);
        if (datas) {
            this.formRef.current.setFieldsValue(datas)

            this.setState({
                dataSource: datas,
                loading: false,
            })
        };
    }

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
                <Button
                    onClick={this.closeDrawer}
                    style={{ marginLeft: 8 }}
                >
                    取消
              </Button>
            </div>
        )
    }

    closeDrawer = () => {
        this.props.closeDrawer();
    }

    /**
     * 修改组织
     */
    showUpdateDrawer = () => {
        this.setState({
            addVisible: true
        });
    }
    closeAddDrawer = () => {
        this.setState({
            addVisible: false
        });
    }

    /**
     * 删除组织
     */
    delConfirm = () => {
        const {
            rowId,
            delOrg
        } = this.props;

        delOrg(rowId);
    }


    splitTime = (value: string) => {
        if (value) {
            const time = value.substring(0, value.length - 3);
            return time;
        }
    }

    render() {
        const {
            visible,
            rowId,
            reload,
            refreshOrgtTree,
            hasPermission,
            rootId
        } = this.props;

        const {
            dataSource,
            // pName,
            addVisible,
            loading,
        } = this.state;

        return (
            <DetailDrawer
                title="组织详情"
                width={740}
                visible={visible}
                onClose={this.closeDrawer}
            >
                <div
                    className={styles['detail-wrapper']}
                >
                    <div className={styles['left-box']}>
                        <Tabs defaultActiveKey="1" tabBarStyle={{ paddingLeft: '20px' }}>
                            <TabPane
                                tab="基本信息"
                                key="1"
                                className={styles['tab-pane']}
                                style={{ height: '100%' }}
                            >
                                <div
                                    className={styles['con-box']}
                                    style={{ height: 'calc(100vh - 300px)', overflowY: 'auto' }}
                                >
                                    <Form
                                        ref={this.formRef}
                                    >
                                        <Row>
                                            <Col
                                                span={24}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <Newtable
                                                    dataSource={dataList}
                                                    type={'detail'}
                                                ></Newtable>
                                            </Col>
                                        </Row>
                                    </Form>

                                </div>
                            </TabPane>
                        </Tabs>
                    </div>

                    <OperatorContainer>
                        <ul className={styles['basic-box']}>
                            <li className={styles['item']}>
                                <div className={styles['tit']} style={{ fontSize: 16, fontWeight: 600 }}>
                                    {showEmpty(dataSource.name)}
                                </div>
                            </li>
                            <li className={styles['item']} style={{ color: '#848383' }}>
                                <div className={styles['tit']}>最后修改时间:</div>
                                <div className={styles['con']}>{showEmpty(this.splitTime(dataSource.updateDataTime))}</div>
                            </li>
                        </ul>

                        <Button
                            block
                            onClick={this.showUpdateDrawer}
                            disabled={!hasPermission('修改')}
                        >
                            修改组织
                        </Button>
                        {
                            (rootId != rowId && hasPermission('删除')) ? (
                                <Popconfirm
                                    title='删除后无法找回！确认是否删除记录？'
                                    onConfirm={this.delConfirm}
                                    cancelText="取消"
                                    okText="确定"
                                >
                                    <Button
                                        block
                                    >
                                        删除组织
                                    </Button>
                                </Popconfirm>
                            ) : (
                                    <Button
                                        block
                                        disabled
                                    >
                                        删除组织
                                    </Button>
                                )
                        }

                    </OperatorContainer>

                    {/* 加载框 */}
                    {
                        loading && (
                            <Spin
                                spinning
                                className={styles['loading']}
                            />
                        )
                    }
                </div>

                {/* 修改组织抽屉 */}
                {
                    addVisible !== undefined && <OrgAddDrawer
                        visible={addVisible}
                        type={1}
                        rowId={rowId}
                        closeDrawer={this.closeAddDrawer}
                        closeDetailDrawer={this.closeDrawer}
                        reload={reload}
                        refreshOrgtTree={refreshOrgtTree}
                        getContainer="body"
                    />
                }
            </DetailDrawer>
        );
    }
}
export default OrgDetailDrawer;
