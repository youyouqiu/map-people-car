import React, { Component } from 'react';
import { Form, Button, Popconfirm } from 'antd';
import { DetailDrawer, TableForm, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import EditPeripheralsTypes from './editPeripheralsTypes';
import styles from '../index.module.less';
import moment from 'moment';


interface IProps {
    peripheralsTypesInfo: any,//
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
    identId?: string;
    msgLength?: string;
    name?: string;
    remark?: string;
    [key: string]: any;
}

class PeripheralsTypesDetail extends Component<IProps, IState> {

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            addVisible: false
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { peripheralsTypesInfo } = nextPros;
        this.setFormDataValue(peripheralsTypesInfo);
    }

    componentDidMount() {
        const { peripheralsTypesInfo } = this.props;
        this.setFormDataValue(peripheralsTypesInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '外设ID',
            key: 'identId',
        },
        {
            name: '状态',
            key: 'statusTxt',
        },
        {
            name: '外设类型',
            key: 'name',
        },
        {
            name: '外设消息长度',
            key: 'msgLength',
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
        const { visible, getContainer, closeDetailDrawer, buttonEventFun, peripheralsTypesInfo, reload } = this.props;
        const { enabled, enableEdit, id } = peripheralsTypesInfo;
        const { addVisible } = this.state;
        return (
            <DetailDrawer title={'外设类型详情'}
                onClose={() => {
                    closeDetailDrawer()
                }}
                visible={visible}
                width={740}
            >
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
                                    <div className={styles['tit']}>{peripheralsTypesInfo.name || '--'}</div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>状态:</div>
                                    <div className={styles['con']}>
                                        {enabled ? '正常' : '冻结'}
                                    </div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>最后修改时间:</div>
                                    <div className={styles['con']}>{peripheralsTypesInfo.updateDataTime ? moment(peripheralsTypesInfo.updateDataTime).format('YYYY-MM-DD HH:mm') : '--'}</div>
                                </li>
                            </ul>
                            <Button key={Math.random()}
                                className={styles['button']}
                                block
                                onClick={(e) => this.setState({ addVisible: true })}
                            > 修改类型  </Button>
                            <Popconfirm

                                title={`确认是否${enabled ? '冻结' : '恢复'}此类型？`}
                                onConfirm={(e) => buttonEventFun.disableOrEnable(peripheralsTypesInfo)}
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
                                onConfirm={() => buttonEventFun.delete(peripheralsTypesInfo.id, peripheralsTypesInfo.name)}
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

                <EditPeripheralsTypes
                    visible={addVisible}
                    type={1}
                    closeDrawer={() => this.setState({ addVisible: false })}
                    rowId={id}
                    reload={reload}
                    peripheralsTypesInfo={peripheralsTypesInfo}
                    getContainer="body"
                />

            </DetailDrawer >
        );
    }
}

export default PeripheralsTypesDetail;
