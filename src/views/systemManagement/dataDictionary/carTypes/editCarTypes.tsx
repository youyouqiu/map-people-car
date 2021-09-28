import React, { Component } from 'react';
import { message, Select, Form, Radio, Pagination, Popover } from 'antd';
import { InfoCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { postDictCarTypeAdd, postDictCarTypeUpdate } from '@/server/dataDictionary';
import { EditDrawer, TableForm, ImageWraper } from '@/common';
import { regularText } from '@/common/rules';
import { FormInstance } from 'antd/lib/form';
// import { getStore } from '@/framework/utils/localStorage';
import IconUpload from '../component/upload';

import { publicCarPath, carKeyList } from '@/framework/utils/publicCar';
import * as rules from '@/framework/utils/regExp';
import styles from '../index.module.less';

const { Option } = Select;
const testImg = 'http://localhost:9000/src/static/image/logo1.png';
interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1)
    carTypesInfo: any,//
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    reload: Function; //刷新列表 
    carCategoryList: any,
    getContainer?: 'body';
    closeDetailDrawer?: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
    previewVisible: boolean;
    iconId: string;
    directionStatus: string;
    myIconUrl: string;
    myIconId: string;
    showFileUrl: string;
    uploadDisabled: boolean;
    uploadProgress: number;
    currentCarTypesList: string[];
    carTypesPageData: {
        page: number,
        pageSize: number,
        total: number
    }
}



interface IFieldsValue {
    directionStatus?: number | string;
    iconId?: string;
    // myIconId?: string;
    name?: string;
    pid?: string;
    remark?: string;
}




class EditCarTypes extends Component<IProps, IState> {
    static defaultProps = {
        type: 0,
    };
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            myIconUrl: '',
            myIconId: '',
            iconId: '',
            directionStatus: '',
            showFileUrl: '',
            uploadDisabled: false,
            uploadProgress: 0,
            previewVisible: false,
            currentCarTypesList: [],
            carTypesPageData: {
                page: 1,
                pageSize: 16,
                total: 0
            }
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { type, visible, rowId, carTypesInfo } = nextPros;


        // 修改回显表单数据 0=新增 1=修改
        // if (type != 0 && visible && rowId != '') {
        this.setState({
            loading: true,
        });
        // console.log('获取', carTypesInfo);
        this.setFormDataValue(carTypesInfo);
        // }

    }

    componentDidMount() {
        const { type, visible, rowId, carTypesInfo } = this.props;

        this.setState({
            currentCarTypesList: carKeyList.slice(0, 16),
            carTypesPageData: {
                page: 1,
                pageSize: 16,
                total: carKeyList.length
            }
        })
        // console.log(carKeyList.slice(0, 16))
        // 修改回显表单数据
        // if (type != 0 && visible && rowId != '') {
        // console.log('获取' + rowId + '数据');
        this.setFormDataValue(carTypesInfo);
        // }


    }
    nameWidth = 115;
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '车辆类型',
            key: 'name',
            nameWidth: this.nameWidth,
            validate: {
                rules: [{
                    required: true,
                    min: 2,
                    message: '车辆类型不能为空或小于2个字符',
                },
                    regularText
                ],
            },
            inputProps: {
                maxLength: 20,
                placeholder: '请输入车辆类型',
            },
        },
        {
            name: '所属车辆类别',
            key: 'pid',
            nameWidth: this.nameWidth,
            validate: {
                rules: [
                    {
                        required: true,
                        message: '请选择所属车辆类别',
                    },
                ],
            },
            inputProps: {
                // maxLength: 10,
                placeholder: '请选择所属车辆类别',
            },
            component: () => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        bordered={false}

                    >
                        {this.props.carCategoryList.map((e: any) => {
                            return <Option value={e.value} key={e.value} >{e.label}</Option>
                        })}

                    </Select>
                );
            },
        },
        {
            name: '备注',
            key: 'remark',
            nameWidth: this.nameWidth,
            validate: {
                rules: [
                    {
                        required: false,
                        message: '备注',
                    },
                    regularText
                ],
            },
            inputProps: {
                maxLength: 150,
                placeholder: '请输入备注，最多150字',
            },
        },

    ];

    renderFormIcon = () => {

        const { myIconId, myIconUrl, showFileUrl, currentCarTypesList, iconId, directionStatus } = this.state;
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
                {/* // <div className={styles['my-icon']} > */}
                <Radio.Group buttonStyle="outline" className={styles['my-icon']} onChange={(e) => this.setState({ iconId: e.target.value })} value={iconId} >
                    <div style={{ display: 'flex' }} >

                        <Radio.Button value='-1'>不选</Radio.Button>
                        {
                            myIconId ?
                                <Radio.Button value={myIconId}>
                                    <ImageWraper deleteHandle={() => {
                                        if (this.formRef.current) {
                                            const iconId: string = this.formRef.current.getFieldValue('iconId');
                                            (iconId === myIconId) && this.setFormFieldsValue({ iconId: '-1' });
                                        }
                                        this.setState({
                                            myIconId: '',
                                            myIconUrl: '',
                                            showFileUrl: ''
                                        });

                                    }} >
                                        <img src={showFileUrl || myIconUrl} alt="车辆类型图标" className={styles['car-icon-img']} />
                                    </ImageWraper>
                                </Radio.Button>
                                :
                                <div className={styles['icon-uploadBox']} >
                                    <IconUpload onSuccess={this.uploadSuccess} >
                                        <span>上传</span>
                                    </IconUpload>
                                </div>
                        }
                        <div className={styles['flex-bottom']} style={{ height: '100px', marginTop: '15px' }} >
                            <Radio.Group onChange={(e) => this.setState({ directionStatus: e.target.value })} value={directionStatus} >
                                <Popover content={content} >
                                    <Radio value={'1'}>
                                        <span>朝向可变</span>
                                    </Radio>
                                </Popover>
                                <Popover content={content} >
                                    <Radio value={'0'}>朝向不变</Radio>
                                </Popover>

                            </Radio.Group>
                            <div className={styles['upload-tip']}  style={{fontSize: '14px',height: '64px',lineHeight: '22px'}}>
                                <InfoCircleOutlined style={{ color: '#ffab2d', background: 'none' }} />
                            上传建议尺寸67*37px；<br />
                            方向向右
                        </div>
                        </div>
                    </div>
                    {currentCarTypesList.map((e: string) => {
                        return <Radio.Button value={e} key={e}  >
                            <img src={publicCarPath(e)} alt="" className={styles['icon-img']} />
                        </Radio.Button>
                    })}
                    {/*  */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }} >
                        <Pagination defaultCurrent={1} total={carKeyList.length} pageSize={16} onChange={this.carKeyListPage.bind(this)} />
                    </div>
                </Radio.Group>

                {/* </div> */}
            </>

        );

    }


    /*
    车辆类型分页
    */
    carKeyListPage(page: number) {
        const { pageSize, total } = this.state.carTypesPageData;
        this.setState({
            currentCarTypesList: carKeyList.slice(pageSize * page - pageSize, pageSize * page),
            carTypesPageData: {
                pageSize: pageSize,
                page: page,
                total: total
            }
        })
    }
    getBase64 = (img: any, callback: Function) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }
    /*
    文件上传成功的处理
    */
    uploadSuccess = (data: Record<string, any>, file: any) => {
        this.getBase64(file.originFileObj, (imageUrl: string) => {
            const resData: any = data;
            this.setState({
                myIconId: resData.id,
                myIconUrl: resData.url,
                showFileUrl: imageUrl,
                uploadDisabled: false,
                uploadProgress: 0
            })
        });
    }

    /*
    复用方法-设置表单的值 
    */
    setFormFieldsValue(IFieldsValue: IFieldsValue) {
        if (this.formRef.current) {
            console.log('IFieldsValue', IFieldsValue)
            this.formRef.current.setFieldsValue(IFieldsValue);
        } else {
            setTimeout(() => {
                this.setFormFieldsValue(IFieldsValue)
            }, 500);
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
            let { iconId, myIconId, directionStatus } = data;
            // 如果iconId大于五位数，那么设置myIconId=iconId;
            if (iconId && iconId.length >= 5) {
                myIconId = iconId
            }
            this.setState({
                iconId, directionStatus,
                myIconId: myIconId || '',
                myIconUrl: data.iconUrl || '',
            })

            this.setFormFieldsValue(data);
        }
    }


    /**
     * 关闭抽屉
     */
    closeDrawer = () => {
        this.resetForm();
        const { closeDrawer, closeDetailDrawer } = this.props;
        closeDrawer();
        if (closeDetailDrawer) {
            closeDetailDrawer();
        }
    };

    /**
     * 重置表单
     */
    resetForm = () => {
        if (this.formRef.current) {
            this.formRef.current.resetFields();
        }
    };

    /**
     * 获取抽屉标题
     */
    getTitle = () => {
        const { type } = this.props;//(0:新增，1:修改)
        return type == 0 ? '新增车辆类型' : '修改车辆类型';
    };

    /**
     * 表单提交
     */



    /**
     * 新增
     * @param params
     */
    formSubmit = () => {
        // 发送请求
        if (this.formRef.current) {
            this.formRef.current.validateFields().then(async (values: any) => {
                const { myIconId, myIconUrl, iconId, directionStatus } = this.state;
                const { type, carTypesInfo } = this.props;
                let datas: any;
                let tip = '';
                if (type === 0) {
                    datas = await postDictCarTypeAdd(Object.assign(values, { iconId, directionStatus, myIconId, myIconUrl, enabled: true }));
                    tip = '新增';
                }

                if (type === 1) {
                    datas = await postDictCarTypeUpdate(Object.assign(carTypesInfo, values,
                        {
                            iconId, directionStatus,
                            myIconId, myIconUrl
                        }));
                    tip = '修改';
                }

                if (datas) {
                    const { reload, closeDetailDrawer } = this.props;
                    message.success(tip + '成功');
                    this.closeDrawer(); //关闭抽屉
                    reload();
                    if (closeDetailDrawer) {
                        closeDetailDrawer();
                    }
                } else {
                    // message.success(tip + '失败');
                }
            });
        }

    }




    render() {
        const { visible, getContainer } = this.props;


        return (
            <EditDrawer title={this.getTitle()} onClose={this.closeDrawer} visible={visible} getContainer={getContainer} width={560} onConfirm={this.formSubmit}>

                {/* 表单 */}
                <div className="form">
                    <Form ref={this.formRef} >
                        {/* <div style={{ paddingTop: '20px' }} ></div> */}
                        <TableForm dataSource={this.dataSource1} />
                        {this.renderFormIcon()}
                    </Form>

                </div>




            </EditDrawer>
        );
    }
}

export default EditCarTypes;
