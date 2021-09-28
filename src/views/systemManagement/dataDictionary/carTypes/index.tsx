import React, { Component } from 'react';
import { Table, Popconfirm } from '@/common';
import { Button, message, Badge } from 'antd';
import {
  postDictCarTypePage, postDictCarTypeDisable, getDictCarTypeInfo, postDictCarTypeDelete,
  postDictCarTypeDisableId, postDictCarTypeEnableId, getDictCarCategoryDropdown,
} from '@/server/dataDictionary';
import EditCarTypes from './editCarTypes';
import { publicCarPath } from '@/framework/utils/publicCar';
import CarTypesDetail from './carTypesDetail';
import { getCurrentUserPermission } from '@/framework/utils/function';
import moment from 'moment';
/**
 * 当前页面权限
 */
const permission = getCurrentUserPermission('4_road_list');
console.log('permission', permission);

interface IState {
  addVisible: boolean | undefined;
  type: number; //抽屉类型(0:新增，1:修改)
  selectedRowKeys: [];
  selectedRows: [];
  // queryArgs: { keyword?: string }; //管理列表请求参数
  detailVisible: boolean | undefined;
  carCategoryList: [],//车辆类别-下拉列表
  rowId: string;
  curRow: any;
  carTypesInfo: any,
  refreshCount: number;
}

interface IRecord {
  id: string;
  enabled: boolean;
  selectedRowKeys?: [];
  [key: string]: any
}
interface Iprops {
  id?: string;
}
interface Icategory {// 车辆类别
  id: string,
  name: string
}
const testImg = 'http://localhost:9000/src/static/image/logo1.png';
class CarTypes extends Component<Iprops, IState> {
  tableRef: any = React.createRef();
  newData: any = {
    name: '', //车辆类型
    pid: '', //车辆类别
    remark: '', //备注
    iconId: '-1', //图标-选中的图标id
    myIconUrl: '',//类型私有图标url
    myIconId: '',//类型私有图标id
    directionStatus: '1',//图标朝向是否可变  1=可变 0=不可变
  };

  columns: any[] = [
    {
      title: '操作',
      key: 'opra',
      width: 100,
      render: (value: any, record: any) => {
        //enabled 是否启用 true：启用，false：停用
        const { enabled, enableEdit } = record;
        return (
          <>
            <Button
              // disabled={!this.hasPermission('修改')}
              // disabled={!enableEdit}
              type="link"
              onClick={(event) => this.updateOrgClick(event, record)}
              className="table-link-btn"
            >
              修改
                </Button>
                |

            <>
              <Popconfirm
                key={record.id}
                title={enabled ? "确认是否冻结此行？" : "确认是否恢复此行？"}
                onConfirm={() => this.delConfirm(record)}
                cancelText="取消"
                okText="确定"
              >
                <Button
                  className="table-link-btn"
                  type="link"
                  onClick={(event: React.MouseEvent) => {
                    event.stopPropagation();
                    this.setState({ detailVisible: false });
                  }}
                >
                  {' '}
                  {enabled && '冻结'}
                  {!enabled && '恢复'}

                </Button>
              </Popconfirm>
            </>

          </>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      filter: {
        type: false,
        key: 'enabled',
        domData: [
          {
            value: true, label: '正常'
          },
          {
            value: false, label: '冻结'
          }
        ]
      },
      width: 100,
      render: (value: number,) => {
        //enabled 是否启用 true：启用，false：停用 
        if (value) {
          return <Badge color="green" text="正常" />;
        } else {
          return <Badge color="red" text="冻结" />;
        }

      },
    },
    {
      title: '车辆类型',
      dataIndex: 'name',
      width: 200,
      key: 'name',
      // render: (value: string, record: IRecord) => {
      //     return <Button type='link' onClick={() => this.showDetailDawer(record)} >{value}</Button>
      // }
    },
    {
      title: '图标',
      dataIndex: 'iconUrl',
      width: 200,
      key: 'iconUrl',
      render: (value: string, record: IRecord) => {
        // -1 等于不选
        if (record.iconId === '-1') {
          return '--'
        }
        if (value) {
          return <img src={value} width='67' height='37' alt="车辆类型图标" />
        } else {
          return <img width='67' height='37' alt="车辆类型图标" src={publicCarPath(record.iconId)} />
        }
      },
    },
    {
      title: '所属车辆类别',
      dataIndex: 'parentName',
      key: 'parentName',
      // filter: {
      //     type: false,
      //     key: 'category',
      //     // domData: this.reqDictCarCategoryDropdown()
      //     domData: carCategoryList

      // },
      width: 150,
    },
    {
      title: '备注',
      width: 200,
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建日期',
      width: 150,
      dataIndex: 'createDataTime',
      sorterKey: 'createDataTime',
      key: 'createDataTime',
      render: (value: string) => {
        return moment(value).format('YYYY-MM-DD');
      }
    },
    {
      title: '最后修改时间',
      width: 150,
      dataIndex: 'updateDataTime',
      key: 'updateDataTime',
      sorterKey: 'updateDataTime',
      render: (value: string) => {
        return moment(value).format('YYYY-MM-DD HH:mm');
      }
    },
    {
      title: '修改人',
      width: 120,
      dataIndex: 'updateDataUsername',
      key: 'updateDataUsername',
    },
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      addVisible: undefined,
      detailVisible: undefined,
      type: 0,
      selectedRowKeys: [],
      selectedRows: [],
      carCategoryList: [],
      rowId: '',
      curRow: '',
      carTypesInfo: {},
      refreshCount: 0,
    };
  }
  componentDidMount() {
    this.reqDictCarCategoryDropdown();
  }

  /*
  车辆类别-下拉列表
  */
  async reqDictCarCategoryDropdown() {

    const datas: any = await getDictCarCategoryDropdown(null);
    if (datas) {
      const arr: any = datas.map((e: Icategory) => {
        return { value: e.id, label: e.name }
      })
      console.log(arr)
      this.setState({
        carCategoryList: arr
      })
    } else {
      return []
    }

  }

  /*
  删除
  */
  reqCarTypeDelete = (id: string, name: string) => {
    postDictCarTypeDelete({ id: id, name }).then((res: any) => {
      if (res) {
        this.setState({
          detailVisible: false
        });
        this.reload();
      }
    })
  }





  /**
   * 判断按钮权限
   * @param title 按钮名称
   */
  hasPermission = (title: string) => {
    return permission.indexOf(title) !== -1;
  };

  /**
   * 新增
   */
  addFun() {
    this.setState({
      detailVisible: false,
      addVisible: true,
      type: 0,
      carTypesInfo: { ...this.newData }
    });
  }

  /**
   * table行点击
   */
  rowClickFun = (record: any, event: any) => {
    event.stopPropagation();
    this.reqDetail(record.id, (res: any) => {
      this.setState({
        rowId: record.id,
        detailVisible: true,
        curRow: record,
        carTypesInfo: { ...res }
      });
    })
  };

  /**
   * 修改按钮
   */
  updateOrgClick = (event: any, record: IRecord) => {
    event.stopPropagation();
    const id = record.id;
    this.reqDetail(id, (res: any) => {
      this.setState({
        rowId: id,
        type: 1,
        detailVisible: false,
        addVisible: true,
        curRow: record,
        carTypesInfo: { ...res }
      });
    })
  };

  /**
   * 表格checkBox多选框改变
   */
  rowChange = (selectedRowKeys: [], rows: []) => {
    this.setState({
      selectedRowKeys,
      selectedRows: rows,
      detailVisible: false,
    });
  };



  /**
   * 关闭修改抽屉
   */
  closeAddDrawer = () => {
    this.setState({
      addVisible: false,
    });
  };
  /*
  关闭详情抽屉
  */
  closeDetailDrawer = () => {
    this.setState({
      detailVisible: false,
    });
  };
  /**
   * 显示详情抽屉
   */
  // showDetailDawer = (record: IRecord) => {
  //     // event.stopPropagation();
  //     const id = record.id;


  // };
  /*
  请求详情
  */
  async reqDetail(id: string, callback: any) {
    const data = await getDictCarTypeInfo<any>({ id: id });
    if (data) {
      callback && callback(data);
    }
  }
  /**
   * 批量冻结确定
   */
  delMoreConfirm = () => {
    this.delMore();
  };
  async delMore() {
    const { selectedRows } = this.state;
    const ids: string[] = [];
    const names: string[] = [];
    selectedRows.forEach((v: any) => {
      ids.push(v.id)
      names.push(v.name)
    })
    const datas: number | any = await postDictCarTypeDisable({ ids, names });//names: params2

    if (!datas) {
      message.success('冻结失败');
    } else {
      message.success(`冻结成功, 已冻结${datas}条数据, ${selectedRows.length - datas}冻结失败!`);
      // message.success(`冻结成功!`);
      this.setState({
        selectedRowKeys: [],
        selectedRows: []
      });
      this.reload();
    }

  }

  /**
   * 单个冻结或者恢复确定
   */
  delConfirm = (record: IRecord) => {
    if (record.enabled) {//请求冻结
      this.checkIsDisable(record.id, record.name)
    } else {// 请求恢复
      this.checkIsEnable(record.id, record.name)
    }
  }

  /**
   * 单个类型取消冻结
   * @param id
   */

  async checkIsEnable(id: string, name: string) {
    const params = {
      id: id,
      name: name
    };
    const datas = await postDictCarTypeEnableId(params);
    if (datas) {
      message.success('恢复成功');
      this.reload();
    }
  }
  /*
  单个类型冻结
  */
  async checkIsDisable(id: string, name: string) {
    const params = {
      id: id, name
    };
    const datas = await postDictCarTypeDisableId(params);
    if (datas) {
      message.success('冻结成功');
      this.reload();
    }
  }




  /**
   * 批量冻结
   */
  getDelPop = () => {
    const { selectedRows } = this.state;

    // if (!this.hasPermission('删除')) {
    //     return <Button disabled>批量冻结</Button>;
    // }

    if (selectedRows.length > 0) {
      return (
        <Popconfirm
          key={'record1'}
          title={`你确定要冻结${selectedRows.length}条记录吗？`}
          onConfirm={this.delMoreConfirm}
          cancelText="取消"
          okText="确定"
          showOk={true}
        >
          <Button>批量冻结</Button>
        </Popconfirm>
      );
    } else {
      return (
        <Popconfirm key={'record2'} title="请勾选需要冻结的行！" cancelText="取消" showOk={false}>
          <Button>批量冻结</Button>
        </Popconfirm>
      );
    }
  };

  /**
   * 刷新列表
   */
  reload = () => {
    (this.tableRef.current as any).reload();
    this.setState({
      detailVisible: false,
      addVisible: false
    })
  };


  render() {
    const { addVisible, type, selectedRowKeys, detailVisible, rowId, refreshCount, carCategoryList, carTypesInfo } = this.state;
    console.log(carCategoryList)

    return (
      <div >
        <Table

          ref={this.tableRef}
          columns={this.columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.rowChange,
          }}
          pageCallback={() => this.setState({
            selectedRowKeys: [],
            selectedRows: []
          })}
          // tree={<LeftTree onNodeSelect={this.onNodeSelect} />}
          showTree={false}
          btnGroup={[
            <Button key={Math.random()}
              // disabled={!this.hasPermission('新增')}
              type="primary" onClick={this.addFun.bind(this)}>
              新增
                        </Button>,
            this.getDelPop(),
          ]}
          queryAjax={postDictCarTypePage}
          settingQuery={{
            key: 'keyword', //模糊查询参数
            placeholder: '请输入车辆类型',
          }}
          settingQueryStyle={{ width: 270 }}
          // queryArgs={queryArgs}
          rowClick={this.rowClickFun.bind(this)}
          scroll={{ y: 'calc(100vh - 340px)' }}
        />

        {/* 新增、修改 抽屉 */}
        {addVisible !== undefined && (
          <EditCarTypes
            visible={addVisible}
            carCategoryList={carCategoryList}
            type={type}
            closeDrawer={this.closeAddDrawer}
            rowId={rowId}
            reload={this.reload}
            carTypesInfo={carTypesInfo}
          />
        )}

        {detailVisible && (
          <CarTypesDetail
            visible={detailVisible}
            carTypesInfo={carTypesInfo}
            carCategoryList={carCategoryList}
            closeDetailDrawer={this.closeDetailDrawer}
            reload={this.reload}
            buttonEventFun={{
              disableOrEnable: this.delConfirm,
              update: this.updateOrgClick,
              delete: this.reqCarTypeDelete
            }}
          // hasPermission={this.hasPermission}
          // hasPermission={() => true}
          // rootId={rootId}
          />
        )}

      </div>
    );
  }
}

export default CarTypes;
