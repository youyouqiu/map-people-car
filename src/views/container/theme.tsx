import { Input, Form, Row, Col } from 'antd';
import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { EditDrawer } from '@/common';
import { getStore, setStore } from '@/framework/utils/localStorage';
import less from 'less';
import ThemeColor from '@/common/themeColor';
import learnPng from '@/static/image/learn.png';

interface IProps {
  children: any
};

const Theme: React.FC<IProps> = memo((props) => {
  const staticData = useRef({
    colors: [
      {
        title: '拂晓蓝',
        value: '#1890FF',
      },
      {
        title: '薄暮',
        value: '#F5222D',
      },
      {
        title: '火山',
        value: '#FA541C',
      },
      {
        title: '日暮',
        value: '#FAAD14',
      },
      {
        title: '明青',
        value: '#13C2C2',
      },
      {
        title: '极光绿',
        value: '#53C41A',
      },
      {
        title: '极客蓝',
        value: '#2F54EB',
      },
      {
        title: '酱紫',
        value: '#722ED1',
      },
    ],
  });

  const [visible, setVisible] = useState(false);
  // const [color, setColor] = useState('#1890ff');
  const [color, setColor] = useState('#1890FF');


  /**
   * 获取缓存，设置主题
   */
  useEffect(() => {
    let theme: any = getStore('theme');
    if (theme) {
      theme = JSON.parse(theme);
    }
    const userName: any = getStore('userName');
    if (theme && theme[userName]) {
      less.modifyVars(theme[userName]);
      setColor(theme[userName]['@ButtonBGColor']);
    }
  }, []);

  const onClick = (e: any) => {
    setVisible(!visible);
  }

  const closeDrawer = () => {
    setVisible(false);
  }

  /**
   * 选择主题色
   */
  const onChange = (e: any) => {
    const color = e.target.value;
    setColor(color);
  }

  const onPress = (c: string) => {
    setColor(c);
  };

  useEffect(() => {
    const themeObj = {
      '@HBGColor': colorRgb(color, 0.1),
      '@DBGColor': colorRgb(color, 0.25),
      '@FocusTextColor': color,
      '@ButtonBGColor': color,
      '@InkBarBGColor': color,
      '@InputHoverBorderColor': color,
      '@ButtonHoverColor': colorRgb(color, 0.8),
      '@BoxShadowColor': colorRgb(color, 0.2),
      '@ReloadIconColor': color,
    };
    less.modifyVars(themeObj);
    // 根据用户名称，将主题色保存在缓存中
    let theme: any = getStore('theme');
    if (theme) {
      theme = JSON.parse(theme);
    }
    const userName: any = getStore('userName');
    if (userName) {
      if (theme && theme[userName]) {
        theme[userName] = themeObj;
        setStore('theme', theme);
      } else {
        const t: any = new Object();
        t[userName] = themeObj
        setStore('theme', t);
      }
    }
  }, [color]);

  /**
   * 颜色16进制转rgb
   */
  const colorRgb = useCallback((C: string, opacity: number) => {
    // 16进制颜色值的正则
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 把颜色值变成小写
    var color = C.toLowerCase();
    if (reg.test(color)) {
      // 如果只有三位的值，需变成六位，如：#fff => #ffffff
      if (color.length === 4) {
        var colorNew = "#";
        for (var i = 1; i < 4; i += 1) {
          colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
        }
        color = colorNew;
      }
      // 处理六位的颜色值，转为RGB
      var colorChange = [];
      for (var i = 1; i < 7; i += 2) {
        colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
      }
      return `rgba(${colorChange.join(",")}, ${opacity})`
    } else {
      return color;
    }
  }, []);

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };

  return (
    <>
      <div onClick={onClick} style={{ display: 'inline' }}>
        {props.children}
      </div>
      <EditDrawer
        title={''}
        visible={visible}
        width={300}
        onClose={closeDrawer}
        getContainer={'body'}
      >
        <Row
          style={{ marginTop: '15px' }}
        >
          <Col span={24}>
            <span style={{ color: '#000000', fontWeight: 'bold' }}>主题色</span>
          </Col>
          <Col span={24}>
            <ThemeColor color={staticData.current.colors} value={color} onPress={onPress} />
          </Col>
        </Row>
        <Row style={{ marginTop: '15px' }}>
          <Col span={6}>
            <Input type="color" value={color} onChange={onChange} />
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <img src={learnPng} style={{ width: '32px', height: '32px' }} />
          </Col>
        </Row>
      </EditDrawer>
    </>
  );
});

export default Theme;
