/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ungzip } from '@/framework/utils/unzip'
import { getLocations, getOnlineRatio, getAlarmList, getWorkData, AlarmList } from '@/server/leaderBoard'
import Map from '@/common/map/Map'
import styles from './index.module.less'
import point_purple from '@/static/image/point_purple.png'
import point_yellow from '@/static/image/point_yellow.png'
import point_grey from '@/static/image/point_grey.png'
import title_icon from '@/static/image/title_icon.png'
import { Tooltip, Button } from 'antd'
import { QuestionOutlined } from '@ant-design/icons';
type LocationPoint = {
  monitorId: string,
  monitorName: string,
  longitude: number,
  latitude: number,
  status: number,
  monitorType: number, // 0车 1人 2物 3设施
}



const Clock = () => {
  const [time, setTime] = useState(new Date())
  const timmer = useRef<any>()
  const add = useCallback(() => {
    timmer.current = setInterval(() => {
      setTime(new Date())
    }, 1000)
  }, [])
  useEffect(() => {
    add()
    return () => { clearInterval(timmer.current) }
  }, [])
  const hour = Number(time.getHours())
  const minite = Number(time.getMinutes())
  return (
    <div className={styles.clock}>
      <span>{Math.floor(hour / 10)}</span>
      <span>{Math.floor(hour % 10)}</span>
      <span className={styles.colon}>:</span>
      <span>{Math.floor(minite / 10)}</span>
      <span>{Math.floor(minite % 10)}</span>
    </div>
  )
}

const Title: React.FC<{ title: string, style?: React.CSSProperties; }> = (props) => {
  const { style, title } = props
  return <p className={styles.title} style={style}>
    <img className={styles.title_img} src={title_icon} />{title}</p>
}


const Card = (props: { value: number, title: string }) => {
  const { value, title } = props
  return (
    <div className={styles.card1}>
      <div>{title}</div>
      <div className={styles.value}>{value}</div>
    </div>
  )
}

const Card2 = (props: { value: string, title: string }) => {
  const { value, title } = props
  return (
    <div className={styles.card2}>
      <div>{value}</div>
      <div>{title}</div>
    </div>
  )
}


const Box: React.FC = (props) => {
  return (
    <div className={styles.box}>
      {
        props.children
      }
    </div>
  )
}

const LeaderBorad = () => {
  const mapInstance = useRef<AMap.Map | null>()
  const mass = useRef<AMap.MassMarks | null>()
  const [locationPoints, setLocationPoints] = useState<AMap.MassMarks.Data[]>([])
  // 在线率
  const [onlineData, setOnlineData] = useState({
    facilityOnline: 0,
    facilityTotal: 0,
    peopleOnline: 0,
    peopleTotal: 0,
    vehicleOnline: 0,
    vehicleTotal: 0,
  })
  // 作业完成情况
  const [workData, setWorkData] = useState({
    garbageCleanFinish: 0,
    garbageCleanTotal: 0,
    garbageTransportFinish: 0,
    garbageTransportTotal: 0,
    machineFinish: 0,
    machineTotal: 0,
    manualFinish: 0,
    manualTotal: 0,
  })
  // 报警事件
  const [alarmList, setAlarmList] = useState<AlarmList>({
    alarmNumList: [],
    chainComparison: '',
    orgName: '',
    todayAlarmNum: 0,
  })
  const drawPoints = useCallback((points?: any[]) => {
    if (!mapInstance.current) return
    const style = [{
      url: point_purple,
      anchor: new AMap.Pixel(4, 4),
      size: new AMap.Size(9, 9)
    }, {
      url: point_yellow,
      anchor: new AMap.Pixel(4, 4),
      size: new AMap.Size(9, 9)
    }, {
      url: point_grey,
      anchor: new AMap.Pixel(4, 4),
      size: new AMap.Size(9, 9)
    }
    ];
    const markerLabel = [
      `background: #d4d4d4; border-radius: 4px; color: #3c3c3c; padding: 0 6px;`,
    ]
    mass.current = new AMap.MassMarks(points ? points : locationPoints, {
      alwaysRender: true,
      zIndex: 111,
      cursor: 'pointer',
      style: style,
    });
    const marker = new AMap.Marker({ content: ' ', map: mapInstance.current });
    mass.current.on('mouseover', function (e) {
      marker.setPosition(e.data.lnglat);
      marker.setContent(`
          <div style="${markerLabel[0]}"}>${e.data.name}</div>
        `)
    });
    mass.current.setMap(mapInstance.current);
  }, [mapInstance.current, locationPoints])
  useEffect(() => {
    const tis = setInterval(() => {
      mapInstance?.current?.clearMap();
      mass.current?.setMap(null);
      (async () => {
        const points: LocationPoint[] = JSON.parse(ungzip(await getLocations()))
        drawPoints(points.map(item => {
          const styleMapping = [1, 0, 2, 2] // 车 人 物 设施
          return {
            lnglat: [item.longitude, item.latitude],
            name: item.monitorName,
            type: item.monitorType,
            style: styleMapping[item.monitorType]
          }
        }))
      })()
    }, 1000 * 30)
    return () => { clearInterval(tis) }
  }, [])
  useEffect(() => {
    (async () => {
      const points: LocationPoint[] = JSON.parse(ungzip(await getLocations()))
      setLocationPoints(points.map(item => {
        const styleMapping = [1, 0, 2, 2] // 车 人 物 设施
        return {
          lnglat: [item.longitude, item.latitude],
          name: item.monitorName,
          type: item.monitorType,
          style: styleMapping[item.monitorType]
        }
      }))
      const [onlinDate, workData, alarmList] = await Promise.all([getOnlineRatio(), getWorkData(), getAlarmList()])
      onlinDate && setOnlineData(onlinDate)
      workData && setWorkData(workData)
      alarmList && setAlarmList(alarmList)
    })()
  }, [])
  const onMapLoaded = (map: AMap.Map) => {
    mapInstance.current = map
    drawPoints()
  }
  const calcuRatio = (num1: number, num2: number) => {
    if (num2 == 0) return '--'
    return Number((num1 * 100) / num2).toFixed(2) + '%'
  }
  return <div style={{ width: '100%', height: '100%' }}>
    <Map mapType={['TileLayer']} options={{ mapStyle: "amap://styles/grey" }} onSuccess={onMapLoaded} />
    <Clock />
    <div className={styles.lable}>
      <div>
        <span className={[styles.icon, styles.icon1].join(' ')}></span>
        <span>人员</span>
      </div>
      <div>
        <span className={[styles.icon, styles.icon2].join(' ')}></span>
        <span>车辆</span>
      </div>
      <div>
        <span className={[styles.icon, styles.icon3].join(' ')}></span>
        <span>垃圾桶</span>
      </div>
    </div>
    <div className={styles.left}>
      <Title title={alarmList.orgName} style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold' }} />
      <div style={{ color: '#fff', fontSize: '18px' }}>
        <p style={{ marginBottom: '0px' }}>今日报警数: <span>{alarmList.todayAlarmNum}</span></p>
        <p style={{ marginBottom: '24px' }}><span></span>
          <Tooltip placement="top" title={'今日0时至此时环卫报警数与昨日同时段环比所得'}>
            <div className={styles.tips}>
              <QuestionOutlined />
            </div>
          </Tooltip>
          &nbsp;环比：<span>{alarmList.chainComparison}</span></p>
      </div>
      <Box>
        <Title title="报警事件" />
        {
          alarmList.alarmNumList?.map((item, idx) => {
            return <Card key={idx} title={item.alarmName} value={item.alarmNum} />
          })
        }
      </Box>
    </div>
    <div className={styles.right}>
      <Box>
        <Title title="环卫作业情况" />
        <div className={styles.card2Wrap}>
          <Card2 title="人工作业完成度" value={calcuRatio(workData.manualFinish, workData.manualTotal)} />
          <Card2 title="机器作业完成度" value={calcuRatio(workData.machineFinish, workData.machineTotal)} />
          <Card2 title="垃圾清运完成度" value={calcuRatio(workData.garbageCleanFinish, workData.garbageCleanTotal)} />
          <Card2 title="垃圾转运完成度" value={calcuRatio(workData.garbageTransportFinish, workData.garbageTransportTotal)} />
        </div>
        <Title title="在线率" style={{ marginTop: "30px" }} />
        <div className={styles.card2Wrap}>
          <Card2 title="车辆在线率" value={calcuRatio(onlineData.vehicleOnline, onlineData.vehicleTotal)} />
          <Card2 title="人员在线率" value={calcuRatio(onlineData.peopleOnline, onlineData.peopleTotal)} />
          <Card2 title="设施在线率" value={calcuRatio(onlineData.facilityOnline, onlineData.facilityTotal)} />
        </div>
      </Box>
    </div>
  </div>
}

export default LeaderBorad