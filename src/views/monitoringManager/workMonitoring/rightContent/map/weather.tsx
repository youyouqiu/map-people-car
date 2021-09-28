import React, { memo, useEffect, useState } from 'react';
import styles from '../../index.module.less';
import { Button, Dropdown, Menu, Card } from 'antd';
import { getSelectContainer } from "@/framework/utils/function";

interface IProps {
  mapWrapper: any
}

interface cityInfo {
  city: string
  citycode: string
  district: string
  province: string
}

export default memo(({ mapWrapper }: IProps) => {
  const [data, setData] = useState<any>();
  const { map } = mapWrapper;

  useEffect(() => {
    if (map.currentMap !== 'amap') return;
    map.on('moveend', logMapinfo)
    logMapinfo();
    return () => map.off('moveend', logMapinfo);
  }, [map])


  /**
   * 获取城市信息
   */
  function logMapinfo() {
    map.getCity(async function (info: cityInfo) {
      const { district } = info;
      if (district) {
        const result: any = await getWeather(district);
        if (result) setData(result);
      }
    });
  }

  /**
   * 获取当前城市实时天气和天气预报
   */
  function getWeather(district: string) {
    const weather = map.weather();
    const p1 = new Promise((resolve) => {
      weather.getLive(district, function (err: any, data: any) {
        if (data && !err) resolve(data);
      })
    });
    const p2 = new Promise((resolve) => {
      weather.getForecast(district, function (err: any, data: any) {
        if (data && !err) resolve(data);
      })
    });
    return Promise.all([p1, p2])
  }

  const menu = (
    <Menu className={styles.weatherMenu}>
      <Menu.Item>
        <Card>
          {
            data && <div>
              <h4 className={styles.weatherLocation}>当前位置: <span>{data[0].province}{data[0].city}</span></h4>
              <p >实时天气</p>
              <div className={styles.realTime}>
                <span>天气：{data[0].weather}</span>
                <span>风向：{data[0].windDirection}</span>
                <span>温度：{data[0].temperature}℃</span>
                <span>风力：{data[0].windPower}级</span>
              </div>
              <p>预报天气</p>
              <ul className={styles.forecast}>
                {
                  data[1].forecasts.map((item: any) => <li key={item.date}>
                    {item.date}
                    <span>{item.dayWeather}</span>
                    {item.nightTemp}~{item.dayTemp}℃
                  </li>
                  )
                }
              </ul>
            </div>
          }
        </Card>
      </Menu.Item>
    </Menu>
  );


  return <div id='weatherBox' className={styles.weatherBox}>
    <Dropdown
      overlay={menu}
      placement="bottomLeft"
      getPopupContainer={(triggerNode: any) => triggerNode.parentNode || getSelectContainer('menuBox')}
    >
      <Button>天气</Button>
    </Dropdown>
  </div>
})