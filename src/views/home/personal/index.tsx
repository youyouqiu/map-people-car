import React, { Component } from 'react';
import {
    Tag, Form, Input, Button, Radio, Upload, Row, Col, message, Avatar, Tabs,
} from 'antd';
import styles from './index.module.less';
import {
    UserOutlined,
} from '@ant-design/icons';
import { getUserRole, updateUserMsg } from '@/server/user';
import { phoneReg, realNameReg, email } from '@/framework/utils/regExp';
import { regularText } from '@/common/rules';
import { RcFile } from 'antd/lib/upload';
import { getStore } from '@/framework/utils/localStorage';
import { showEmpty } from '@/framework/utils/function';
import { IUserDetails, IRoles } from '../type';
import IndustrySelect from '@/common/industrySelect';
import { deleteImg, editPassword } from '@/server/monitorManager';
import userIcon1 from '@/static/image/user1.svg';
import userIcon2 from '@/static/image/user2.svg';
import userIcon3 from '@/static/image/user3.svg';
import userIcon4 from '@/static/image/user4.svg';
import { connect } from 'react-redux';
import { AllState } from '@/model';
import { Redirect } from 'react-router-dom';
const { TabPane } = Tabs;

const msgForm = {
    labelCol: {
        span: 24,
        offset: 0
    },
    wrapperCol: {
        span: 24,
        offset: 0
    },
};

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 11,
        },
    },
};

interface IProps {
    userMessage: IUserDetails;
    getUserMsg: Function;
}
interface IState {
    userRoles: Array<IRoles>;
    headUrl: string;
    delImgUrl: string;
    redirect: boolean;
}
class Personal extends Component<IProps, IState, any>{
    userForm: any = React.createRef();
    editPassword: any = React.createRef();
    constructor(props: IProps) {
        super(props);

        this.state = {
            userRoles: [],
            headUrl: '',
            delImgUrl: '',
            redirect: false
        }
    }

    componentDidMount() {
        this.props.getUserMsg();
        this.getUserRole();
    }

    UNSAFE_componentWillReceiveProps(nextProps: IProps) {
        const {
            userMessage
        } = nextProps;

        if (userMessage) {
            this.setState({
                headUrl: userMessage.photo || ''
            });
            (this.userForm.current as any).setFieldsValue(userMessage);
        }
    }

    /**
     * 获取用户权限信息
     */
    async getUserRole() {
        const datas = await getUserRole<Array<IRoles>>(null);
        if (datas) {
            this.setState({
                userRoles: datas
            });
        }
    }

    isIE = () => {
        if (!!window.ActiveXObject || "ActiveXObject" in window)
            return true;
        else
            return false;
    }

    /**
     * 用户提交表单
     */
    submitUserMsgForm = (values: any) => {
        this.updateUserMsg(values);
    }

    /**
     * 修改用户信息
     * @param infos :用户信息表单数据
     */
    async updateUserMsg(values: string) {
        const datas = await updateUserMsg(values);

        if (datas) {
            this.setState({
                delImgUrl: ''
            });
            message.success('修改成功');
            this.props.getUserMsg();
        }
    }

    /**
     * 头像上传前验证
     */
    beforeUpload = (file: RcFile,) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('文件仅支持jpg,png格式');
        }
        const isLt1M = file.size / 1024 / 1024 < 1;
        if (!isLt1M) {
            message.error('仅支持小于1M的文件上传');
        }
        return isJpgOrPng && isLt1M;
    }

    /**
     * 头像上传
     */
    handleChange = (info: any) => {
        if (info.file.status === 'done') {
            this.getBase64(info.file.originFileObj, (imageUrl: string) => {
                this.setState({
                    headUrl: imageUrl,
                })
            });

            //删除上次上传的图片地址
            const { delImgUrl } = this.state;
            if (delImgUrl != '') {
                this.confirmDeleteImg(delImgUrl);
            }

            // 保存当前上传的图片地址
            const { fileList } = info;

            const len = fileList.length;
            if (len > 0) {
                const url = fileList[len - 1].response.data.webUrl;

                if (fileList.length > 0) {
                    this.setState({
                        delImgUrl: url,
                    })
                }


                if (this.userForm.current) {
                    this.userForm.current.setFieldsValue({
                        photo: url
                    })
                }
            }
        }
    }
    getBase64 = (img: any, callback: Function) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    /**
     * 确认删除图片
     */
    confirmDeleteImg = async (photo: string) => {
        await deleteImg<boolean>([photo]);
    }

    /**
     * 头像渲染
     */
    renderAvatar = (photo?: string) => {
        return (
            <>{
                (photo && photo != '') ? (
                    <Avatar
                        size={110}
                        src={photo}
                    />
                ) : (
                        <Avatar
                            size={110}
                            icon={<UserOutlined />}
                        />
                    )
            }
            </>)
    }

    /**
     * 切换页签
     */
    tabsChangeForm = (activeKey: string) => {
        const { userMessage } = this.props;
        if (activeKey == '2') {
            setTimeout(() => {
                (this.editPassword.current as any).setFieldsValue({ username: userMessage.username })
            }, 100)
        }
    }

    /**
     * 修改密码提交
     */
    async submitchangePassword() {
        const {
            userMessage,
        } = this.props
        const values = (this.editPassword.current as any).getFieldValue();
        const param = {
            userId: userMessage.id,
            oldPassword: values.oldPassword,
            password: values.password
        }
        const response = await editPassword(param)
        if (response) {
            message.success('修改成功')
            this.setState({
                redirect: true
            })
        }
    }

    /**
     * 校验密码是否相同
     */
    checkDuplicate = (rule: any, value: string, callback: Function) => {
        const values = (this.editPassword.current as any).getFieldValue();
        const password = values.password;
        if (!value) {
            callback();
            return;
        }
        if (password === value) {
            callback();
            return
        } else {
            callback('确认的新密码不正确');
        }
    }


    render() {
        const {
            userRoles,
            headUrl,
        } = this.state;
        const {
            userMessage
        } = this.props;

        if (this.state.redirect) {
            return <Redirect push to="/login" />;
        }


        return (
            // <div style={{ height: '100%' }}>
            <div className={styles['personal-wrap']}>
                {/* left */}
                <div
                    className={styles['personal-left']}
                >
                    <div className={styles['head-box']}>{this.renderAvatar(userMessage.photo)}</div>
                    <p className={styles['user-name']}>{userMessage.username || '未填写'}</p>
                    <p className={styles['user-company']}>{userMessage.organizationName}</p>

                    <div>
                        <div className={styles['personal-list-box']}>
                            <ul
                                className={styles['personal-list']}
                            >
                                <li className={styles['item']}>
                                    <span className={styles['tit']}><img src={userIcon1} width="16" /></span>
                                    <span className={styles['con']}>{userMessage.realName || "未填写"}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}><img src={userIcon2} width="16" /></span>
                                    <span className={styles['con']}>{userMessage.gender == 1 ? '男' : '女'}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}><img src={userIcon3} width="16" /></span>
                                    <span className={styles['con']}>{showEmpty(userMessage.mobile)}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}><img src={userIcon4} width="16" /></span>
                                    <span className={styles['con']}>{showEmpty(userMessage.mail)}</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles['personal-list-box']}>
                            <h4 className={styles['title']}>更多</h4>
                            <ul
                                className={styles['personal-list']}
                            >
                                <li className={styles['item']}>
                                    <span className={styles['tit']}>身份</span>
                                    <span className={styles['con']}>{showEmpty(userMessage.userIdentity)}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}>行业</span>
                                    <span className={styles['con']}>{showEmpty(userMessage.industryName)}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}>职务</span>
                                    <span className={styles['con']}>{showEmpty(userMessage.duty)}</span>
                                </li>
                            </ul>
                        </div>

                        <div className={styles['personal-list-box']}>
                            <h4 className={styles['title']}>角色</h4>
                            <div>
                                {
                                    userRoles.map((item: any) => {
                                        return (<Tag className={styles['tag']} key={item.id}>{item.name}</Tag>)
                                    })
                                }
                            </div>
                            <ul
                                className={styles['personal-list']}
                            >
                                <li className={styles['item']}>
                                    <span className={styles['tit']}>状态</span>
                                    <span className={styles['con']}>{userMessage.isActive == 0 ? '停用' : '启用'}</span>
                                </li>
                                <li className={styles['item']}>
                                    <span className={styles['tit']}>授权截止日期</span>
                                    <span className={styles['con']}>{showEmpty(userMessage.authorizationDate)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* right */}
                <div
                    className={styles['personal-right']}
                >
                    <Tabs
                        defaultActiveKey="1"
                        tabPosition='left'
                        onChange={this.tabsChangeForm}
                    >
                        <TabPane tab="基本信息" key="1">
                            <Form
                                ref={this.userForm as any}
                                {...msgForm}
                                labelAlign="left"
                                name="userMessage"
                                onFinish={this.submitUserMsgForm}
                                className={styles['form']}
                            >
                                <Row
                                    style={{ marginLeft: 260 }}
                                >
                                    <Col
                                        span={6}
                                        pull={1}
                                    >
                                        <Form.Item
                                            label="头像"
                                            // name='photo'
                                            className={this.isIE() ? styles['photoMargin'] : ''}
                                        >
                                            <div className={styles['head-box']}>
                                                <Upload
                                                    name='file'
                                                    accept="image/png, image/jpeg"
                                                    className={styles['upload-box']}
                                                    headers={{
                                                        'Authorization': `Bearer ${getStore('token')}`
                                                    }}
                                                    action='/api/mo/monitoring-vehicle/photo'
                                                    beforeUpload={this.beforeUpload}
                                                    onChange={this.handleChange}
                                                >
                                                    <span className={styles['upload']}>修改头像</span>
                                                </Upload>
                                                {this.renderAvatar(headUrl)}
                                            </div>
                                            <div style={{ marginTop: 34, textAlign: 'center' }} className={this.isIE() ? styles['photoWidth'] : ''}>
                                                *仅支持jpg、png,文件小于1M</div>
                                        </Form.Item>
                                        {/* photo */}
                                        <Form.Item name="photo" style={{ display: 'none' }}><Input type="hidden" /></Form.Item>

                                        <Form.Item
                                            label="用户名"
                                            name="username"
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                disabled={true}
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="真实姓名"
                                            name="realName"
                                            rules={[
                                                {
                                                    pattern: realNameReg,
                                                    message: '请输入正确的真实姓名'
                                                }
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                maxLength={30}
                                                placeholder="请输入真实姓名"
                                                allowClear
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="邮箱"
                                            name='mail'
                                            // rules={[email]}
                                            rules={[
                                                {
                                                    pattern: email,
                                                    message: '邮箱格式不正确'
                                                }
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                maxLength={50}
                                                placeholder="请输入邮箱"
                                                allowClear
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="身份"
                                            name="userIdentity"
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                maxLength={30}
                                                placeholder="请输入身份"
                                                allowClear
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col
                                        span={6}
                                        push={1}
                                        style={{ marginTop: 190 }}
                                    >
                                        <Form.Item
                                            label="性别"
                                            name="gender"
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Radio.Group
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            >
                                                <Radio value={1}>男</Radio>
                                                <Radio value={2}>女</Radio>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            label="电话号码"
                                            name="mobile"
                                            rules={[
                                                {
                                                    pattern: phoneReg,
                                                    message: '请输入正确的电话号码',
                                                },
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                maxLength={11}
                                                placeholder="请输入电话号码"
                                                allowClear
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label="行业"
                                            name="industryId"
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <IndustrySelect borderFlag={true} isIE={this.isIE()} />
                                        </Form.Item>

                                        <Form.Item
                                            label="职务"
                                            name="duty"
                                            rules={[
                                                regularText
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input
                                                maxLength={30}
                                                placeholder="请输入职务"
                                                allowClear
                                                className={this.isIE() ? styles['formInput'] : ''}
                                            />
                                        </Form.Item>
                                        <Form.Item {...tailFormItemLayout} style={{ textAlign: "right" }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className={this.isIE() ? styles['fromButtom'] : ''}
                                            >确定</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </TabPane>
                        <TabPane tab="修改密码" key="2">
                            <Form
                                ref={this.editPassword as any}
                                {...msgForm}
                                labelAlign="left"
                                className={styles['form']}
                                onFinish={this.submitchangePassword.bind(this)}
                                id='editPassword'
                            >
                                <Row
                                    justify='center'
                                >
                                    <Col
                                        span={6}
                                        pull={8}
                                    >
                                        <Form.Item
                                            label="用户名"
                                            name="username"
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input disabled={true} className={this.isIE() ? styles['formInput'] : ''} />
                                        </Form.Item>

                                        <Form.Item
                                            label="旧密码"
                                            name="oldPassword"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '旧密码不能为空'
                                                }
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input allowClear maxLength={25} placeholder='请输入旧密码' className={this.isIE() ? styles['formInput'] : ''} />
                                        </Form.Item>
                                        <Form.Item
                                            label="新密码"
                                            name="password"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '新密码不能为空'
                                                },
                                                {
                                                    max: 25,
                                                    min: 6,
                                                    message: '格式不正确，应该6-25字符！'
                                                }
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input allowClear placeholder='请输入新密码' className={this.isIE() ? styles['formInput'] : ''} />
                                        </Form.Item>
                                        <Form.Item
                                            label="确认新密码"
                                            name="confirmPassword"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: '确认新密码不能为空'
                                                },
                                                {
                                                    max: 25,
                                                    min: 6,
                                                    message: '格式不正确，应该6-25字符！'
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(rule, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject('确认的新密码不正确');
                                                    },
                                                }),
                                            ]}
                                            className={this.isIE() ? styles['formLabel'] : ''}
                                        >
                                            <Input allowClear placeholder='请输入确认新密码' className={this.isIE() ? styles['formInput'] : ''} />
                                        </Form.Item>
                                        <Form.Item {...tailFormItemLayout} style={{ textAlign: "right" }}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className={this.isIE() ? styles['passWordBtn'] : ''}
                                            >保存</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </TabPane>
                    </Tabs>

                </div>
            </div >
            // </div >
        )
    }
}

// export default Personal;
export default connect(
    (state: AllState) => ({
        userMessage: state.root.userMessage,//用户信息
    }),
    dispatch => ({
        getUserMsg: (payload: any) => {
            dispatch({ type: 'root/getUserMsgEvery', payload });
        },
    })
)(Personal)