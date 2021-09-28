import React, { Component } from 'react';
import { message, Form, } from 'antd';
// import { InfoCircleOutlined } from '@ant-design/icons';
import { postDictPeripheralsAdd, putDictPeripheralsUpdate } from '@/server/dataDictionary';
import { EditDrawer, TableForm } from '@/common';
import { FormInstance } from 'antd/lib/form';
import { str0x__, regularText, onlyNumber } from '@/common/rules';
// import { getStore } from '@/framework/utils/localStorage';
// import * as rules from '@/framework/utils/regExp';
// import styles from '../index.module.less'; 

interface IProps {
    type?: number; //抽屉类型(新增:0,修改:1)
    peripheralsTypesInfo: Object,//
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
    identId?: string;
    remark?: string;
    name?: string;
    msgLength?: string;
}




class EditPeripheralsTypes extends Component<IProps, IState> {
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
        const { visible, rowId, peripheralsTypesInfo } = nextPros;
        this.setState({
            loading: true,
        });
        visible && rowId && this.setFormDataValue(peripheralsTypesInfo);
    }

    componentDidMount() {
        const { visible, rowId, peripheralsTypesInfo } = this.props;
        this.setState({
            loading: true,
        });
        // 修改回显表单数据 
        visible && rowId && this.setFormDataValue(peripheralsTypesInfo);
    }
    /** 数据源格式 */
    dataSource1: any = [
        {
            name: '外设ID',
            key: 'identId',

            validate: {
                rules: [
                    {
                        required: true,
                        message: '外设ID不能为空',
                    }, str0x__
                ],
            },
            inputProps: {
                maxLength: 4,
                placeholder: '请输入外设ID',
            },
        }, {
            name: '外设类型',
            key: 'name',

            validate: {
                rules: [
                    {
                        required: true,
                        min: 2,
                        message: '外设类型不能为空或小于2个字符',
                    }, regularText
                ],
            },
            inputProps: {
                // minLength: 2,
                maxLength: 25,
                placeholder: '请输入外设类型',
            },
        },
        {
            name: '外设消息长度',
            key: 'msgLength',
            validate: {
                rules: [
                    {
                        required: false,
                        message: '外设消息长度不能为空',
                    }, {

                        pattern: onlyNumber.pattern,
                        message: '格式不正确，输入0或者正整数'
                    }
                ],
            },
            inputProps: {
                maxLength: 4,
                placeholder: '请输入外设消息长度',
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
        return type == 0 ? '新增外设类型' : '修改外设类型';
    };



    /**
     * 表单提交
     * @param params
     */
    formSubmit = () => {
        // 发送请求
        if (this.formRef.current) {
            this.formRef.current.validateFields().then(async (values: any) => {

                const { type, peripheralsTypesInfo } = this.props;
                let datas: any;
                let tip: string = '';
                if (type === 0) {
                    datas = await postDictPeripheralsAdd(Object.assign(values, { enabled: true }));//, enableEdit: true
                    tip = '新增';
                }
                if (type === 1) {
                    datas = await putDictPeripheralsUpdate(Object.assign(peripheralsTypesInfo, values));
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
            <EditDrawer title={this.getTitle()} onClose={this.closeDrawer} visible={visible} getContainer={getContainer} width={580} onConfirm={this.formSubmit}>

                {/* 表单 */}
                <div className="form">
                    <Form ref={this.formRef}  >
                        {/* <div style={{ paddingTop: '20px' }} ></div> */}
                        <TableForm dataSource={this.dataSource1} />
                    </Form>
                </div>
            </EditDrawer>
        );
    }
}

export default EditPeripheralsTypes;
