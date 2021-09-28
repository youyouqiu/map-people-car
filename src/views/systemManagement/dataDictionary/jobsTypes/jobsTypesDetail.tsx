import React, { Component } from 'react';
import { Form, Radio, Button, Popconfirm } from 'antd';
import { DetailDrawer, TableForm, ImageWraper, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import EditJobsTypes from './editJobsTypes';
import styles from '../index.module.less';


interface IProps {
    jobsTypesInfo: any,//
    visible: boolean;
    // closeDrawer: Function;
    industryCategoryList: any[];
    reload: Function; //刷新列表  
    getContainer?: 'body';
    buttonEventFun: any;
    closeDetailDrawer: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
    iconUrl: string;
    addVisible: boolean;
    iconId: string;
}

interface IFieldsValue {
    iconUrl?: string;
    name?: string;
    parentName?: string;
    remark?: string;
    [key: string]: any;
}

class JobsTypesDetail extends Component<IProps, IState> {

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            addVisible: false,
            loading: true,
            iconUrl: '',
            iconId: ''
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { jobsTypesInfo } = nextPros;
        console.log(jobsTypesInfo)
        this.setFormDataValue(jobsTypesInfo);
    }

    componentDidMount() {
        const { jobsTypesInfo } = this.props;
        console.log(jobsTypesInfo)
        this.setFormDataValue(jobsTypesInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '岗位类型',
            key: 'name',
        },
        {
            name: '所属行业',
            key: 'parentName',
        },
        {
            name: '备注',
            key: 'remark',
        },
    ];

    /*
    复用方法-设置表单的值 
    */
    setFormFieldsValue(IFieldsValue: IFieldsValue) {
        if (this.formRef.current) {
            console.log('IFieldsValue', IFieldsValue)
            this.formRef.current.setFieldsValue(IFieldsValue);
        }
    };

    /**
     * 设置表单input值
     */
    async setFormDataValue(data: any) {

        let { iconId, iconUrl } = data;
        this.setState({
            iconUrl: iconUrl || '',
            iconId: iconId || ''
        })
        this.setFormFieldsValue(Object.assign(data, { statusTxt: data.enabled ? '正常' : '冻结' }));
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
                        {(iconId !== '-1' && iconId) ? <Radio.Button value={iconId}>
                            <ImageWraper   >
                                <img src={iconUrl} alt="图标" className={styles['car-icon-img']} />
                            </ImageWraper>
                        </Radio.Button> : '--'}
                    </div>
                </Radio.Group>
            </>
        );

    }

    render() {
        const { visible, closeDetailDrawer, buttonEventFun, jobsTypesInfo, reload, industryCategoryList } = this.props;
        const { enabled, enableEdit, id } = jobsTypesInfo;
        const { addVisible } = this.state;
        return (
            <DetailDrawer title={'岗位类型详情'}
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
                            {/* <div style={{ paddingTop: '20px' }} ></div> */}
                            <TableForm dataSource={this.dataSource1} type='detail' />
                            {this.renderFormIcon()}
                        </Form>

                    </div>
                    <OperatorContainer>
                        <div className={styles['detail-operation']} >
                            <ul className={styles['basic-box']}>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>{jobsTypesInfo.name || '--'}</div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>状态:</div>
                                    <div className={styles['con']}>
                                        {enabled ? '正常' : '冻结'}
                                    </div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>最后修改时间:</div>
                                    <div className={styles['con']}>{jobsTypesInfo.updateDataTime || '--'}</div>
                                </li>
                            </ul>
                            <Button key={Math.random()}
                                className={styles['button']}
                                block
                                onClick={(e) => this.setState({ addVisible: true })}
                            > 修改类型  </Button>
                            <Popconfirm

                                title={`确认是否${enabled ? '冻结' : '恢复'}此类型？`}
                                onConfirm={(e) => buttonEventFun.disableOrEnable(jobsTypesInfo)}
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
                                onConfirm={() => buttonEventFun.delete(jobsTypesInfo.id, jobsTypesInfo.name)}
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
                <EditJobsTypes
                    visible={addVisible}
                    type={1}
                    closeDrawer={() => this.setState({ addVisible: false })}
                    rowId={id}
                    reload={reload}
                    jobsTypesInfo={jobsTypesInfo}
                    getContainer="body"
                    industryCategoryList={industryCategoryList}
                />
            </DetailDrawer >
        );
    }
}

export default JobsTypesDetail;
