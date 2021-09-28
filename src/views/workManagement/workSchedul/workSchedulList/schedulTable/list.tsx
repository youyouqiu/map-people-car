import React, { Component } from 'react'
import { Modal, Form, Select, message, Checkbox, Button } from 'antd'
import { PlusOutlined, ShrinkOutlined } from '@ant-design/icons'
import {
  modifyShift,
  queryModeMonitors,
  checkShift,
} from '@/server/workManagement'
import {
  getShiftListByOrgId,
} from '@/server/workManagement'
import { FormInstance } from 'antd/lib/form'
import Name from './name'
import { cloneDeep } from 'lodash'
import {getStore} from '@/framework/utils/localStorage';
import DetailList from './detailList'

/**
 *
 * @param target 深拷贝
 */
function deepClone(target: any): any {
  let result
  if (typeof target === 'object') {
    if (Array.isArray(target)) {
      result = []
      for (const i in target) {
        result.push(deepClone(target[i]))
      }
    } else if (target === null) {
      result = null
    } else if (target.constructor === RegExp) {
      result = target
    } else {
      result = {}
      for (const i in target) {
        ;(result as any)[i] = deepClone(target[i])
      }
    }
  } else {
    result = target
  }
  return result
}
interface NodeTata {
  name: string // 作业人员名字
  id: number // 作业对象ID
  schedul: [][] // 排班详情
}
interface IState {
  dataSource: any[]
  oldDataSource: any[]
  addVisible: boolean
  schedulVisible: boolean
  currentSchedulId: number
  currentSchedulName: string
  currentSchedulIndex: number
  workObjectList: any[] //监控对象列表
  workModeList: any[] //作业模式列表
  banchiList: any[] //班次列表
  modeId: string //模式id
  monitorType: string //对象类型
  currentMonitorName: string //当前作业对象
  monitorId: string
  monitorList: any[] // 新增时 监控对象列表
  expand: number
  checkBoxValue: string[] | undefined //修改班次时的默认框
}
interface IProps {
  schedulList: any[]
  workType: string //是否机动组排班
  currentWorkName: string //当前作业对象
  enterpriseId: string //企业id
  sectionId: string //标段id
  workId: string //作业id
  reload: Function //刷新页面
  type: string //类型 work 机动组 monitor 监控对象
  page: number
  pageSize: number
  workMode: any //当前作业对象对应的作业模式
}
class List extends Component<IProps, IState> {
  formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>()
  state = {
    dataSource: [
      {
        monitorName: '',
        id: 0,
        schedul: [],
      },
    ],
    oldDataSource: [],
    schedulList: [],
    addVisible: false,
    schedulVisible: false,
    currentSchedulId: 0,
    currentSchedulName: '',
    currentSchedulIndex: 0,
    workObjectList: [],
    workModeList: [],
    banchiList: [],
    modeId: '',
    monitorType: '',
    monitorId: '',
    monitorList: [],
    expand: 0,
    currentMonitorName: '',
    checkBoxValue: [],
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { schedulList, enterpriseId, sectionId, workId } = nextProps
    this.setState({
      dataSource: schedulList,
    })
    //设置新增时作业模式下拉选项
    if (
      workId &&
      (this.props.workId != workId || this.props.sectionId != sectionId)
    ) {
      // console.log('nextprops', sectionId);
      ;(async () => {
        const params = {
          enterpriseId: enterpriseId,
          monitorCategory: 0,
          sectionId: sectionId,
          workId: workId,
        }
        const { data } = await queryModeMonitors<any>(params)
        if (data) {
          this.setState({
            workObjectList: data,
          })
        }
      })()
      this.getModeList(sectionId)
      this.formRef.current?.resetFields()
    }
  }
  getModeList = async (sectionId: string) => {
    this.setState({
      workModeList: [],
      workObjectList: [],
    })
    if (sectionId) {
      const data = await getShiftListByOrgId<any>({ sectionId })
      this.setState({
        banchiList: data,
      })
    }
  }
  //作业模式改变获取不同的监控对象
  handleModeChange = async (id: any) => {
    const { enterpriseId, sectionId, workId } = this.props
    const res: any = this.props.workMode.find((item: any) => item.workModeId == id)
    const value = res?.monitorCategory || ''
    const params = {
      enterpriseId: enterpriseId,
      monitorCategory: value,
      sectionId: sectionId,
      workId: workId,
    }
    if (value) {
      this.formRef.current?.setFieldsValue({
        monitorId: null,
      })
      const { data } = await queryModeMonitors<any>(params)
      if (data) {
        this.setState({
          workObjectList: data,
        })
      }
    }
  }
  // 表单提交
  formSubmit = async () => {
    this.hideModal()
    const { enterpriseId, sectionId, workId } = this.props
    let data: any = {}

    this.formRef.current?.validateFields().then(async (values: any) => {
      //获取模式Id
      const target: any = this.props.workMode.find(
        (item: any) => item.workModeId == values.id
      )
      const modeId = target.workModeId
      //获取监控对象类型
      const target2: any = this.state.workObjectList.find(
        (item: any) => item.monitorId == values.monitorId
      )
      const monitorType = target2.monitorType
      const monitorName = target2.monitorName

      data = {
        ...values,
        changeType: 0,
        enterpriseId,
        modeId,
        workId,
        sectionId,
        monitorName,
        monitorType,
      }
      const res = await modifyShift(data)
      if (res) {
        message.success('添加成功')
        this.getModeList(sectionId)
        this.reload()
        this.formRef.current?.resetFields()
      }
    })
  }
  //刷新页面
  reload = () => {
    this.props.reload()
  }
  // 添加监控对象
  addMonitorObject = () => {
    this.setState({
      addVisible: true,
    })
  }
  //隐藏新增
  hideModal = () => {
    this.setState({
      addVisible: false,
    })
  }
  // 表单提交
  formSubmit2 = async () => {
    const { enterpriseId, workId, sectionId } = this.props
    if(this.state.checkBoxValue.length == 0){
      return message.warning('请选择班次！')
    }
    const {
      checkBoxValue,
      expand,
      currentSchedulIndex,
      monitorId,
      monitorType,
      modeId,
      currentMonitorName,
    } = this.state
    this.hideModal2()
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]
    let oldSchedul: any[] = []
    this.state.dataSource.forEach((item: any) => {
      if (item.monitorId == monitorId) {
        oldSchedul = item.schedul
      }
    })
    //原来的
    const namedSchedul: any = {}
    const namedShiftTime: any = {}
    oldSchedul.forEach((item, index) => {
      namedSchedul[days[index]] = item.map((item: string) => item.split(',')[0])
      namedShiftTime[days[index]] = item.map(
        (item: string) => item.split(',')[1]
      )
    })
    const namedSchedulId: any = {}
    for (const key in namedSchedul) {
      const tempIds: any = []
      this.state.banchiList.forEach((item: any) => {
        if (
          namedSchedul[key].includes(item.shiftName) &&
          namedShiftTime[key].includes(item.shiftTime)
        ) {
          tempIds.push(item.id)
        }
      })
      namedSchedulId[key] = tempIds.join()
    }
    //当修改的是合并的数据时
    // console.log('currentSchedulIndex', currentSchedulIndex);
    // console.log('expand', expand);

    if (expand > 0) {
      for (let i = 0; i < expand; i++) {
        console.log(currentSchedulIndex - i)
        namedSchedulId[days[currentSchedulIndex - i]] = checkBoxValue.join()
      }
    }
    let data: any = {}
    data = {
      ...namedSchedulId,
      changeType: 1, //修改的类型： 0：新增 1:修改，2：删除
      enterpriseId: enterpriseId,
      modeId: modeId,
      monitorId: monitorId,
      [days[currentSchedulIndex]]: checkBoxValue.join(),
      monitorType: monitorType,
      sectionId: sectionId,
      monitorName: currentMonitorName,
      workId: workId,
    }
    const token = getStore('token') || '';
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/sa/monitorShift/check')
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhr.addEventListener('load', async (e: any) => {
      console.log(e.target)
      const response = JSON.parse(e.target.response)
      if (!response.err) {
        const res = await modifyShift(data)
        if (res) {
          message.success('添加成功')
          this.reload()
        }
      }else if(response.msg == '无操作权限'){
        message.error('当前账号为组织账号，无排班操作权限')
      }
    });
    xhr.send(JSON.stringify(data));
  }
  // 班次设置
  banCiSheZhi = (record: any, index: number, width?: number) => {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]
    const defalutCheckBoxValue = record[days[index]] || ''
    this.setState({
      schedulVisible: true,
      currentSchedulId: record.id,
      currentSchedulName: record.modeName,
      currentSchedulIndex: index,
      modeId: record.modeId,
      monitorType: record.monitorType,
      monitorId: record.monitorId,
      expand: width ? width : 0,
      checkBoxValue: defalutCheckBoxValue ? defalutCheckBoxValue.split(',') : [],
    })
  }
  //隐藏新增
  hideModal2 = () => {
    this.setState({
      schedulVisible: false,
    })
  }
  //复制
  copy = async (index: number) => {
    if (index == 0) {
      message.info('无排班内容可复制')
      return
    }
    const lastArr = this.state.dataSource[index - 1].schedul
    const isNull = (lastArr as any).every((item: []) => {
      return item.length == 0
    })
    if (isNull) {
      message.info('无排班内容可复制')
      return
    }
    //设置界面
    const newDataSource = this.state.dataSource.map(
      (item: any, index2: number) => {
        if (index != index2) {
          return item
        }
        if (index > 0) {
          const lastSchedul = cloneDeep(
            this.state.dataSource[index - 1].schedul
          )
          return {
            ...item,
            schedul: lastSchedul,
          }
        }
      }
    )
    //发送请求
    const { enterpriseId, sectionId, workId } = this.props
    //拷贝内容源
    const target: any = this.props.schedulList[index - 1]
    //拷贝赋值对象
    const origin: any = this.props.schedulList[index]
    const {
      modeId = '',
      monitorType = '',
      monitorId = '',
      monitorName = '',
    } = origin
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ]
    const banci: any = {}
    for (let i = 0; i < 7; i++) {
      banci[days[i]] = target[days[i]]
    }
    const data = {
      ...banci,
      changeType: 1,
      enterpriseId,
      modeId,
      workId,
      monitorName,
      sectionId,
      monitorId,
      monitorType,
    }
    const checkRes = await checkShift<number[]>(data)
    if (checkRes?.length == 0) {
      const res = await modifyShift(data)
      if (res) {
        message.success('添加成功')
        this.setState({
          dataSource: newDataSource,
        })
        this.reload()
      }
    } else {
      message.error('排班冲突!')
    }
  }
  //删除监控对象
  delete = async (id: number) => {
    const { enterpriseId, sectionId, workId } = this.props
    //获取模式Id 监控对象类型
    const target: any = this.props.schedulList.find(
      (item: any) => item.id == id
    )
    const {
      modeId = '',
      monitorType = '',
      monitorId = '',
      monitorName = '',
    } = target
    const data = {
      changeType: 2,
      enterpriseId,
      modeId,
      workId,
      sectionId,
      monitorId,
      monitorName,
      monitorType,
    }
    const res = await modifyShift(data)
    if (res) {
      message.success('删除成功')
      this.reload()
    }
    // this.setState({
    //     dataSource: this.state.dataSource.filter((item) => {
    //         return item.id != id;
    //     }),
    // });
  }
  //清除排班
  clean = async (id: number) => {
    const { enterpriseId, sectionId, workId } = this.props
    //获取模式Id 监控对象类型
    const target: any = this.props.schedulList.find(
      (item: any) => item.id == id
    )
    const {
      modeId = '',
      monitorType = '',
      monitorId = '',
      monitorName = '',
    } = target
    const data = {
      changeType: 1,
      enterpriseId,
      modeId,
      workId,
      sectionId,
      monitorId,
      monitorName,
      monitorType,
    }
    const res = await modifyShift(data)
    if (res) {
      message.success('清除成功')
      this.reload()
    }
    const newDatasource = this.state.dataSource.map((item: any) => {
      if (item.id != id) {
        return item
      }
      return {
        ...item,
        schedul: [[], [], [], [], [], [], []],
      }
    })
    this.setState({
      dataSource: newDatasource,
    })
  }
  //添加单个排班
  addSchedule = (record: any, index: number, width?: number) => {
    this.banCiSheZhi(record, index, width)
    this.setState({
      currentMonitorName: record.monitorName,
    })
  }
  //更新
  updateData = async (
    id: string,
    index: number,
    collpseInfo: [number, number],
    initBoxInfo: [number, number]
  ) => {
    let origindata: any[] = []
    let oldSchedul: any[] = []
    const newData = this.state.dataSource.map((item: any) => {
      if (item.id != id) {
        return item
      } else if (item.id == id) {
        // console.log('改变Id:' + id);
        const schedul = item.schedul
        origindata = item.schedul[index]
        oldSchedul = item.schedul
        const ss = this.ui2data(schedul, index, collpseInfo, initBoxInfo)
        return {
          ...item,
          schedul: ss,
        }
      }
    })
    const offset = collpseInfo[0] - initBoxInfo[0]
    const addNum = collpseInfo[1] - initBoxInfo[1]
    // console.log(newData);
    // console.log('校验id:' + id);
    // console.log('偏移：' + offset);
    // console.log('新增：' + addNum);
    // console.log('初始信息', initBoxInfo);
    // console.log('合并后信息', collpseInfo);
    // console.log('星期index', index);
    let startDate
    let endDate
    let changeType = 0 //修改的类型： 0：新增 1:修改，2：删除
    if (addNum > 0 && offset == 0) {
      startDate = index + initBoxInfo[1] + 1
      endDate = index + initBoxInfo[1] + addNum
      changeType = 0
    } else if (addNum < 0 && offset == 0) {
      startDate = index + 1
      endDate = index + collpseInfo[1]
      changeType = 1
    } else if (addNum < 0 && offset > 0) {
      startDate = index + collpseInfo[0] + 1
      endDate = index + initBoxInfo[1]
      changeType = 1
    } else if (addNum > 0 && offset < 0) {
      startDate = index + initBoxInfo[0] - addNum + 1
      endDate = index + initBoxInfo[0]
      changeType = 0
    }
    // console.log('校验开始日期:星期' + startDate);
    // console.log('校验结束日期:星期' + endDate);
    // const { schedul } = newData.find((item) => item.id == id);
    const { schedul } = newData.find((item) => item.id == id)
    const res: any = this.state.dataSource.find((item: any) => item.id == id)

    const isSame = schedul.every((element: any, index: number) => {
      return element.length == res.schedul[index].length
    })
    if (!isSame) {
      this.dragUpdate(schedul, id, changeType)
      this.setState({
        oldDataSource: deepClone(this.state.dataSource),
        dataSource: newData,
      })
    }
  }
  /**
   *
   * @param originData 拖动盒子的数据 以此为基础设置新增的数据
   * @param from 星期几开始（包含）
   * @param to 星期几结束（包含）
   * @param id 监控对象Id
   * @param changeType 修改的类型： 0：新增 1:修改，2：删除
   * @param oldSchedul 当前行的原始数据
   */
  dragUpdate = async (originData: any[], id: string, changeType: number) => {
    if (originData) {
      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
      const { enterpriseId, sectionId, workId } = this.props
      //获取模式Id 监控对象类型
      const target: any = this.props.schedulList.find(
        (item: any) => item.id == id
      )
      const {
        modeId = '',
        monitorType = '',
        monitorId = '',
        monitorName = '',
      } = target
      //根据班次字符串查询班次id 新增的
      const originDataIds = originData.map((item: any[]) => {
        const name = item.map((item: string) => item.split(',')[0])
        const shiftTime = item.map((item: string) => item.split(',')[1])
        const tempIds: any = []
        this.state.banchiList.forEach((item2: any) => {
          if (
            name.includes(item2.shiftName) &&
            shiftTime.includes(item2.shiftTime)
          ) {
            tempIds.push(item2.id)
          }
        })
        return tempIds
      })
      const banci: any = {}
      for (let i = 0; i < 7; i++) {
        banci[days[i]] = originDataIds[i].join()
      }
      const data = {
        ...banci,
        changeType: 1,
        enterpriseId,
        modeId,
        workId,
        monitorName,
        sectionId,
        monitorId,
        monitorType,
      }
      const checkRes = await checkShift<number[]>(data)
      if (checkRes?.length == 0) {
        const res = await modifyShift(data)
        if (res) {
          message.success('添加成功')
          this.reload()
        }
      } else {
        message.error('排班冲突!');
        //剔除错误时期，重新发起请求
        const worngDay: any = {}
        checkRes?.forEach((day) => {
          worngDay[days[day - 1]] = ''
        })
        const correctData = {
          ...data,
          ...worngDay,
        }
        const checkRes2 = await checkShift<number[]>(correctData)
        if (checkRes2?.length == 0) {
          const res = await modifyShift(correctData)
          if (res) {
            this.reload()
          }
        } else {
          this.setState({
            dataSource: this.state.oldDataSource,
          })
        }
      }
    }
  }

  /**
   * 更新辅助函数
   * @param arr 源数组
   * @param index 复制对象索引值
   * @param collpseInfo 合并后的信息
   * @param initBoxInfoInfo 合并前的信息
   */
  ui2data = (
    arr: string[][],
    index: number,
    collpseInfo: [number, number],
    initBoxInfo: [number, number]
  ) => {
    const _arr = deepClone(arr)
    // const [before, behand] = collpseInfo; //从Index开始，向前/后复制的条数
    const copyOrigin = _arr[index] //复制源
    const offset = collpseInfo[0] - initBoxInfo[0]
    const addNum = collpseInfo[1] - initBoxInfo[1]
    if (offset == 0 && addNum > 0) {
      //以左边为基点不动 新增
      for (let i = 0; i < collpseInfo[1]; i++) {
        _arr[index + i] = copyOrigin
      }
    } else if (offset == 0 && addNum < 0) {
      //以左边为基点不动 减少
      for (let i = 0; i < initBoxInfo[1]; i++) {
        _arr[index + i] = []
      }
      for (let i = 0; i < collpseInfo[1]; i++) {
        _arr[index + i] = copyOrigin
      }
    } else if (offset < 0 && addNum > 0) {
      //以右边为基点不动 增加
      for (let i = 0; i < addNum; i++) {
        _arr[index - i - 1] = copyOrigin
      }
    } else if (offset > 0 && addNum < 0) {
      //以右边为基点不动 减少
      for (let i = 0; i < offset; i++) {
        _arr[index + i] = []
      }
    }
    return _arr
  }

  renderModeName(name: string) {
    if (!name) return <p></p>
    if (name == '管理组长') {
      return <p>({name})</p>
    }
    return <p style={{ color: '#0a83ff' }}>({name})</p>
  }

  render() {
    const { currentWorkName, page, pageSize } = this.props
    const {
      dataSource,
      checkBoxValue,
      schedulVisible,
      currentMonitorName,
      banchiList,
      workObjectList,
      workModeList,
      addVisible,
    } = this.state
    const sortDataSource = dataSource.sort((a: any, b: any) => {
      return a.modeName == '管理组长' ? -1 : 0
    })
    return (
      <>
        {sortDataSource.map((item: any, index: number) => {
          if (index >= (page - 1) * pageSize && index < page * pageSize)
            return (
              <tr key={item.id ? item.id : Math.random()}>
                <Name
                  copy={this.copy}
                  index={index}
                  item={item}
                  id={item.id ? item.id : Math.random()}
                  clean={this.clean}
                  deleteObject={this.delete}
                  isLeader={item.modeName == '管理组长'}
                  isMobileGroup={this.props.currentWorkName == '机动组'}
                >
                  <Button
                    type="link"
                    href={
                      item.workId == '-200'
                        ? `/view/workManagement/schdulAdjust?name=${item.monitorName}&monitorId=${item.monitorId}&sectionId=${item.sectionId}&workId=${item.workId}&key=${item.sectionId}_${item.workId}_${item.sectionId}`
                        : `/view/workManagement/schdulAdjust?name=${item.monitorName}&monitorId=${item.monitorId}&sectionId=${item.sectionId}&workId=${item.workId}&key=${item.workId}_${item.sectionId}`
                    }
                  >
                    {item.monitorName}
                  </Button>

                  {this.renderModeName(item.modeName)}
                </Name>

                <DetailList
                  updateData={this.updateData}
                  record={item}
                  addSchedul={(record: any, index: number, width?: number) => {
                    this.addSchedule(record, index, width)
                  }}
                />
              </tr>
            )
        })}
        {currentWorkName != '机动组' ? (
          <tr>
            <td style={{ fontSize: '20px' }}>
              <PlusOutlined onClick={this.addMonitorObject} />
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        ) : null}
        {/* 添加作业对象 */}
        <Modal
          title="新增排班监控对象"
          visible={addVisible}
          onOk={this.formSubmit}
          onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
        >
          <Form ref={this.formRef}>
            <Form.Item label="当前作业对象">{currentWorkName}</Form.Item>
            <Form.Item
              name="id"
              label="作业模式"
              rules={[{ required: true, message: '请选择作业模式!' }]}
            >
              <Select
                placeholder="请选择作业模式!"
                onChange={this.handleModeChange}
              >
                {this.props.workMode?.map((item: any, index: number) => {
                  return (
                    <Select.Option value={item.workModeId} key={item.workModeId}>
                      {item.workModeName}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="monitorId"
              label="监控对象"
              rules={[{ required: true, message: '请输入监控对象!' }]}
            >
              <Select placeholder="请选择">
                {workObjectList.map((item: any, index: number) => {
                  return (
                    <Select.Option value={item.monitorId} key={index}>
                      {item.monitorName}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        {/* 班次设置 */}
        <Modal
          style={{ color: '#383838' }}
          title="班次设置"
          visible={schedulVisible}
          onOk={this.formSubmit2}
          onCancel={this.hideModal2}
          okText="提交"
          cancelText="取消"
        >
          <div>
            <p>
              当前监控对象:&nbsp;<span>{currentMonitorName}</span>
            </p>
          </div>
          <div>
            <p>
              <span
                style={{
                  color: 'red',
                  fontSize: '17px',
                  position: 'relative',
                  top: '3px',
                  marginRight: '5px',
                }}
              >
                *
              </span>
              班次选择:&nbsp;
            </p>
            <Checkbox.Group
              value={checkBoxValue}
              onChange={(value: string[]) => {
                this.setState({ checkBoxValue: value })
              }}
            >
              {banchiList?.map((item: any, index: number) => {
                return (
                  <Checkbox value={item.id} key={index}>
                    {`${item.shiftName} (${item.shiftTime})`}
                  </Checkbox>
                )
              })}
            </Checkbox.Group>
            <p style={{ color: 'red', margin: '10px 0 0 0' }}>
              {checkBoxValue.length == 0 ? '请选择班次！' : ''}
            </p>
          </div>
        </Modal>
      </>
    )
  }
}

export default List
