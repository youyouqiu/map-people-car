import React, { Component } from 'react'
import { Button, message } from 'antd'
import styles from './index.module.less'
import Popconfirm from '@/common/popconfirm'
import { IDetail } from '../type'
import { DetailDrawer, OperatorContainer } from '@/common'
import OrgAddDrawer from './add'
import { frezzeMode, unfrezzeMode, deleteMode } from '@/server/dataDictionary';

interface IProps {
  visible: boolean
  closeDrawer: Function
  rowId: string
  curRow: any //点击行的详细信息
  reload: () => void //刷新列表
}

interface IState {
  dataSource: IDetail
  pName: string
  rowId: string
  addVisible: boolean | undefined
  workType: boolean
  currentState: boolean
}

const detials = [
  {
    name: '作业模式',
    key: 'modeName',
  },
  {
    name: '作业类型',
    key: 'modeType',
  },
  {
    name: '关联车辆/岗位类型',
    key: 'monitorCategoryStr',
  },
  {
    name: '备注',
    key: 'remark',
  },
]

class WorkModeDetailDrawer extends Component<IProps, IState> {

  constructor(props: IProps) {
    super(props)
    this.state = {
      dataSource: {},
      pName: '',
      rowId: this.props.rowId,
      addVisible: undefined,
      workType: true, //控制表格渲染格式
      currentState: false // 当前状态  false已冻结  true未冻结 
    }
  }

  /**
   * 抽屉底部
   */
  drawFooter = () => {
    return (
      <div style={{ textAlign: 'left' }}>
        <Button onClick={this.closeDrawer} style={{ marginLeft: 8 }}>
          取消
                </Button>
      </div>
    )
  }

  closeDrawer = () => {
    this.props.closeDrawer()
  }

  /**
   * 修改组织
   */
  showUpdateDrawer = () => {
    this.setState({
      addVisible: true,
    })
  }
  closeAddDrawer = () => {
    this.setState({
      addVisible: false,
    })
  }

  /**
   * 删除作业模式
   */
  delConfirm = async () => {
    const res = await deleteMode(this.props.rowId)
    if (res) {
      message.success('删除成功');
      this.closeDrawer()
      this.props.reload()
    }
  }
  /**
   * 冻结、恢复作业模式
   */
  toggleEnableConfirm = async () => {
    let res
    if (this.state.currentState) {
      res = await frezzeMode(this.props.rowId);
    } else {
      res = await unfrezzeMode(this.props.rowId);
    }
    if (res) {
      message.success(this.state.currentState ? '冻结成功' : '解冻成功')
      this.props.reload()
      this.setState({
        currentState: !this.state.currentState
      })
    }
  }

  static getDerivedStateFromProps(props: IProps, state: IState) {
    if (props.curRow.enabled !== state.currentState) {
      return {
        currentState: props.curRow.enabled,
      };
    }
    return null;
  }

  render() {
    const { visible, rowId, curRow, reload } = this.props
    const { addVisible, currentState } = this.state
    console.log('urRow.modeType', curRow.modeType);

    return (
      <DetailDrawer
        title="作业模式详情"
        width={720}
        visible={visible}
        onClose={this.closeDrawer}
      >
        <div className={styles['detail-wrapper']}>
          <div className={styles['left-box']}>
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
                  {detials.map((item: { name: string; key: string }) => {
                    let value = curRow[item.key] || '--'
                    let name = item.name
                    if (item.key == 'modeType') {
                      const s = ["机器作业", "人工作业", "垃圾清运", "垃圾转运"]
                      value = s[curRow.modeType]
                    }
                    if (item.key == 'monitorCategoryStr') {
                      name = curRow.modeType == 1 ? '关联岗位类型' : '关联车辆类型'
                    }
                    return (
                      <tr key={item.key}>
                        <th className={styles['tit']}>{name}</th>
                        <td className={styles['body']}>{value}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <OperatorContainer>
            <ul className={styles['basic-box']}>
              <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                <div className={styles['tit']}>{curRow.modeName || '--'}</div>
              </li>
              <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                <div className={styles['tit']}>状态:</div>
                <div className={styles['con']}>
                  {currentState ? '正常' : '冻结'}
                </div>
              </li>
              <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                <div className={styles['tit']}>最后修改时间:</div>
                <div className={styles['con']}>{curRow.updateDataTime || '--'}</div>
              </li>
            </ul>
            <Button
              block
              onClick={this.showUpdateDrawer}
            >
              修改
                        </Button>
            <Popconfirm
              title={currentState ? "确认是否冻结此作业模式？" : "确认是否恢复此作业模式？"}
              onConfirm={this.toggleEnableConfirm}
              cancelText="取消"
              okText="确定"
            >
              <Button block>{currentState ? '冻结' : '恢复'}</Button>
            </Popconfirm>
            <Popconfirm
              title="删除后无法恢复,确认是否删除记录？"
              onConfirm={this.delConfirm}
              cancelText="取消"
              okText="确定"
            >
              <Button block>删除</Button>
            </Popconfirm>
          </OperatorContainer>
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
    )
  }
}
export default WorkModeDetailDrawer
