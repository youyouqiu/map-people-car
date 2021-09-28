/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
import { Form, Tabs, Row, Col, Table, Input, message, Spin, Badge } from 'antd';
import TableForm from '@/common/tableForm';
import styles from './index.module.less'
import EditDrawer from "../component/editDrawer";
import { auditsDetail, auditsApprove, monitorShiftChangeStatus, beforeShiftDetail } from '@/server/auditsManagement'
import { IAudit, workModeItem } from '../type'
import AuditsMap from '../component/auditsMap'
import { OperatorContainer } from '@/common';
import moment from 'moment';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface IProps {
  visible: boolean,
  closeDrawer: Function,
  reload: Function,
  workId: string,
  enterpriseId: string,
}

interface IState {
  dataSource: any;
  oldDataSource: any;
  oldColumns: any;
  oldLongLat: Array<Array<string>>;
  currentLongLat: Array<Array<string>>;
  workType: number | undefined | string;
  workId: string;
  loading: boolean;
  workTitle: string;
  workAuditData: any;
  basicReddot: boolean;
  rosterReddot: boolean;
  rosterDataSource: any;
  beforeShiftDataSource: any;
  enterpriseId: string,
}

const textRender = (data: any, record: any) => {
  const monitorId = record.monitorId;
  if (data && data.length) {
    return (
      <ul style={{ textAlign: 'left' }}>
        {
          data.map((item: any, index: number) => {
            const text = item.split(',')
            const key = `${monitorId}_${index}`
            return (
              <li key={key}>
                <span style={{ display: 'inline-block', width: 50 }}>{`${text[0]}:`}</span>
                <span>{text[1]}</span>
              </li>
            )
          })
        }
      </ul>
    )
  }
};


const rosterColumns: any = [
  {
    title: '监控对象',
    dataIndex: 'monitorName',
    key: 'monitorName',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      const changeStatus = record.changeStatus;
      const modeName = record.modeName;
      return (
        <div style={{ position: 'relative' }}>
          <span >{text}{changeStatus == 1 ?
            <Badge color='red' style={{ position: 'absolute', top: -20, left: 90 }} /> : null}
          </span>
          <br />
          <span style={{ marginTop: 8 }}>{`(${modeName ? modeName : '--'})`}</span>
        </div>
      )
    }

  },
  {
    title: '星期一',
    dataIndex: 'mondayShow',
    key: 'mondayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期二',
    dataIndex: 'tuesdayShow',
    key: 'tuesdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期三',
    dataIndex: 'wednesdayShow',
    key: 'wednesdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期四',
    dataIndex: 'thursdayShow',
    key: 'thursdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期五',
    dataIndex: 'fridayShow',
    key: 'fridayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期六',
    dataIndex: 'saturdayShow',
    key: 'saturdayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
  {
    title: '星期天',
    dataIndex: 'sundayShow',
    key: 'sundayShow',
    align: 'center',
    width: 160,
    render: (text: any, record: any) => {
      return textRender(text, record);
    }
  },
]

class AuditDrawer extends Component<IProps, IState, any> {
  currentWorkObjectRef: any = React.createRef();
  reviewStatus: '';
  constructor(props: IProps) {
    super(props)
    this.state = {
      oldColumns: [],
      dataSource: [],
      oldDataSource: [],
      oldLongLat: [],
      currentLongLat: [],
      workType: undefined,
      workId: '',
      loading: true,
      workTitle: '',
      workAuditData: undefined,
      basicReddot: false,
      rosterReddot: false,
      rosterDataSource: [],
      beforeShiftDataSource: [],
      enterpriseId: ''
    }
  }

  componentDidMount() {
    const { enterpriseId, workId } = this.props;
    this.setState({
      workId,
      enterpriseId
    }, () => {
      this.getAuditsDetail(enterpriseId, workId);
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { visible, enterpriseId, workId, } = nextProps;

    if (!visible) return;
    if (this.props.visible === visible) return;
    this.setState({
      loading: true,
      workId,
      enterpriseId,
      beforeShiftDataSource: []
    }, () => {
      this.getAuditsDetail(enterpriseId, workId);
    });
  }

  /**
   * 获取审批详情数据
   */
  async getAuditsDetail(enterpriseId: string, workId: string) {
    const changeStatus: any = await monitorShiftChangeStatus({ workId: workId });
    const auditsDetailData: any = await auditsDetail({ enterpriseId, workId });

    if (changeStatus != undefined) {
      this.setState({
        rosterReddot: changeStatus
      }, () => {
        if (auditsDetailData) {
          this.auditsBasicRender(auditsDetailData);
          this.auditsRosterRender(auditsDetailData);
        }
      });
    }
  }


  /**
   * 审批基本信息渲染
   */
  auditsBasicRender = (data: IAudit) => {
    let { workTitle, basicReddot } = this.state;
    const detail: any = data.currentWorkObjectDetail;
    const oldDetail = data.lastApproveWorkObjectDetail;
    const workType = detail.workType;
    const workModeList = detail.workModeList;
    const dataSource: any = [];
    const oldColumns: any = []
    const oldDataSource: any = [];
    let columOldData: any = {};
    const columOldobj: any = {};

    const facilityNum = detail.extendObj ? detail.extendObj.facilityNum : ''

    const newData: any = {
      workName: detail.workName,
      workType: detail.workType,
      enterpriseName: detail.enterpriseName,
      sectionName: detail.sectionName,
      roadWidth: detail.roadWidth,
      roadLength: detail.roadLength,
      area: detail.area,
      facilityNum: facilityNum,
      groupLeader: detail.groupLeader,
      contactName: detail.contactName,
      contactPhone: detail.contactPhone,
      remark: detail.remark,
    }

    this.getAuditWorkTypeData(workType, newData);

    const aProps = Object.getOwnPropertyNames(newData);

    if (oldDetail) {
      const oldWorkModeList = oldDetail.workModeList;
      const newOldData: any = {
        workName: oldDetail.workName,
        workType: oldDetail.workType,
        enterpriseName: oldDetail.enterpriseName,
        sectionName: oldDetail.sectionName,
        roadWidth: oldDetail.roadWidth,
        roadLength: oldDetail.roadLength,
        area: oldDetail.area,
        facilityNum: oldDetail.extendObj ? oldDetail.extendObj.facilityNum : '',
        groupLeader: oldDetail.groupLeader,
        contactName: oldDetail.contactName,
        contactPhone: oldDetail.contactPhone,
        remark: oldDetail.remark,
      }


      this.getAuditWorkTypeData(workType, newOldData);
      columOldData = JSON.parse(JSON.stringify(newOldData));


      /**基本信息数据组装 */
      for (let i = 0; i < aProps.length; i++) {
        const key = aProps[i]
        let item;
        if (newData[key] === newOldData[key]) {
          item = {
            name: this.labalRender(key),
            key: key
          }

          if (key != 'workType' && key != 'enterpriseName' && key != 'sectionName') {
            oldColumns.push({
              title: this.labalRender(key),
              dataIndex: key,
              key: key,
              align: 'center'
            });

            columOldobj[key] = '';
          }
        } else {
          key == 'facilityNum' ? item = {
            name: this.labalRender(key), key: key
          } : item = {
            name: <div className={styles['point']}><span></span>{this.labalRender(key)}</div>, key: key
          };

          if (key != 'workType' && key != 'enterpriseName' && key != 'sectionName') {
            oldColumns.push({
              title: this.labalRender(key),
              dataIndex: key,
              key: key,
              align: 'center'
            });
            key == 'facilityNum' ? columOldobj[key] = '' : columOldobj[key] = '修改';
          }

          key == 'facilityNum' ? basicReddot = false : basicReddot = true;
        }

        dataSource.push(item);
      }

      /**工作模式 */
      if (workModeList.length === oldWorkModeList.length) {
        this.getWorknumDifferent(workModeList, oldWorkModeList, oldColumns, dataSource, detail, basicReddot);
        this.getOldWorkModeDifferent(workModeList, oldWorkModeList, columOldobj, columOldData);
      } else {
        const addList = this.getArrDifference(workModeList, oldWorkModeList);
        const newWorkModeList = JSON.parse(JSON.stringify(workModeList));

        addList.map((addItem: any) => {
          const workModeId = addItem.workModeId;
          const workNum = addItem.workNum;
          const workModeName = addItem.workModeName;
          const workType = addItem.workType;
          const unitType = addItem.unitType;

          workModeList.map((item: any, index: number) => {
            if (workModeId == item.workModeId) {
              newWorkModeList.splice(index, 1);
            }
          });

          const addObj = {
            name: <div className={styles['point']}><span></span>{workModeName}</div>,
            key: workModeId
          }

          columOldobj[workModeId] = '新增';
          columOldData[workModeId] = this.workModeUnit(workType, unitType, workNum);;

          detail[workModeId] = this.workModeUnit(workType, unitType, workNum);

          dataSource.splice(7, 0, addObj);
          oldColumns.splice(4, 0, { title: workModeName, key: workModeId, dataIndex: workModeId, align: 'center' });
        });

        basicReddot = true

        this.getWorknumDifferent(newWorkModeList, oldWorkModeList, oldColumns, dataSource, detail);
        this.getOldWorkModeDifferent(newWorkModeList, oldWorkModeList, columOldobj, columOldData);
      }

      oldDataSource.push(columOldData, columOldobj);

    } else {
      const oldDataSourceObj: any = {};
      for (let i = 0; i < aProps.length; i++) {
        const key = aProps[i]
        const obj = {
          name: this.labalRender(key),
          key: key
        }

        if (key != 'workName' && key != 'enterpriseName' && key != 'sectionName') {
          oldColumns.push({
            title: this.labalRender(key),
            dataIndex: key,
            key: key,
            align: 'center'
          });
        }

        dataSource.push(obj);
        oldDataSourceObj[key] = this.dataParsing(key, newData[key])
      };

      for (const i in Object.keys(workModeList)) {
        const workModeName = workModeList[i].workModeName;
        const workModeId = workModeList[i].workModeId;
        const workNum = workModeList[i].workNum;
        const workType = workModeList[i].workType;
        const unitType = workModeList[i].unitType
        const obj = {
          name: workModeName,
          key: workModeId
        }

        detail[workModeId] = this.workModeUnit(workType, unitType, workNum);
        oldDataSourceObj[workModeId] = this.workModeUnit(workType, unitType, workNum);


        dataSource.splice(7, 0, obj);
        oldColumns.splice(4, 0, { title: workModeName, dataIndex: workModeId, key: workModeId, align: 'center' });
      };

      oldDataSource.push(oldDataSourceObj, {});
    };

    if (workType == 1) {
      detail.workType = '作业线路'
      workTitle = '作业线路审核'
    } else if (workType == 2) {
      detail.workType = '作业区域'
      workTitle = '作业区域审核'
    } else {
      detail.workType = '清运区域'
      workTitle = '清运区域审核'
    }

    this.currentWorkObjectRef.current.resetFields();
    this.currentWorkObjectRef.current.setFieldsValue(detail);
    this.currentWorkObjectRef.current.setFieldsValue({ 'facilityNum': facilityNum })

    this.setState({
      oldColumns: oldColumns,
      oldDataSource: oldDataSource,
      dataSource: dataSource,
      workAuditData: detail,
      workType,
      workTitle,
      basicReddot,
      loading: false,
      currentLongLat: detail == undefined ? [] : detail.longLat,
      oldLongLat: oldDetail == undefined ? [] : oldDetail.longLat,
    });
  };

  /**
   * 原作业详情数据解析
   */
  dataParsing = (key: string, item: string | number) => {
    if (key == 'workType') {
      switch (item) {
        case 1:
          return '作业线路'
        case 2:
          return '作业区域'
        case 3:
          return '清运区域'
      }
    }

    return item;
  }


  /**
   * 审批排班信息渲染
   */
  auditsRosterRender = (data: IAudit) => {
    const currentMonitorShift = data.currentMonitorShift;
    if (currentMonitorShift) {
      this.setState({
        rosterDataSource: currentMonitorShift
      });
    };
  }


  /**
   * 作业详情与原作业详情长度相同,比较是否修改
   */
  getWorknumDifferent = (workModeList: Array<workModeItem>, oldWorkModeList: Array<workModeItem>, oldColumns: any, dataSource: any, detail: any, basicReddot?: boolean) => {
    const _this = this;
    return workModeList.filter(function (item: any) {
      const id = item.workModeId;
      const name = item.workModeName;
      const workNum = item.workNum;
      const workType = item.workType;
      const unitType = item.unitType;
      return oldWorkModeList.some((oldItem: any) => {
        const oldId = oldItem.workModeId;
        const oldWorkNum = oldItem.workNum;
        if (id == oldId) {
          if (workNum == oldWorkNum) {
            item = {
              name: name,
              key: id
            }
          } else {
            item = {
              name: <div className={styles['point']}><span></span>{name}</div>,
              key: id
            }

            basicReddot = true
          }

          detail[id] = _this.workModeUnit(workType, unitType, workNum);
          oldColumns.splice(4, 0, { title: name, key: id, dataIndex: id, align: 'center' });
          dataSource.splice(7, 0, item);
          console.log('basicReddot', basicReddot);

        }
      });
    });
  };

  /**
   * 工作模块单位设置
   * @param workType 
   * @param unitType 
   * @param workNum 
   */
  workModeUnit = (workType: number, unitType: string, workNum: string) => {
    if (workType === 1) {
      let unit;
      if (unitType === 'trips') {
        unit = '趟'
      } else if (unitType === 'peopleNum') {
        unit = '人'
      }
      return workNum + unit
    } else {
      const data = workNum.split(',');
      return `${data[0]}趟${data[1]}次`
    }
  }


  /***
   *作业详情与原作业详情长度不相同,取出不同
   */
  getArrDifference = (arr1: Array<string>, arr2: Array<string>) => {
    return arr1.filter(function (v: any) {
      return !arr2.some((item: any) => v.workModeId === item.workModeId);
    });
  }


  /**
   * 原作业详情数据组装,判断是否修改，新增
   */
  getOldWorkModeDifferent = (list: any, oldList: any, columOldobj: any, columOldData: any) => {
    const _this = this;
    return list.filter(function (item: any) {
      const id = item.workModeId;
      return oldList.some((oldItem: any) => {
        const oldId = oldItem.workModeId;
        const unitType = oldItem.unitType;
        const workNum = oldItem.workNum;
        const workType = oldItem.workType;

        if (id == oldId) {
          columOldData[oldId] = _this.workModeUnit(workType, unitType, workNum)
          if (item.workNum == oldItem.workNum) {
            columOldobj[id] = '';
          } else {
            columOldobj[id] = '修改';
          }
        }
      });
    });
  };



  /**
   * 根据审核类型,显示不同审核数据
   */
  getAuditWorkTypeData = (workType: number, data: any) => {
    if (workType == 1) { //作业线路
      delete data.area;
      delete data.facilityNum;
    } else if (workType == 2) { //作业区域
      delete data.roadWidth;
      delete data.roadLength;
      delete data.facilityNum
    } else {  //清运区域
      delete data.roadWidth;
      delete data.roadLength;
    }
  }


  labalRender = (key: string) => {
    switch (key) {
      case 'workName':
        return '作业对象名称'
      case 'workType':
        return '作业对象类型'
      case 'enterpriseName':
        return '负责企业'
      case 'sectionName':
        return '所属标段'
      case 'roadWidth':
        return '宽度(m)'
      case 'roadLength':
        return '长度(m)'
      case 'groupLeader':
        return '管理组长'
      case 'contactName':
        return '负责人'
      case 'contactPhone':
        return '负责人电话'
      case 'remark':
        return '备注';
      case "area":
        return '面积(m²)';
      case 'facilityNum':
        return '设备个数';
      default:
        return ''
    };
  };

  /**
   * 关闭抽屉
   */
  closeDrawer = () => {
    const {
      closeDrawer
    } = this.props;

    this.setState({
      basicReddot: false,
      rosterReddot: false,
    });

    this.resetForm();
    closeDrawer();
  }

  /**
   * 重置表单
   */
  resetForm = () => {
    if (this.currentWorkObjectRef.current) {
      this.currentWorkObjectRef.current.resetFields();
    }
  }

  replaceTime = (time: string) => {
    const timearr = time.replace(" ", ":").replace(/\:/g, "-").split("-");
    return `${timearr[0]}-${timearr[1]}-${timearr[2]}`
  }

  /**
   * 渲染头部基础信息
   */
  renderTop = (workAuditData: any) => {
    if (workAuditData) {
      return (<ul className={styles['basic-box']}>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>{workAuditData.workName}</div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>主管单位</div>
          <div className={styles['con']}>
            {workAuditData.orgName}
          </div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>申请日期:</div>
          <div className={styles['con']}>{this.replaceTime(workAuditData.updateDataTime)}</div>
        </li>
        <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
          <div className={styles['tit']}>最后修改时间:</div>
          <div className={styles['con']}>{moment(workAuditData.reviewTime).format('YYYY-MM-DD HH:mm')}</div>
        </li>
      </ul>);
    }
  }

  /**
   * 审核表单提交
   */
  async formSubmit() {
    const values = this.currentWorkObjectRef.current.getFieldsValue();
    const { workId } = this.state;
    const param = {
      reviewOpinion: values.reviewOpinion,
      workId: workId,
      reviewStatus: this.reviewStatus
    }
    const response = await auditsApprove(param);

    if (response) {
      message.success('审核成功');
      this.closeDrawer();
      this.props.reload();
    }
  }

  //获取点击通过或不通过
  onGetReviewStatus = (reviewStatus: any) => {
    this.reviewStatus = reviewStatus;
  }

  /**
   * 获取原排班信息
   */
  async getBeforeShiftDetail(record: any) {
    const { enterpriseId } = this.state;
    const param = {
      enterpriseId: enterpriseId,
      workId: record.workId,
      monitorId: record.monitorId
    }
    const data = [];
    const resposne: any = await beforeShiftDetail(param);
    if (resposne) {
      const monitorName = resposne.monitorName;
      const modeName = resposne.modeName;
      if (monitorName && modeName) {
        data.push(resposne)
      }
      this.setState({
        beforeShiftDataSource: data
      })
    }
  }


  render() {
    const {
      visible,
    } = this.props;

    const {
      oldColumns,
      oldDataSource,
      dataSource,
      currentLongLat,
      oldLongLat,
      workType,
      workTitle,
      loading,
      workAuditData,
      basicReddot,
      rosterReddot,
      rosterDataSource,
      beforeShiftDataSource,
      workId
    } = this.state;

    return (
      <EditDrawer
        title={workTitle}
        visible={visible}
        onClose={this.closeDrawer}
        onConfirm={this.formSubmit.bind(this)}
        onGetReviewStatus={this.onGetReviewStatus}
        width={1240}
      >
        <div className={styles['detail-wrapper']}>
          <div className={styles['left-box']}>
            <Form ref={this.currentWorkObjectRef}
              style={{ height: '100%', overflowY: 'scroll' }}
            >
              <Tabs>
                {/* 基本信息 */}
                <TabPane
                  tab={<span>基本信息 {basicReddot ? <Badge style={{ position: 'relative', left: 5, top: -5 }} color='red' /> : null}</span>}
                  key="1"
                  className={styles['tab-pane']}
                  style={{ height: '100%' }}
                >

                  <Row>
                    <Col span={6}>
                      <TableForm
                        dataSource={dataSource}
                        type='detail'
                      >
                      </TableForm>
                    </Col>
                    <Col span={18}>
                      <AuditsMap
                        currentLongLat={currentLongLat}
                        oldLongLat={oldLongLat}
                        workType={workType}
                        edit={'audit'}
                        workId={workId}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <h5 className={styles['oldWordTitle']}>原作业详情</h5>
                      <Table
                        columns={oldColumns}
                        dataSource={oldDataSource}
                        rowKey={(record) => record.dataIndex}
                        pagination={false}
                        bordered={true}
                        size='small'
                      />
                    </Col>
                  </Row>
                  {/* </Form> */}
                </TabPane>

                {/* 排班信息 */}
                <TabPane
                  tab={<span>排班信息{rosterReddot ? <Badge style={{ position: 'relative', left: 5, top: -5 }} color='red' /> : ''}</span>}
                  key="2"
                  className={styles['tab-pane']}
                  style={{ height: '100%' }}
                >
                  <Row>
                    <Col span={24}>
                      <Table
                        columns={rosterColumns}
                        dataSource={rosterDataSource}
                        pagination={false}
                        bordered={true}
                        rowKey={(record) => record.dataIndex}
                        scroll={{ x: 1050, y: 320 }}
                        onRow={(record, index) => {
                          return {
                            onClick: this.getBeforeShiftDetail.bind(this, record, index)
                          }
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} style={{ marginTop: 5 }}>
                      <h5 className={styles['oldWordTitle']}>原作业排班</h5>
                      <Table
                        rowKey={(record) => record.dataIndex}
                        showHeader={false}
                        columns={rosterColumns}
                        dataSource={beforeShiftDataSource}
                        pagination={false}
                        bordered={true}
                        scroll={{ x: 1050, y: 100 }}
                      />
                    </Col>
                  </Row>
                </TabPane>
              </Tabs>
              <Row style={{ marginTop: 8 }}>
                <Col span={3}>
                  <div
                    style={{ marginTop: 25, marginLeft: 15, color: '#5d5a5a', fontSize: 14, fontWeight: 600 }}>
                    审核意见:
                                    </div>
                </Col>
                <Col span={20}>
                  <Form.Item name='reviewOpinion'>
                    <TextArea name='reviewOpinion' placeholder='请输入审核意见' rows={3} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          <OperatorContainer>
            {this.renderTop(workAuditData)}
          </OperatorContainer>
        </div>
        {/* 加载框 */}
        {
          loading && (
            <Spin
              spinning
              className={styles['loading']}
            />
          )
        }
      </EditDrawer >
    )
  }

}

export default AuditDrawer