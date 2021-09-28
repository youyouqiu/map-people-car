/**
 * 人员详情
 */
import React, { Component } from 'react';
import moment from 'moment';
import { Tabs, Form, Spin } from 'antd';
const { TabPane } = Tabs;

import { DetailDrawer } from '@/common/';
import RightHandle from './rightHandle';// 抽屉右侧操作区域
import AddAndEditDrawer from '../addAndEdit';// 新增修改人员信息
import EditBindDrawer from '../editBindDrawer';// 修改绑定信息
import TableForm from '@/common/tableForm';
import {
  peopleInfoColumn, drivingLicenseColumn, monitorInfoColumn,
  deviceInfoColumn, simInfoColumn, dateInfoColumn
} from './tableColumn';

import styles from '../../../index.module.less';
import { getPeopleDetail } from '@/server/monitorManager';

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
  monitorDeatilInfo: any;
  loading: boolean;
}

class Index extends Component<IProps, IState, any> {
  formRef: any = React.createRef();
  constructor(props: IProps) {
    super(props);
    this.state = {
      monitorId: '',
      monitorDeatilInfo: {},
      loading: false,
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
    const result = await getPeopleDetail(id);
    if (result) {
      this.dataRefactoring(result);
      this.setState({
        monitorId: id,
        loading: false,
        monitorDeatilInfo: result
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
    data.hireDateStr = moment(data.hireDate).format('YYYY-MM-DD');
    data.drivingStartDateStr = moment(data.drivingStartDate).format('YYYY-MM-DD');
    data.drivingEndDateStr = moment(data.drivingEndDate).format('YYYY-MM-DD');
    data.birthday = moment(data.birthday).format('YYYY-MM-DD');

    data.gender = (data.gender === '1' ? '男' : '女');
    data.manoeuvreMember = (data.manoeuvreMember === 1 ? '是' : '否');
    if (data.state === '0') {
      data.state = '正常';
    } else if (data.state === '1') {
      data.state = '离职';
    } else {
      data.state = '停用';
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

  render() {
    const {
      drawerVisible: { detailVisible, addAndedit, editBindInfo }, monitorInfo, changeDrawer, currentTable,
    } = this.props;
    const { loading, monitorId, monitorDeatilInfo, monitorDeatilInfo: { photograph } } = this.state;
    monitorDeatilInfo.bindingType = monitorInfo.bindingType;

    return (
      <DetailDrawer
        title="人员详情"
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
            <Tabs key={monitorId || 'peopleDeatil'} defaultActiveKey='1' className={styles['detail-tabs']}>
              <TabPane tab="基本信息" key="1" className={styles['detailPanel']}>
                <table className={styles.itemTable}>
                  <tbody>
                    <tr><th colSpan={2} className={styles.tableHeader}>人员信息</th></tr>
                    <tr>
                      <td className={styles.peopleImgBox}>
                        <img className={styles.peopleImg} src={photograph} alt="照片" />
                      </td>
                      <td><TableForm className={styles.detailTable} dataSource={peopleInfoColumn} column={6} type='detail' /></td>
                    </tr>
                    <tr>
                      <th>备注</th>
                      <td>
                        <div className={styles.detailRemark}>{(monitorDeatilInfo && monitorDeatilInfo.remark) || ''}</div>
                      </td></tr>
                  </tbody>
                </table>
                <TableForm dataSource={drivingLicenseColumn} column={8} type='detail' header='驾驶证信息' />
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
            monitorInfo={monitorDeatilInfo}
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
          {loading && <Spin className={styles.spinning} spinning />}
        </div>
      </DetailDrawer>
    );
  }
}
export default Index;
