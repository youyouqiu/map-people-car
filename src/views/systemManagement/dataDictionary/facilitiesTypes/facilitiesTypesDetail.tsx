import React, { Component } from 'react';
import { Form, Radio, Button, Popconfirm } from 'antd';
import { DetailDrawer, TableForm, ImageWraper, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import EditFacilitiesTypes from './editFacilitiesTypes';
import styles from '../index.module.less';
import moment from 'moment';


interface IProps {
    facilityTypesInfo: any,//
    visible: boolean;
    // closeDrawer: Function;
    reload: Function; //刷新列表  
    getContainer?: 'body';
    buttonEventFun: any;
    closeDetailDrawer: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
    iconUrl: string;
    iconId: string;
    addVisible: boolean;
}

interface IFieldsValue {
    directionStatus?: number | string;
    iconUrl?: string;
    name?: string;
    remark?: string;
    [key: string]: any;
}

class FacilitysTypesDetail extends Component<IProps, IState> {

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            iconUrl: '',
            iconId: '',
            addVisible: false
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { facilityTypesInfo } = nextPros;
        this.setFormDataValue(facilityTypesInfo);
    }

    componentDidMount() {
        const { facilityTypesInfo } = this.props;
        this.setFormDataValue(facilityTypesInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '设施类型',
            key: 'name',
        },
        {
            name: '备注',
            key: 'remark',
        },

    ];

    /*
    复用方法-设置表单某些项的值 
    */
    setFormFieldsValue(IFieldsValue: IFieldsValue) {
        if (this.formRef.current) {
            this.formRef.current.setFieldsValue(IFieldsValue);
        }
    };

    /**
     * 设置表单
     */
    async setFormDataValue(data: any) {

        const { iconId, iconUrl } = data;
        this.setState({
            iconUrl: iconUrl || '',
            iconId: iconId || ''
        })
        this.setFormFieldsValue(data);
        this.setState({
            loading: false,
        });
    }
    // 图标的渲染
    renderFormIcon = () => {
        const { iconUrl, iconId } = this.state;
        return (
            <>
                <div style={{ position: 'relative' }} >
                    <div className={styles['icon-title']} >图标</div>
                </div>
                <Radio.Group buttonStyle="outline" className={styles['my-icon']} disabled   >
                    <div style={{ display: 'flex', marginLeft: '40px' }} >
                      {
                        iconId !== '-1' && (iconId ? <Radio.Button value={iconId}>
                            <ImageWraper   >
                                <img src={iconUrl} alt="图标" className={styles['icon-img']} />
                            </ImageWraper>
                        </Radio.Button> : '--')
                      }
                    </div>
                </Radio.Group>
            </>
        );

    }

    render() {
        const { visible, closeDetailDrawer, buttonEventFun, facilityTypesInfo, reload } = this.props;
        const { enabled, enableEdit, id } = facilityTypesInfo;
        const { addVisible } = this.state;
        return (
            <DetailDrawer title={'设施类型详情'}
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
                            {this.renderFormIcon()}
                        </Form>
                    </div>
                    <OperatorContainer>
                        <div className={styles['detail-operation']} >
                            <ul className={styles['basic-box']}>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>{facilityTypesInfo.name || '--'}</div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>状态:</div>
                                    <div className={styles['con']}>
                                        {enabled ? '正常' : '冻结'}
                                    </div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>最后修改时间:</div>
                                    <div className={styles['con']}>{facilityTypesInfo.updateDataTime ? moment(facilityTypesInfo.updateDataTime).format('YYYY-MM-DD HH:mm') : '--'}</div>
                                </li>
                            </ul>
                            <Button key={Math.random()}
                                className={styles['button']}
                                block
                                onClick={(e) => this.setState({ addVisible: true })}
                            > 修改类型  </Button>
                            <Popconfirm

                                title={`确认是否${enabled ? '冻结' : '恢复'}此类型？`}
                                onConfirm={(e) => buttonEventFun.disableOrEnable(facilityTypesInfo)}
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
                                onConfirm={() => buttonEventFun.delete(facilityTypesInfo.id, facilityTypesInfo.name)}
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
                <EditFacilitiesTypes
                    visible={addVisible}
                    type={1}
                    closeDrawer={() => this.setState({ addVisible: false })}
                    rowId={id}
                    reload={reload}
                    facilityTypesInfo={facilityTypesInfo}
                    getContainer="body"
                />
            </DetailDrawer >
        );
    }
}

export default FacilitysTypesDetail;
