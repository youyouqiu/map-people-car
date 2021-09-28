/**
 * 车辆详情
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Tabs, Row, Col, Tag, Form, Spin, Empty } from 'antd';
const { TabPane } = Tabs;

import { DetailDrawer } from '@/common/';
import AddAndEditDrawer from '../addAndEdit';// 新增修改车辆信息
import EditBindDrawer from '../editBindDrawer';// 修改绑定信息
import SynthesisSet from './synthesisSet';// 综合设置
import RightHandle from './rightHandle';// 抽屉右侧操作区域
import { getCurrentUserPermission } from '@/framework/utils/function';
import TableForm from '@/common/tableForm';
import {
  vehicleInfoColumn, monitorInfoColumn,
  deviceInfoColumn, simInfoColumn, dateInfoColumn
} from './tableColumn';

import styles from '../../../index.module.less';
import { getDetailInfo } from '@/server/monitorManager';

interface IProps {
  monitorInfo: any;
  drawerVisible: {
    addAndedit: false | 'add' | 'edit' | undefined;
    detailVisible: boolean | 'synthesisSet';
    editBindInfo: boolean | undefined;
  };
  changeDrawer: Function;
  currentTable: any;
}

interface IState {
  monitorId: string;
  activeKey: string;
  vehicleDeatilInfo: any;
  loading: boolean;
}

// 当前页面权限
const permission = getCurrentUserPermission('4_vehicle_list');
class VehicleDetailDrawer extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      activeKey: '1',
      loading: false,
      vehicleDeatilInfo: {},
    };
  }

  componentDidMount() {
    const { monitorInfo: { id }, drawerVisible: { detailVisible } } = this.props;
    if (detailVisible) {
      this.setState({
        loading: true,
        activeKey: detailVisible === 'synthesisSet' ? '3' : '1'
      })
      this.getBasicInfo(id);
    }
  }

  // props改变时触发
  UNSAFE_componentWillReceiveProps(nextProps: IProps, nextState: IState) {
    const { monitorInfo, drawerVisible: { detailVisible } } = nextProps;
    const { monitorId } = this.state;
    if (detailVisible && monitorInfo) {
      const { monitorInfo: { id } } = nextProps;
      if (monitorId === '' || id && monitorId !== id) {
        this.setState({
          loading: true,
          activeKey: detailVisible === 'synthesisSet' ? '3' : '1'
        })
        this.getBasicInfo(id);
      }
    } else if (!detailVisible && monitorId !== '') {
      this.setState({
        monitorId: ''
      })
    }
  }

  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  }

  /**
   * 获取基本信息详情
   */
  getBasicInfo = async (id: string) => {
    const result = await getDetailInfo(id);
    if (result) {
      this.dataRefactoring(result);
      this.setState({
        monitorId: id,
        loading: false,
        vehicleDeatilInfo: result
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
    data.isStart = (data.isStart === 1 ? '启用' : '停用');
    data.stateRepair = (data.stateRepair === 1 ? '是' : '否');
  }

  /**
   * 渲染车辆图片
   */
  renderVehicleImg = () => {
    const { vehicleDeatilInfo } = this.state;
    const data = vehicleDeatilInfo.monitorPhotoList || [];
    if (data.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    return (
      <Row gutter={16}>
        {data.map((colItem: any) => {
          return colItem.type === 1 ?
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
            : null
        }
        )}
      </Row>
    )
  }

  /**
   * 修改tabs显示项
   */
  changeActiveTab = (key: string) => {
    this.setState({ activeKey: key })
  }

  /**
   * 更新详情信息
   */
  updateDetailInfo = () => {
    const { monitorInfo: { id } } = this.props;
    this.getBasicInfo(id);
  }

  /**
   * 关闭抽屉
   */
  closeDetailDrawer = () => {
    this.setState({
      monitorId: ''
    }, () => {
      const { changeDrawer } = this.props;
      this.formRef.current.resetFields();
      changeDrawer({ detailVisible: false });
    })
  }

  render() {
    const {
      drawerVisible: { detailVisible, addAndedit, editBindInfo }, monitorInfo, changeDrawer, currentTable,
    } = this.props;
    const { activeKey, loading, vehicleDeatilInfo } = this.state;
    const professionals = vehicleDeatilInfo.professionals || "";
    const synthesisSetDisabled = !monitorInfo || monitorInfo.bindingType !== 1 || !this.hasPermission('综合设置');

    // 备注信息过多,需用div才能完整显示
    const newVehicleInfoColumn: any = vehicleInfoColumn;
    newVehicleInfoColumn[newVehicleInfoColumn.length - 1].component = <div className={styles.detailRemark}>{vehicleDeatilInfo.remark || ''}</div>

    return (
      <DetailDrawer
        title="车辆详情"
        width={1240}
        onClose={this.closeDetailDrawer}
        visible={detailVisible ? true : false}
      >
        <div className={styles['detailContainer']}>
          <Form
            ref={this.formRef}
            initialValues={{}}
            className={styles['detail-wrapper']}
            id="paramSetContainer"
          >
            <Tabs onTabClick={this.changeActiveTab} activeKey={activeKey} className={styles['detail-tabs']}>
              <TabPane tab="基本信息" key="1" className={styles['detailPanel']}>
                <TableForm dataSource={newVehicleInfoColumn} column={8} header='车辆信息' type='detail' />
                <table className={styles.itemTable}>
                  <tbody>
                    <tr><th className={styles.tableHeader}>车辆照片</th></tr>
                    <tr><td><div className={styles.vehicleImgBox}>{this.renderVehicleImg()}</div></td></tr>
                  </tbody>
                </table>
              </TabPane>
              <TabPane disabled={!monitorInfo || monitorInfo.bindingType !== 1} tab="绑定信息" key="2" className={styles['detailPanel']}>
                <TableForm dataSource={monitorInfoColumn} column={6} header='对象详情' type='detail' />
                <TableForm dataSource={deviceInfoColumn} column={6} header='终端详情' type='detail' />
                <TableForm dataSource={simInfoColumn} column={6} header='SIM卡详情' type='detail' />
                <TableForm dataSource={dateInfoColumn} column={6} header='服务期限' type='detail' />
                <table className={styles.itemTable}>
                  <tbody>
                    <tr><th className={styles.tableHeader}>从业人员</th></tr>
                    <tr><td>{
                      professionals ?
                        professionals.split(',').map((item: any) => (
                          <Tag key={item}>{item}</Tag>
                        ))
                        : null
                    }</td></tr>
                  </tbody>
                </table>
              </TabPane>
              <TabPane tab="综合设置" key="3" disabled={synthesisSetDisabled} className={styles['detailPanel']}>
                <SynthesisSet
                  monitorInfo={vehicleDeatilInfo}
                  currentTable={currentTable}
                  changeDrawer={changeDrawer}
                  updateDetailInfo={this.updateDetailInfo}
                />
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
              drawerVisible={{ addAndedit: addAndedit, detailVisible }}
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
          {loading && <Spin className={styles.spinning} spinning />}
        </div>
      </DetailDrawer>
    );
  }
}
export default VehicleDetailDrawer;
