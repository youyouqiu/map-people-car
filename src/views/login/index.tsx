import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Input } from 'antd';
import CryptoJS from "crypto-js";
import { UnlockOutlined, UserOutlined } from '@ant-design/icons';
import History from "history";
import styles from './index.module.less';
import Config from "../../framework/config";
import Ajax from "../../framework/utils/ajax";
import { personalization, orgGetPermission, userGetPermission, getPermission } from "../../server/login";
// import { dockedList } from '@/server/dockedManager';
import { setStore, getStore } from "../../framework/utils/localStorage";
import logo from '@/static/image/logo.png';
import bg from '@/static/image/bg.jpg';
import LoginSlider from './loginSlider';
import { hasPagePermmision } from '@/framework/router';
import Password from 'antd/lib/input/Password';

interface IProps {
  history: History.History;
}

let slider: any;

class Login extends Component<IProps, any, any>{
  constructor(props: IProps) {
    super(props)
    this.state = {
      isSuccess: false, //验证滑块是否通过
      userName: '',
      passWord: '',
      hintFlag: false,
      text: '',
      randomCode: '',
      loading: false,
      loginBoxPosition: '', //登录框位置
      loginLogoPosition: '',//logo位置
      loginBackgroundImage: '', //登录背景图
      loginLogoImage: '',//logo图
      versionInfo: '',
      recordNo: '',
      selection: [],
    }
  }

  loginStyle: any = [
    {
      left: '5%',
      top: '37%'
    },
    {
      left: '39.5%',
      top: '37%'
    },
    {
      left: '73.5%',
      top: '37%'
    }
  ];

  logoStyle: any = [
    {
      left: '5%',
      top: '5%'
    },
    {
      left: '83%',
      top: '5%'
    },
  ]


  componentDidMount() {
    const personalizedConfig: any = getStore('personalizedConfig');
    const configInfo = JSON.parse(personalizedConfig);
    let bgImg, logoImg, versionInfo, recordNo, loginBoxPosition, loginLogoPosition;

    if (configInfo) {
      bgImg = configInfo.loginBackgroundImage ? configInfo.loginBackgroundImage : bg;
      logoImg = configInfo.loginLogoImage ? configInfo.loginLogoImage : logo;
      versionInfo = configInfo.versionInfo ? configInfo.versionInfo : '@2015-2017中位(北京)科技有限公司';
      recordNo = configInfo.recordNo ? configInfo.recordNo : '京ICP备15041746号-1';
      loginBoxPosition = configInfo.loginBoxPosition;
      loginLogoPosition = configInfo.loginLogoPosition;
    } else {
      bgImg = bg;
      logoImg = logo;
      versionInfo = '@2015-2017中位(北京)科技有限公司';
      recordNo = '京ICP备15041746号-1';
      loginBoxPosition = null;
      loginLogoPosition = null;
    }

    this.loginPosition(loginBoxPosition, loginLogoPosition);
    this.logoPosition(loginLogoPosition);
    this.setState({
      loginBackgroundImage: bgImg,
      loginLogoImage: logoImg,
      versionInfo: versionInfo,
      recordNo: recordNo,
    });
  }

  /**
   * 登录框位置
   * @param value 
   * @param logoValue 
   */
  loginPosition(value: any, logoValue: any) {
    let position: any;
    if (value) {
      position = this.loginStyle[value - 1];
    } else {
      position = this.loginStyle[1]
    }

    this.setState({
      loginBoxPosition: position
    });

    if (logoValue == 3 || !logoValue) {
      const oldLeft = Number(position.left.split('%')[0]);
      const oldTop = Number(position.top.split('%')[0]);
      const left = (oldLeft + 4) + '%';
      const top = (oldTop - 14) + '%';
      this.setState({
        loginLogoPosition: { left, top }
      })
    }
  }

  /**
   * logo位置
   * @param value 
   */
  logoPosition(value: any) {
    if (value == 1) {
      this.setState({
        loginLogoPosition: this.logoStyle[0]
      })
    }

    if (value == 2) {
      this.setState({
        loginLogoPosition: this.logoStyle[1]
      })
    }
  }

  getrandomCode = async () => {
    const result = await Ajax.get('/api/code', null);
    if (result.data.code == 200) {
      this.setState({
        randomCode: result.data.data
      })
    }
  }

  updateStatus = (status: boolean) => {
    this.setState({
      isSuccess: status,
      hintFlag: false,
      text: ''
    })
  };

  handleUnmaeVal = (e: any) => {
    this.setState({
      userName: e.target.value
    })
  };

  handlepswdVal = (e: any) => {
    this.setState({
      passWord: e.target.value
    });
  };

  encrypt(content: string) {
    const keyStr = 'zwlbs#.cloud2020';
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const encryptResult = CryptoJS.AES.encrypt(content, key, {
      //iv: key,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,

    });
    return encryptResult.toString();

  }

  resetSlider() {
    slider.resetSlider();
  }

  login = async () => {
    const { userName, passWord, isSuccess } = this.state;

    if (userName == "" || userName == null) {
      this.setState({
        hintFlag: true,
        text: "用户名不能为空"
      });
      return;
    }
    if (passWord == "" || passWord == null) {
      this.setState({
        hintFlag: true,
        text: "密码不能为空"
      });
      return;
    }
    if (!isSuccess) {
      this.setState({
        hintFlag: true,
        text: "滑块说：休想跨过我！"
      });
      return;
    }

    this.setState({
      loading: true
    }, async () => {
      setStore('token', null);
      const urlParam = new URLSearchParams();
      urlParam.set('client_id', Config.loginParam.param.client_id);
      urlParam.set('client_secret', Config.loginParam.param.client_secret);
      urlParam.set('username', this.state.userName);
      urlParam.set('password', this.encrypt(passWord));
      urlParam.set('grant_type', Config.loginParam.param.grant_type);
      urlParam.set('scope', Config.loginParam.param.scope);
      urlParam.set('randomCode', this.state.randomCode);

      const url = Config.loginParam.path;
      const loginResponse: any = await Ajax.safeLoginPost<{
        access_token: string;
        user_id: string;
        refresh_token: string;
        expires_in: number;
        organization_id: string;
      }>(url, urlParam);
      if (loginResponse && loginResponse.access_token) {
        setStore('token', loginResponse.access_token);
        setStore('user_id', loginResponse.user_id);
        setStore('orgId', loginResponse.organization_id);
        setStore('user_type', loginResponse.user_type);
        console.log(loginResponse)
        // 浏览器判断（用于兼容css判断）
        setStore('mediaQuery', navigator.userAgent);
        const now = new Date();
        now.setSeconds(now.getSeconds() + loginResponse.expires_in);
        setStore('expires_in', now.getTime());
        setStore('refresh_token', loginResponse.refresh_token);

        let menuResponse: any;
        const { history } = this.props;

        if (loginResponse.user_name == 'admin') {
          menuResponse = await getPermission(null);
        } else {
          if (loginResponse.user_type == 0) {
            menuResponse = await orgGetPermission<any>(null);
          } else {
            menuResponse = await userGetPermission<any>(null);
          }
        }

        if (menuResponse !== undefined) {
          setStore('userName', this.state.userName);
          setStore('authMenuList', menuResponse.menu);
          setStore('authPermissionList', menuResponse.permission);

          const result: any = await personalization();
          if (result) {
            delete result.id;
            delete result.organizationId;
            setStore('personalizedConfig', result);
            //判断当前登录用户是否有页面权限
            if (hasPagePermmision(result.homePageCode)) {
              history.replace(result.homePage ? result.homePage : '/view/home/personal');
            } else {
              history.replace('/view/home/personal');
            }
          }
        }
      } else {
        this.setState({
          loading: false
        });
        this.resetSlider();
        this.getrandomCode();
      }
    })
  }

  onSelect = (e: any) => {
    const selectionStart = e.target.selectionStart;
    const selectionEnd = e.target.selectionEnd - selectionStart;
    this.setState({
      selection: [selectionStart, selectionEnd]
    })
  }

  onPaste = (e: any, msg: any) => {
    if (!(e.clipboardData && e.clipboardData.items)) {
      return;
    }

    const { userName, selection, passWord } = this.state;
    const data = e.clipboardData.items[0];
    const selectionStart = e.target.selectionStart;
    const _this = this;
    if (data.kind === 'string') {
      data.getAsString(function (str: any) {
        const result = str.replace(/(^\s*)|(\s*$)/g, "");
        let value = '';
        let arr: any = msg == 0 ? userName.split('') : passWord.split('');

        if (selection[1] == 0) {
          arr.splice(selectionStart, 0, result);
          value = arr.join('')
        } else {
          arr.splice(selection[0], selection[1]);
          value = arr.join('') + result;
        }

        msg == 0 ? _this.setState({
          userName: value
        }) : _this.setState({
          passWord: value
        })
      })
    }
  }

  render() {
    const { loading, loginBoxPosition, loginLogoPosition, loginBackgroundImage, loginLogoImage,
      recordNo, versionInfo, hintFlag, userName, passWord
    } = this.state;

    let hint;
    if (hintFlag) {
      hint = (
        <div className={styles["hint"]}>
          <span>{this.state.text}</span>
        </div>
      )
    }

    return (
      <div className={styles['login-bg']} style={{ backgroundImage: `url(${loginBackgroundImage})` }}>
        <div className={styles['login-place']}>
          <div className={styles['logo']} style={loginLogoPosition ? loginLogoPosition : null}>
            <img src={loginLogoImage} />
          </div>
          <div className={styles['login-form']} style={loginBoxPosition ? loginBoxPosition : null}>
            <div className={styles['login-title']}>
              <h3>登录平台</h3>
            </div>
            {hint}
            <Input className={styles['login-userName']}
              style={{ backgroundColor: '#e6f6ff' }}
              maxLength={25} size="large" placeholder="用户名"
              prefix={<UserOutlined style={{ fontSize: '22px', color: '#848484' }} />}
              onChange={this.handleUnmaeVal} onPaste={(e) => this.onPaste(e, 0)} onSelect={this.onSelect}
              value={userName}
            />
            <Input.Password className={styles['login-passWord']}
              maxLength={25} size="large" placeholder="密码"
              prefix={<UnlockOutlined style={{ fontSize: '22px', color: '#848484' }} />}
              onChange={this.handlepswdVal} onPaste={(e) => this.onPaste(e, 1)} onSelect={this.onSelect}
              value={passWord}
            />
            <LoginSlider
              getrandomCode={this.getrandomCode}
              updateStatus={this.updateStatus}
              onRefChild={(ref: any) => { slider = ref }}
            />

            <Button loading={loading} className={styles['login-button']} type="primary" onClick={this.login}>登录</Button>
          </div>
          <div className={styles['login-footer']}>
            <p style={{ textAlign: "center", margin: 0 }}>版本：1.2.0</p>
            <p style={{ textAlign: 'center', marginBottom: 0 }}>{versionInfo}</p>
            <p>
              <a href="http://www.miit.gov.cn/" target="_blank" rel="noopener noreferrer">{recordNo}</a>
            </p>
          </div>
        </div>
      </div >
    );
  }
}

export default connect(null, null)(Login);

