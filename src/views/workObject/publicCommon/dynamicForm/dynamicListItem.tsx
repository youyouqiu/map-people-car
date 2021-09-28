import React, { ReactText } from 'react';
import { Select, InputNumber } from 'antd';
import addButton from '@/static/image/addBtn.png';
import deleteButton from '@/static/image/deleteBtn.png';
const { Option } = Select;
import styles from './index.module.less';

interface IProps {
  type?: number; //0 新增 1 修改 默认0
  modeList: any[]; // 作业模式类型
  updateParentDate?: (data: object, index: number) => void; //调用父组件传过来的参数 更新值
  first: boolean; // 是否是第一个
  addItem?: Function; // 添加
  deleteItem?: (id: string, index: number) => void; // 删除
  modeDetailList: any[]; //用于控制用户不能选择相同的作业模式
  modeIndex: number;
  defaultValue?: {
    workNum: string;
    workType: number;
    workModeId: string;
    unitType: string;
  }; //item初始值
}
interface IState {
  ///
  workType: any; //新增类型 1 人工 0 机器
  peopleNum: any;
  carNum1: any;
  carNum2: any;
  ////
  unitType: string;
  workModeId: string;
  defaultValue?: {
    workNum: string;
    workType: number;
    workModeId: string;
    unitType: string;
  };
}

class DynamicListItem extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      workType: undefined,
      peopleNum: 1,
      carNum1: 1,
      carNum2: 1,
      unitType: '',
      workModeId: '0',
      defaultValue: this.props.defaultValue,
    };
  }
  submitData = () => {
    const { workType, workModeId, unitType, carNum1 = 0, carNum2 = 0, peopleNum = 0 } = this.state;
    const { modeList, modeIndex } = this.props;
    const originMessage: any = {};
    modeList.forEach((item: any) => {
      if (item.id === workModeId) {
        if (item.modeType == 0 || item.modeType == 2 || item.modeType == 3) {
          originMessage.car = item;
        } else {
          originMessage.people = item;
        }
      }
    });
    const { car = {}, people = {} } = originMessage;
    let res: any = {};
    res = { unitType, workType };
    if (workType == 0 || workType == 2 || workType == 3) {
      res.workNum = `${carNum1},${carNum2}`;
      res.workModeName = car.modeName;
      res.workModeId = car.id;
      res.monitorCategory = car.monitorCategory;
    } else {
      res.workNum = peopleNum;
      res.workModeName = people.modeName;
      res.workModeId = people.id;
      res.monitorCategory = people.monitorCategory;
    }
    // console.log(res);
    this.props.updateParentDate && this.props.updateParentDate(res, modeIndex);
  };
  //作业模式改变
  handleWorkTypeChange = (value: string, e: any) => {
    // console.log('handleWorkTypeChange', value, e);
    const type = e.key.split('_')[1];
    let unitType = 'peopleNum';
    if (type == 0 || type == 2 || type == 3) {
      unitType = 'trips';
    }
    this.setState(() => {
      return { workType: type, workModeId: value, unitType: unitType };
    }, this.submitData);
  };
  //人员数量改变
  handlePeopleChange = (value: ReactText) => {
    this.setState(() => {
      return { peopleNum: value, unitType: 'peopleNum' };
    }, this.submitData);
  };
  // 车辆趟数改变
  handleCarChange1 = (value: ReactText) => {
    this.setState(() => {
      return { carNum1: value, unitType: 'trips' };
    }, this.submitData);
  };
  // 车辆次数改变
  handleCarChange2 = (value: ReactText) => {
    this.setState(() => {
      return { carNum2: value, unitType: 'trips' };
    }, this.submitData);
  };
  //添加项
  add = () => {
    this.props.addItem && this.props.addItem();
  };
  //删除项
  delete = () => {
    this.props.deleteItem && this.props.deleteItem(this.state.workModeId, this.props.modeIndex);
  };
  isDisabled: (id: string) => boolean = (id) => {
    const { modeDetailList } = this.props;
    let res = false;
    modeDetailList.forEach((item: any) => {
      if (item.workModeId == id) {
        res = true;
      }
    });
    return res;
  };
  componentDidMount() {
    const { defaultValue } = this.props;
    if (!defaultValue) return;
    if (!defaultValue.workNum.toString().includes(',')) {
      //不包含逗号，说明是人员类型
      this.setState({
        workType: defaultValue.workType,
        unitType: defaultValue.unitType,
        peopleNum: Number(defaultValue.workNum),
        workModeId: defaultValue.workModeId,
      });
    } else {
      const [num1, num2] = defaultValue.workNum.split(',');
      this.setState({
        workType: defaultValue.workType,
        unitType: defaultValue.unitType,
        carNum1: Number(num1),
        carNum2: Number(num2),
        workModeId: defaultValue.workModeId,
      });
    }
  }
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { defaultValue } = nextProps;
    if (defaultValue && this.props.defaultValue != defaultValue) {
      if (!defaultValue.workNum.toString().includes(',')) {
        //不包含逗号，说明是人员类型
        this.setState({
          workType: defaultValue.workType,
          unitType: defaultValue.unitType,
          peopleNum: Number(defaultValue.workNum),
          workModeId: defaultValue.workModeId,
        });
      } else {
        const [num1, num2] = defaultValue.workNum.split(',');
        // console.log(num1, num2);
        this.setState({
          workType: defaultValue.workType,
          unitType: defaultValue.unitType,
          carNum1: Number(num1),
          carNum2: Number(num2),
          workModeId: defaultValue.workModeId,
        });
      }
    }
  }
  render() {
    const { modeList, first } = this.props;
    const { workType, peopleNum, workModeId, carNum1, carNum2 } = this.state;
    // console.log('workModeId', workModeId)

    return (
      <div>
        <div className={styles.box}>
          {/* <div>
                        <p className={styles['work-type']}>作业模式</p>
                    </div> */}
          <div className={styles['data']}>
            <Select
              onChange={this.handleWorkTypeChange}
              value={workModeId || ''}
              bordered={false}
              style={{ width: '110px' }}
              placeholder={'请选择'}
            >
              {modeList.map((item: any, index: number) => {
                return (
                  <Option value={item.id} key={`${item.id}_${item.modeType}`} disabled={this.isDisabled(item.id)}>
                    {item.modeName}
                  </Option>
                );
              })}
            </Select>
            {workType == 1 ? (
              <>
                <InputNumber
                  onChange={this.handlePeopleChange}
                  value={peopleNum}
                  size="small"
                  min={0}
                  max={100}
                  className={styles['input-num']}
                />
                <span className={styles['text']}>人</span>
              </>
            ) : null}
            {(workType == 0 || workType == 2 || workType == 3) ? (
              <>
                <InputNumber onChange={this.handleCarChange1} value={carNum1} size="small" min={0} max={100} className={styles['input-num']} />
                <span className={styles['text']}>趟</span>
                <InputNumber onChange={this.handleCarChange2} value={carNum2} size="small" min={0} max={100} className={styles['input-num']} />
                <span className={styles['text']}>车</span>
              </>
            ) : null}
          </div>
          {first ? <img src={addButton} onClick={this.add} /> : <img src={deleteButton} onClick={this.delete} />}
        </div>
      </div>
    );
  }
}
export default DynamicListItem;
