import React, { Component } from 'react';
import { Form, Radio, Button, Popconfirm, Popover } from 'antd';
import { InfoCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { DetailDrawer, TableForm, ImageWraper, OperatorContainer } from '@/common';
import { FormInstance } from 'antd/lib/form';
import EditCarTypes from './editCarTypes';
// import { getStore } from '@/framework/utils/localStorage';
import { publicCarPath } from '@/framework/utils/publicCar';
import styles from '../index.module.less';
import moment from 'moment';


const testImg = 'http://localhost:9000/src/static/image/logo1.png';
interface IProps {
    carTypesInfo: any,//
    visible: boolean;
    // closeDrawer: Function;
    reload: Function; //刷新列表  
    getContainer?: 'body';
    buttonEventFun: any;
    carCategoryList: any[];
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
    // myIconId?: string;
    name?: string;
    parentName?: string;
    remark?: string;
    [key: string]: any;
}

class CarTypesDetail extends Component<IProps, IState> {

    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            iconUrl: '',
            iconId: '',
            addVisible: false
            // showFileUrl: '',

        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { carTypesInfo } = nextPros;
        this.setFormDataValue(carTypesInfo);
    }

    componentDidMount() {
        const { carTypesInfo } = this.props;
        this.setFormDataValue(carTypesInfo);
    }
    nameWidth = 115;
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '车辆类型',
            key: 'name',
            nameWidth: this.nameWidth
        },
        {
            name: '所属车辆类别',
            key: 'parentName',
            nameWidth: this.nameWidth
        },
        {
            name: '备注',
            key: 'remark',
            nameWidth: this.nameWidth
        },
    ];
    // 图标的渲染
    renderFormIcon = () => {
        const { directionStatus } = this.props.carTypesInfo;
        const { iconUrl, iconId } = this.state;
        const content = (
            <div style={{ padding: '0 15px', width: '360px', display: 'flex' }} >
                <div><ExclamationCircleFilled style={{ marginRight: '10px', color: '#6DCFF6' }} /></div>
                <div>
                    <div>朝向可变：图标在地图上可根据位置信息改变朝向，多用于俯视图，可模拟车辆行驶方向；</div>
                    <div>朝向不变：图标在地图上朝向固定不变，多用于侧视图或非车辆；</div>
                </div>
            </div>
        );
        return (
            <>
                <div style={{ position: 'relative' }} >
                    <div className={styles['icon-title']} >图标</div>
                </div>
                <Radio.Group buttonStyle="outline" className={styles['my-icon']} disabled   >
                    <div style={{ display: 'flex', marginLeft: '40px' }} >
                        {(iconId !== '-1' && iconId) ? <Radio.Button value={iconId}>
                            <ImageWraper   >
                                <img src={iconUrl} alt="车辆类型图标" className={styles['car-icon-img']} />
                            </ImageWraper>
                        </Radio.Button> : '--'}
                        {iconId !== '-1' && <div style={{ width: '300px', marginTop: '15px', textAlign: 'right' }} >
                            <Radio.Group value={directionStatus} disabled >
                                <Popover content={content} >
                                    <Radio value={'1'}>
                                        <span>朝向可变</span>
                                    </Radio>
                                </Popover>
                                <Popover content={content}  >
                                    <Radio value={'0'} style={{ marginLeft: '20px' }}>朝向不变</Radio>
                                </Popover>
                            </Radio.Group>
                        </div>}
                    </div>
                </Radio.Group>
            </>

        );

    }

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
        this.setState({
            loading: false,
        });
        if (data) {
            let { iconId } = data;
            let iconUrl: string = publicCarPath(iconId);
            // 如果iconId大于五位数，那么设置iconUrl;
            if (iconId.length >= 5) {
                iconUrl = data.iconUrl;
            }
            this.setState({
                iconUrl: iconUrl,
                iconId: iconId,

            })

            this.setFormFieldsValue(data);
        }
    }


    render() {
        const { visible, reload, closeDetailDrawer, buttonEventFun, carTypesInfo, carCategoryList } = this.props;
        const { enabled, enableEdit, id } = carTypesInfo;
        const { addVisible } = this.state;
        return (
            <DetailDrawer title={'车辆类型详情'}
                width={740}
                visible={visible}
                onClose={closeDetailDrawer}
            >
                <div className={styles['drawer-wrapper']} >
                    {/* 表单 */}
                    <div className="form" style={{ margin: '20px' }}  >
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
                                    <div className={styles['tit']}>{carTypesInfo.name || '--'}</div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>状态:</div>
                                    <div className={styles['con']}>
                                        {enabled ? '正常' : '冻结'}
                                    </div>
                                </li>
                                <li className={styles["scroll-item"]} style={{ marginBottom: 20 }}>
                                    <div className={styles['tit']}>最后修改时间:</div>
                                    <div className={styles['con']}>{carTypesInfo.updateDataTime ? moment(carTypesInfo.updateDataTime).format('YYYY-MM-DD HH:mm') : '--'}</div>
                                </li>
                            </ul>
                            <Button key={Math.random()}
                                className={styles['button']}
                                block
                                onClick={(e) => this.setState({ addVisible: true })}
                            > 修改类型  </Button>
                            <Popconfirm

                                title={`确认是否${enabled ? '冻结' : '恢复'}此类型？`}
                                onConfirm={(e) => buttonEventFun.disableOrEnable(carTypesInfo)}
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
                                onConfirm={() => buttonEventFun.delete(carTypesInfo.id, carTypesInfo.name)}
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
                {addVisible !== undefined && (
                    <EditCarTypes
                        visible={addVisible}
                        carCategoryList={carCategoryList}
                        type={1}
                        closeDrawer={() => this.setState({ addVisible: false })}
                        rowId={id}
                        reload={reload}
                        carTypesInfo={carTypesInfo}
                        getContainer="body"
                    />
                )}
            </DetailDrawer >
        );
    }
}

export default CarTypesDetail;
