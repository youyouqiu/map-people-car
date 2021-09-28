import React, { Component } from 'react';
import { message, Form, } from 'antd';
// import { InfoCircleOutlined } from '@ant-design/icons';
import { postDictFunctionTypeAdd, putDictFunctionTypeUpdate } from '@/server/dataDictionary';
import { EditDrawer, TableForm } from '@/common';
import { FormInstance } from 'antd/lib/form';
// import { getStore } from '@/framework/utils/localStorage';
// import * as rules from '@/framework/utils/regExp';
import { str0xF0__, regularText } from '@/common/rules';
// import styles from '../index.module.less'; 

interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1)
    functionTypeInfo: Object,//
    visible: boolean;
    closeDrawer: Function;
    rowId: string;
    reload: Function; //刷新列表  
    getContainer?: 'body';
    closeDetailDrawer?: Function; //关闭详情抽屉
}

interface IState {
    loading: boolean;
}



interface IFieldsValue {
    identify: string; //功能ID
    name: string; //功能类型 
    remark: string; //备注
    stateOne: string; //状态1 
    stateTwo: string; //状态2
}




class EditFunctionType extends Component<IProps, IState> {
    static defaultProps = {
        type: 0,
    };
    formRef: React.RefObject<FormInstance> = React.createRef<FormInstance>();
    constructor(props: IProps) {
        super(props);

        this.state = {
            loading: true,
        };
    }


    UNSAFE_componentWillReceiveProps(nextPros: IProps) {
        const { visible, rowId, functionTypeInfo } = nextPros;
        this.setState({
            loading: true,
        });
        visible && rowId && this.setFormDataValue(functionTypeInfo);
    }

    componentDidMount() {
        const { visible, rowId, functionTypeInfo } = this.props;
        this.setState({
            loading: true,
        });
        // 修改回显表单数据 
        visible && rowId && this.setFormDataValue(functionTypeInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '功能ID',
            key: 'identify',

            validate: {
                rules: [
                    {
                        required: true,
                        message: '功能ID不能为空',
                    },
                    str0xF0__
                ],
            },
            inputProps: {
                // minLength:6,
                maxLength: 6,
                placeholder: '请输入功能ID',
            },
        }, {
            name: '功能类型',
            key: 'name',

            validate: {
                rules: [
                    {
                        required: true,
                        min: 2,
                        message: '功能类型不能为空或小于2个字符',
                    }, regularText
                ],
            },
            inputProps: {
                // minLength: 2,
                maxLength: 25,
                placeholder: '请输入功能类型',
            },
        },
        {
            name: '状态1',
            key: 'stateOne',
            validate: {
                rules: [
                    {
                        required: true,
                        min: 2,
                        message: '状态1不能为空或小于2个字符',
                    }, regularText
                ],
            },
            inputProps: {
                // minLength: 2,
                maxLength: 25,
                placeholder: '请输入状态1',
            },
        },
        {
            name: '状态2',
            key: 'stateTwo',
            validate: {
                rules: [
                    {
                        required: true,
                        min: 2,
                        message: '状态2不能为空或小于2个字符',
                    }, regularText
                ],
            },
            inputProps: {
                // minLength: 2,
                maxLength: 25,
                placeholder: '请输入状态2',
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
                    },
                ],
            },
            inputProps: {
                maxLength: 150,
                placeholder: '请输入备注，最多150字',
            },
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

        //获取数据 this.formRef.current 有可能为空   

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

    };

    /**
     * 获取抽屉标题
     */
    getTitle = () => {
        const { type } = this.props;//(0:新增，1:修改)
        return type == 0 ? '新增功能类型' : '修改功能类型';
    };



    /**
     * 表单提交
     * @param params
     */
    formSubmit = () => {
        // 发送请求
        if (this.formRef.current) {
            this.formRef.current.validateFields().then(async (values: any) => {

                const { type, functionTypeInfo } = this.props;
                let datas: any;
                let tip: string = '';
                if (type === 0) {
                    datas = await postDictFunctionTypeAdd(Object.assign(values, { enabled: true, enableEdit: true }));//
                    tip = '新增';
                }
                if (type === 1) {
                    datas = await putDictFunctionTypeUpdate(Object.assign(functionTypeInfo, values));
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
            <EditDrawer title={this.getTitle()} onClose={this.closeDrawer} visible={visible} getContainer={getContainer} width={640} onConfirm={this.formSubmit}>
                <div style={{ display: 'flex' }}>
                    {/* 表单 */}
                    <div className="form">
                        <Form ref={this.formRef} style={{ width: '600px' }}>
                            <div style={{ paddingTop: '20px' }} ></div>
                            <TableForm dataSource={this.dataSource1} />
                        </Form>
                    </div>


                </div>

            </EditDrawer>
        );
    }
}

export default EditFunctionType;
