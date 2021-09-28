import React, { Component } from 'react';
import { Form, Button, Popconfirm } from 'antd';
import { DetailDrawer, TableForm, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import EditFunctionType from './editFunctionType'
import styles from '../index.module.less';
import moment from 'moment';


interface IProps {
    functionTypeInfo: any,//
    visible: boolean;
    // closeDrawer: Function;
    reload: Function; //刷新列表  
    getContainer?: 'body';
    buttonEventFun: any;
    closeDetailDrawer: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
    addVisible: boolean;
}

interface IFieldsValue {
    identify: string; //功能ID
    name: string; //功能类型 
    remark: string; //备注
    stateOne: string; //状态1 
    stateTwo: string; //状态2
    [key: string]: any;
}

class FunctionTypeDetail extends Component<IProps, IState> {

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            addVisible: false
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { functionTypeInfo } = nextPros;
        this.setFormDataValue(functionTypeInfo);
    }

    componentDidMount() {
        const { functionTypeInfo } = this.props;
        this.setFormDataValue(functionTypeInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '功能ID',
            key: 'identify',
        },
        {
            name: '启用状态',
            key: 'statusTxt',
        },
        {
            name: '功能类型',
            key: 'name',
        },
        {
            name: '状态1',
            key: 'stateOne',
        },
        {
            name: '状态2',
            key: 'stateTwo',
        },
        {
            name: '备注',
            key: 'remark',
        },
        {
            name: '最后修改时间',
            key: 'updateDataTime',
            render: (value: string) => {
                return moment(value).format('YYYY-MM-DD HH:mm');
            }
        },

    ];


    /*
    复用方法-设置表单的值 
    */
    setFormFieldsValue(IFieldsValue: IFieldsValue) {
        if (this.formRef.current) {
            this.formRef.current.setFieldsValue(IFieldsValue);
        }
    };

    /**
     * 设置表单input值
     */
    async setFormDataValue(data: any) {


        this.setFormFieldsValue(Object.assign(data, { statusTxt: data.enabled ? '正常' : '冻结' }));
        this.setState({
            loading: false,
        });
    }
    /**
     * 重置表单
     */
    resetForm = () => {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    };

    render() {
        const { visible, getContainer, closeDetailDrawer, buttonEventFun, functionTypeInfo, reload } = this.props;
        const { enabled, enableEdit, id } = functionTypeInfo;
        const { addVisible } = this.state;
        return (
            <DetailDrawer title={'功能类型详情'}
                onClose={() => {
                    closeDetailDrawer()
                }}
                visible={visible}
                width={740} >
                <div className={styles['drawer-wrapper']}>
                    {/* 表单 */}
                    <div className="form" style={{ margin: '20px' }}>
                        <Form ref={this.formRef} style={{ width: '520px' }}  >
                            <TableForm dataSource={this.dataSource1} type='detail' />

                        </Form>
                    </div>
                    <OperatorContainer>
                        <div className={styles['detail-operation']} >
                            <ul className={styles['basic-box']}>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>{functionTypeInfo.name || '--'}</div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>状态:</div>
                                    <div className={styles['con']}>
                                        {enabled ? '正常' : '冻结'}
                                    </div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>最后修改时间:</div>
                                    <div className={styles['con']}>{functionTypeInfo.updateDataTime ? moment(functionTypeInfo.updateDataTime).format('YYYY-MM-DD HH:mm') : '--'}</div>
                                </li>
                            </ul>
                            <Button key={Math.random()}
                                className={styles['button']}
                                block
                                onClick={(e) => this.setState({ addVisible: true })}
                            > 修改类型  </Button>
                            <Popconfirm

                                title={`确认是否${enabled ? '冻结' : '恢复'}此类型？`}
                                onConfirm={(e) => buttonEventFun.disableOrEnable(functionTypeInfo)}
                                cancelText="取消"
                                okText="确定"
                            >
                                <Button key={Math.random()}
                                    block
                                    className={styles['button']}
                                >  {enabled && '冻结'}
                                    {!enabled && '恢复'}  </Button>
                            </Popconfirm>
                            {enableEdit && <Popconfirm
                                title={`确认是否删除？`}
                                onConfirm={() => buttonEventFun.delete(functionTypeInfo.id, functionTypeInfo.name)}
                                cancelText="取消"
                                okText="确定"
                            >
                                <Button key={Math.random()}
                                    block
                                    className={styles['button']}
                                >
                                    删除
                            </Button>
                            </Popconfirm>}
                        </div>
                    </OperatorContainer>

                </div >
                <EditFunctionType
                    visible={addVisible}
                    type={1}
                    closeDrawer={() => this.setState({ addVisible: false })}
                    rowId={id}
                    reload={reload}
                    functionTypeInfo={functionTypeInfo}
                    getContainer="body"
                />
            </DetailDrawer >
        );
    }
}

export default FunctionTypeDetail;
