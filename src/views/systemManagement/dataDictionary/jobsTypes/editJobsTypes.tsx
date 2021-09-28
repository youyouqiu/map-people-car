import React, { Component } from 'react';
import { message, Select, Form, Radio } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { postDictJobsTypeAdd, postDictJobsTypeUpdate } from '@/server/dataDictionary';
import { EditDrawer, TableForm, ImageWraper } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { regularText } from '@/common/rules';
// import { getStore } from '@/framework/utils/localStorage';
// import * as rules from '@/framework/utils/regExp';
import styles from '../index.module.less';
import IconUpload from '../component/upload';



const { Option } = Select;
interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1)
    jobsTypesInfo: Record<string, any>,//
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    reload: Function; //刷新列表 
    industryCategoryList: any,
    getContainer?: 'body';
    closeDetailDrawer?: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
    iconId: string,
    iconUrl: string,
    showFileUrl: string,
    uploadDisabled: boolean,
    uploadProgress: number,
}



interface IFieldsValue {
    iconId?: string;
    name?: string;
    pid?: string;
    remark?: string;
}




class EditJobsTypes extends Component<IProps, IState> {
    static defaultProps = {
        type: 0,
    };
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
            showFileUrl: '',
            uploadDisabled: false,
            uploadProgress: 0,
            iconId: '',
            iconUrl: ''
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { visible, rowId, jobsTypesInfo } = nextPros;
        this.setState({
            loading: true,
        });
        this.setFormDataValue(jobsTypesInfo);
    }

    componentDidMount() {
        const { visible, rowId, jobsTypesInfo } = this.props;
        this.setState({
            loading: true,
        });
        // 修改回显表单数据 
        this.setFormDataValue(jobsTypesInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '岗位类型',
            key: 'name',

            validate: {
                rules: [
                    {
                        required: true,
                        min: 2,
                        message: '岗位类型不能为空或小于2个字符',
                    },
                    regularText
                ],
            },
            inputProps: {
                // minLength: 2,
                maxLength: 20,
                placeholder: '请输入岗位类型',
            },
        },
        {
            name: '所属行业',
            key: 'pid',
            validate: {
                rules: [
                    {
                        required: true,
                        message: '请选择所属行业',
                    },
                ],
            },
            inputProps: {
                // maxLength: 10,
                placeholder: '请选择所属行业',
            },
            component: () => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        bordered={false}

                    >
                        {this.props.industryCategoryList.map((e: any) => {
                            return <Option value={e.value} key={e.value} >{e.label}</Option>
                        })}

                    </Select>
                );
            },
        },
        {
            name: '备注',
            key: 'remark',
            validate: {
                rules: [
                    {
                        required: false,
                        message: '备注',
                    }, regularText
                ],
            },
            inputProps: {
                maxLength: 150,
                placeholder: '请输入备注，最多150字',
            },
        },


    ];
    //图标的渲染
    renderFormIcon = () => {

        const { iconId, iconUrl, showFileUrl } = this.state;
        return (
            <>
                <div style={{ position: 'relative' }} >
                    <div className={styles['icon-title']} >图标</div>
                </div>
                {/* // <div className={styles['my-icon']} > */}
                <Radio.Group buttonStyle="outline" className={styles['my-icon']} onChange={(e) => this.setState({ iconId: e.target.value })} value={iconId} >
                    <div style={{ display: 'flex' }} >
                        {
                            (iconId !== '-1' && iconId) ?
                                <Radio.Button value={iconId}>
                                    <ImageWraper deleteHandle={() => {
                                        this.setFormFieldsValue({ iconId: '' });
                                        this.setState({
                                            iconId: '',
                                            iconUrl: '',
                                            showFileUrl: ''
                                        });

                                    }} >
                                        <img src={showFileUrl || iconUrl} alt="岗位类型图标" className={styles['icon-img']} />
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
                            <div className={styles['upload-tip']}  >
                                <InfoCircleOutlined style={{ color: '#ffab2d', background: '#fff' }} />
                            上传建议尺寸85*85px；<br />
                            </div>
                        </div>
                    </div>
                </Radio.Group>

                {/* </div> */}
            </>

        );

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
                iconId: resData.id,
                iconUrl: resData.url,
                showFileUrl: imageUrl,
            })
            this.setFormFieldsValue({ iconId: resData.id });
        });
    }


    /*
    复用方法-设置表单的值 
    */
    setFormFieldsValue(IFieldsValue: IFieldsValue) {
        if (this.formRef.current) {
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

        //获取数据 this.formRef.current 有可能为空   
        this.setState({
            iconId: data.iconId || '',
            iconUrl: data.iconUrl || '',
        })
        this.setFormFieldsValue(data);
        this.setState({
            loading: false,
        });
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
        this.setState({
            iconUrl: '',
            iconId: '',
        })
    };

    /**
     * 获取抽屉标题
     */
    getTitle = () => {
        const { type } = this.props;//(0:新增，1:修改)
        return type == 0 ? '新增岗位类型' : '修改岗位类型';
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

                const { type, jobsTypesInfo } = this.props;
                const { iconId } = this.state;
                let datas: any;
                let tip = '';
                if (type === 0) {
                    datas = await postDictJobsTypeAdd(Object.assign(values, { enabled: true, iconId, enableEdit: true }));
                    tip = '新增';
                }
                if (type === 1) {
                    datas = await postDictJobsTypeUpdate(Object.assign(jobsTypesInfo, values, { iconId }));
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

export default EditJobsTypes;
