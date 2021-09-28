import React from 'react';
import DynamicListItem from './dynamicListItem';
import styles from './index.module.less';
interface IProps {
  modeList: any[]; // 作业模式类型
  modeDetail: any[]; //修改时传入的初始参数
  setModeList: (value: any[]) => void; //设置表单值
}

interface IState {
  modeDetailList: any[];
}

class DynamicForm extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      modeDetailList: [],
    };
  }
  _setModeList = () => {
    this.props.setModeList(this.state.modeDetailList);
  };
  updateData = (data: any, modeIndex: number) => {
    const newList = this.state.modeDetailList.map((item, index: number) => {
      if (index === modeIndex || item.workModeId == data.workModeId) {
        return data;
      }
      return item;
    });
    this.setState(
      () => ({
        modeDetailList: newList,
      }),
      this._setModeList
    );
  };
  delete = (id: string, modeIndex: number) => {
    this.state.modeDetailList.splice(modeIndex, 1);
    this.setState({
      modeDetailList: [...this.state.modeDetailList]
    });
    this._setModeList()
  };
  add = () => {
    if (this.state.modeDetailList.length < this.props.modeList.length) {
      this.setState({
        modeDetailList: [...this.state.modeDetailList, { workNum: '1', workType: undefined, workModeId: '', unitType: '' }],
      });
    } else {
      console.log('多了');
    }
  };
  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const { modeDetail } = nextProps;
    if (modeDetail && modeDetail != this.props.modeDetail) {
      this.setState({
        modeDetailList: modeDetail,
      });
    }
  }
  componentDidMount() {
    const { modeDetail } = this.props;
    modeDetail.length == 0 &&
      this.setState({
        modeDetailList: [{ workNum: '1', workType: undefined, workModeId: '', unitType: '' }],
      });
  }
  render() {
    const { modeDetailList } = this.state;
    return (
      <div className={styles.shouldBorder}>
        {modeDetailList.map((itemValue: any, index: number) => {
          return (
            <DynamicListItem
              modeList={this.props.modeList} //作业模式下拉框数据
              defaultValue={itemValue} // 修改时 渲染的初始数据
              updateParentDate={this.updateData}
              first={index == 0} //第一个的话就添加加号图片；否则减号图标
              key={`mode_${index}`}
              modeIndex={index}
              addItem={this.add} //新增
              deleteItem={this.delete} //删除
              modeDetailList={this.state.modeDetailList} //用于控制用户不能选择相同的作业模式
            />
          );
        })}
      </div>
    );
  }
}
export default DynamicForm;
