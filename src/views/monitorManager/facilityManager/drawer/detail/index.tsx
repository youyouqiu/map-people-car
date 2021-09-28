/**
 * 设施详情
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Tabs, Form, Row, Col, Spin, Empty } from 'antd';
const { TabPane } = Tabs;

import { DetailDrawer } from '@/common/';
import RightHandle from './rightHandle';// 抽屉右侧操作区域
import FacilityMap from './map';// 地图
import AddAndEditDrawer from '../addAndEdit';// 新增修改设施信息
import EditBindDrawer from '../editBindDrawer';// 修改绑定信息
import TableForm from '@/common/tableForm';
import {
    facilityInfoColumn, addressInfoColumn, monitorInfoColumn,
    deviceInfoColumn, simInfoColumn, dateInfoColumn
} from './tableColumn';

import styles from '../../../index.module.less';
import { getFacilityDetailInfo } from '@/server/monitorManager';

interface IProps {
    monitorInfo: any;
    drawerVisible: {
        addAndedit: false | 'add' | 'edit' | undefined;
        detailVisible: boolean;
        editBindInfo: boolean | undefined;
    };
    changeDrawer: Function;
    currentTable: any;
}

interface IState {
    monitorId: string;
    loading: boolean;
    monitorDeatilInfo: any;
    markerPosition: Array<number> | null;
}

class Index extends Component<IProps, IState, any> {
    formRef: any = React.createRef();
    constructor(props: IProps) {
        super(props);
        this.state = {
            monitorId: '',
            loading: false,
            monitorDeatilInfo: {},
            markerPosition: null
        };
    }

    componentDidMount() {
        const { monitorInfo: { id }, drawerVisible: { detailVisible } } = this.props;
        if (detailVisible) {
            this.setState({
                loading: true
            }, () => {
                this.getBasicInfo(id);
            })
        }
    }

    // props改变时触发
    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const { monitorInfo, drawerVisible: { detailVisible } } = nextProps;
        const { monitorId } = this.state;
        if (detailVisible && monitorInfo) {
            const { monitorInfo: { id } } = nextProps;
            if (monitorId === '' || id && monitorId !== id) {
                this.setState({
                    loading: true
                }, () => {
                    this.getBasicInfo(id);
                })
            }
        } else if (!detailVisible && monitorId !== '') {
            this.setState({
                monitorId: ''
            })
        }
    }

    /**
     * 获取基本信息详情
     */
    getBasicInfo = async (id: string) => {
        const result: any = await getFacilityDetailInfo(id);
        let position = null;
        if (result) {
            console.log('result', result);
            if (result.longitude != undefined && result.latitude) {
                position = [result.longitude, result.latitude]
            }

            this.dataRefactoring(result);
            this.setState({
                monitorId: id,
                loading: false,
                monitorDeatilInfo: result,
                markerPosition: position
            }, () => {
                this.formRef.current.resetFields();
                this.formRef.current.setFieldsValue(result);
            })
        } else {
            this.setState({
                loading: false,
            })
        }
    }

    /**
     * 数据重构
     */
    dataRefactoring = (data: any) => {

        data.status = (data.status === 1 ? '启用' : '停用');
        data.fixStatus = (data.fixStatus == 0 ? '是' : '否');
        switch (data.facilityColor) {
            case 1:
                return data.facilityColor = '白色';
            case 2:
                return data.facilityColor = '黑色';
            case 3:
                return data.facilityColor = '红色';
            case 4:
                return data.facilityColor = '蓝色';
            case 5:
                return data.facilityColor = '紫色';
            case 6:
                return data.facilityColor = '黄色';
            case 7:
                return data.facilityColor = '紫色';
            case 8:
                return data.facilityColor = '粉色';
            case 9:
                return data.facilityColor = '棕色';
            case 10:
                return data.facilityColor = '灰色';
            default:
                return '其他'
        }

    }

    /**
     * 时间戳转日期格式
     */
    getDateStr = (date: number, format?: string) => {
        return moment(date).format(format ? format : 'YYYY-MM-DD');
    }

    /**
     * 关闭抽屉
     */
    closeDrawer = () => {
        this.setState({
            monitorId: ''
        }, () => {
            const { changeDrawer } = this.props;
            this.formRef.current.resetFields();
            changeDrawer({ detailVisible: false });
        })
    }

    /**
     * 渲染设施图片
     */
    renderImg = () => {
        const { monitorDeatilInfo } = this.state;
        const data = monitorDeatilInfo.monitorPhotoList || [];
        if (data.length === 0) {
            return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        return (
            <Row gutter={16}>
                {data.map((colItem: any) =>
                    <Col key={`img_${colItem.url}`} span={6}>
                        <div className={styles.imgItem}>
                            <div className={styles.imgBox}>
                                <img src={colItem.url} alt='照片' />
                            </div>
                            <div className={styles.imgName}>{colItem.name}</div>
                            <div className={styles.uploadTime}>
                                上传时间: <span>{colItem.time ? moment(colItem.time).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                            </div>
                            <div className={styles.uploadPeople}>
                                上传人: <span>{colItem.username}</span>
                            </div>
                        </div>
                    </Col>
                )}
            </Row>
        )
    }

    render() {
        const {
            drawerVisible: { detailVisible, addAndedit, editBindInfo }, monitorInfo, changeDrawer, currentTable
        } = this.props;
        const { monitorId, monitorDeatilInfo, markerPosition } = this.state;

        // 备注信息过多,需用div才能完整显示
        let newFacilityInfoColumn: any = facilityInfoColumn;
        newFacilityInfoColumn[newFacilityInfoColumn.length - 1].component = <div className={styles.detailRemark}>{(monitorDeatilInfo && monitorDeatilInfo.remark) || ''}</div>


        return (
            <DetailDrawer
                title="设施详情"
                width={1240}
                onClose={this.closeDrawer}
                visible={detailVisible ? true : false}
            >
                <div className={styles['detailContainer']}>
                    <Form
                        ref={this.formRef}
                        initialValues={{}}
                        className={styles['detail-wrapper']}
                        id="paramSetContainer"
                    >
                        <Tabs key={monitorId || 'facilityDeatil'} defaultActiveKey='1' className={styles['detail-tabs']}>
                            <TabPane tab="基本信息" key="1" className={styles['detailPanel']}>
                                <div className={[styles.innerBox, styles.detailInnerBox].join(' ')}>
                                    <TableForm className={styles.detailTable} dataSource={facilityInfoColumn} column={8} type='detail' header='设施信息' />
                                    <table className={styles.itemTable}>
                                        <tbody>
                                            <tr><th colSpan={2} className={styles.tableHeader}>位置信息</th></tr>
                                            <tr>
                                                <td width={530}>
                                                    <FacilityMap position={markerPosition} />
                                                </td>
                                                <td>
                                                    <TableForm className={styles.detailTable} dataSource={addressInfoColumn} column={2} type='detail' />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table className={styles.itemTable}>
                                        <tbody>
                                            <tr><th className={styles.tableHeader}>设施照片</th></tr>
                                            <tr><td><div className={styles.vehicleImgBox}>{this.renderImg()}</div></td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </TabPane>
                            <TabPane disabled={!monitorInfo || monitorInfo.bindingType !== 1} tab="绑定信息" key="2" className={styles['detailPanel']}>
                                <TableForm dataSource={monitorInfoColumn} column={6} header='对象详情' type='detail' />
                                <TableForm dataSource={deviceInfoColumn} column={6} header='终端详情' type='detail' />
                                <TableForm dataSource={simInfoColumn} column={6} header='SIM卡详情' type='detail' />
                                <TableForm dataSource={dateInfoColumn} column={4} header='服务期限' type='detail' />
                            </TabPane>
                        </Tabs>
                    </Form>
                    <RightHandle
                        monitorInfo={monitorInfo}
                        currentTable={currentTable}
                        changeDrawer={changeDrawer}
                    />
                    {addAndedit && detailVisible &&
                        <AddAndEditDrawer
                            currentTable={currentTable}
                            monitorInfo={monitorInfo}
                            drawerVisible={{ addAndedit, detailVisible }}
                            changeDrawer={changeDrawer} />
                    }
                    {editBindInfo && detailVisible &&
                        <EditBindDrawer
                            currentTable={currentTable}
                            monitorInfo={monitorInfo}
                            drawerVisible={{ editBindInfo: true, detailVisible }}
                            changeDrawer={changeDrawer} />
                    }
                    {/* 加载loading */}
                    {monitorDeatilInfo && monitorDeatilInfo.id !== monitorId && <Spin className={styles.spinning} spinning />}
                </div>
            </DetailDrawer>
        );
    }
}
export default Index;
