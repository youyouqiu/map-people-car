/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Component } from 'react';
// import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import moment from 'moment'
import { message, Spin, Tooltip, Tabs, Empty } from 'antd';
import { DownOutlined, UpOutlined, FastForwardOutlined } from '@ant-design/icons';
import { requestHistoryData, requestWorkObjects, requestMonitorIcon } from '@/server/workMonitoring'
import AmapContainer from "@/common/amapContainer";
import MapWrapper from "@/common/amapContainer/mapWrapper";
import Toolbar from './components/toolbar'
import { AllState } from '@/model';
import CommonTable from './components/table';
import WorkContent from './components/workContent';
import SearchForm from './components/search';
import styles from './index.module.less'
import { publicCarPath } from '@/framework/utils/publicCar';
import vehicleIcon from '@/static/image/vehicleIcon.png';
import peopleIcon from '@/static/image/people.png';
import VideoPlayback from './videoPlayback';
import VideoProgress from './videoProgress';
import getWebsocket, { WebSocketClass } from '@/framework/utils/webSocket';
import { getStore } from '@/framework/utils/localStorage';
import { monitorOnline } from "@/server/monitorManager";
const { TabPane } = Tabs;

const speedUnit = 800, barVW = 245 - 16;
let barUnitVW = 1, maxIndex = 0;
const mapPolygonStyle = {
  strokeColor: "#28F",
  strokeWeight: 2,
  strokeOpacity: 1,
  fillOpacity: 0.4,
  fillColor: '#1791fc',
  zIndex: 50,
};
/**
   * 时间戳转时间
   */
const formatDuring = (time: any) => {
  const days = Math.floor((time) / (86400000)); //天
  const hours = Math.floor((time % 86400000) / 3600000); //时
  const minutes = Math.floor((time % 3600000) / 60000); //分
  const seconds = Math.floor((time % 60000) / 1000); //秒
  // const times = [days, hours, minutes, seconds];
  return (days ? days + "天" : "")
    + (hours ? hours + "时" : "")
    + (minutes ? minutes + "分" : "")
    + (seconds ? seconds + "秒" : "");
}
/**
 * 作业状态
 */
const renderWorkStatus = (number: any) => {
  number = parseInt(number);
  switch (number) {
    case 0:
      return '有效作业';
    case 1:
      return '非有效作业';
    case 2:
      return '非作业';
    case 3:
      return '静止';
    case 4:
      return '行走';
    default:
      return '--';
  }
}

interface IProps {
  intl?: any;
  updateWorkObjectData: Function;
  currentSelectTreeNode: any;
  isVideo: boolean;
}

interface IState {

  loading: boolean,

  startTime: string,
  endTime: string,
  monitorId: string,

  tableData: Array<any>;
  trackData: Array<any>;
  polylineData: Array<[number, number]> | any;
  playStatus: boolean;
  playIndex: number;

  playTriple: number;
  tableToggle: boolean;

  _mapWrapper: MapWrapper | undefined;

  timeOut: boolean;
  tabsKey: string;
  isEmpty: boolean;

  videoPlayVisible: boolean;
  monitorInfo: any;  //监控对象信息
}

class RightContainer extends Component<IProps, IState, any>{
  startY: number; // 鼠标按下时的Y坐标
  isMoving: boolean; // 是否移动
  dragBarStartHeight: number; // 鼠标按下的top
  offsetY: number; // 偏移量
  dragHeight: number; // 拖动结束之后的高度
  mouseMoveHandler: (event: any) => void; // 鼠标移动的函数句柄
  mouseUpHandler: (event: any) => void; // 鼠标放开的函数句柄

  trackMapRef: React.RefObject<any> = React.createRef(); // 轨迹地图日期

  dragBarRef: React.RefObject<any> = React.createRef(); // 拖拽的分界线
  trackTableRef: React.RefObject<any> = React.createRef(); // 轨迹底部全部数据日期
  tableBoxRef: React.RefObject<any> = React.createRef();

  circleRef: React.RefObject<any> = React.createRef(); // 
  startX: number; // 鼠标按下时的Y坐标
  offsetX: number; // 移动
  offsetDis: number; // 移动
  progressMoveHandler: (event: any) => void; // 进度条移动的函数句柄
  progressUpHandler: (event: any) => void; // 进度条放开的函数句柄

  positionData: any;
  polygonData: any[];
  mapPolygons: any;
  // trackMapWrapper: MapWrapper;
  mapMarker: AMap.Marker;
  infoWindowLabel: AMap.InfoWindow;
  mapPolyline: AMap.Polyline;
  mapAreaPolyline: AMap.Polyline;
  mapBounds: Array<[number, number]>;
  moveDistance: number;
  monitorIconUrl: string = vehicleIcon;

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,

      _mapWrapper: undefined,

      startTime: '',
      endTime: '',
      monitorId: '',

      tableData: [],
      trackData: [],
      polylineData: [],
      playStatus: false,
      playIndex: 0,

      playTriple: 1,
      tableToggle: false,
      timeOut: true,

      tabsKey: '1',
      isEmpty: true,
      monitorInfo: {},
      videoPlayVisible: false
    };
  }

  /**
   * socket 实例
  */
  socket: WebSocketClass

  /**
   * 初始化socket
   */
  initSocket = () => {
    const token = getStore('token');
    console.log('token', token);
    this.socket = getWebsocket({ access_token: `Bearer ${token}` }, this.onSocketSuccess, this.onSocketClose)
  }

  /**
   * socket连接成功
   */
  onSocketSuccess = () => {
    console.log('socket success');
  }

  /**
   * socketL连接失败
   */
  onSocketClose = () => {
    console.log('socket close');
  }

  componentDidMount = () => {
    this.initSocket()
    this.setState({
      polylineData: [],
      isEmpty: true
    });
    maxIndex = 0
    // this.getMonitorIconUrl();
  }


  /**
   * 获取监控对象的图标
   */
  getMonitorIconUrl = async (workType: string, id: string) => {
    const param = {
      monitorIds: [id],
      isQueryProfessional: workType
    }

    const result: any = await requestMonitorIcon(param);
    if (result) {
      const { type, moType } = result[0];
      if (type) {
        if (type.iconId && type.iconId > 0 && type.iconId <= 10000) {
          this.monitorIconUrl = publicCarPath(type.iconId)
        } else if (type.iconUrl) {
          this.monitorIconUrl = type.iconUrl;
        } else if (moType === 0) {
          this.monitorIconUrl = vehicleIcon;
        } else {
          this.monitorIconUrl = peopleIcon;
        }
      }
    }
  }

  UNSAFE_componentWillReceiveProps = (nextProps: any) => {
    const { currentSelectDate, currentSelectTreeNode } = nextProps;

    // 重置
    maxIndex = 0;
    this.setState({
      tableData: [],
      polylineData: [],
    });
    if (this.infoWindowLabel) this.infoWindowLabel.close();
    if (this.mapMarker) this.mapMarker.setMap(null);
    if (this.mapPolyline) this.mapPolyline.setMap(null);
    if (this.mapAreaPolyline) this.mapAreaPolyline.setMap(null);
    // 清空地图上的区域覆盖物
    if (this.mapPolygons) {
      for (const i in this.mapPolygons) {
        const _polygon = this.mapPolygons[i];
        if (_polygon && _polygon.obj) _polygon.obj.setMap(null);
      }
      this.mapPolygons = null;
    }

    if (currentSelectTreeNode && currentSelectDate) {
      const { startTime, endTime, monitorId } = this.state;
      const currentId = currentSelectTreeNode.id;

      this.getMonitorIconUrl(currentSelectTreeNode.workType, currentId);

      if (currentId == monitorId && startTime == currentSelectDate.startTime && endTime == currentSelectDate.endTime) {
        this.startMarkerReset();
      }

      this.setState({
        startTime: currentSelectDate.startTime,
        endTime: currentSelectDate.endTime,
        monitorId: currentId,
        loading: true,
        tabsKey: '1',
        isEmpty: true,
        monitorInfo: {},
        videoPlayVisible: false
      }, () => {
        this.getHistoryDataByIdAndTime();
        this.getWorkObjectsByIdAndTime();
      })
    }
  }
  /**
   * 通过监控对象id和时间  获取历史数据
   */
  getHistoryDataByIdAndTime = async (start?: string, end?: string) => {
    const { startTime, endTime, monitorId } = this.state;
    const _format = "YYYYMMDDHHmmss";
    const _start = start ? moment(start).format(_format) : moment(startTime).format(_format),
      _end = end ? moment(end).format(_format) : moment(endTime).format(_format);

    //暫時注释
    if (!_start || !_end || !monitorId) {
      message.warn('请选择监控对象');
      return false;
    };

    const param = {
      monitorId: monitorId,
      startTime: _start,
      endTime: _end,
    }

    const result: any = await requestHistoryData(param);

    if (result) {
      // const data = JSON.parse(JSON.stringify(result));
      let prevItemTime;
      for (let i = 0; i < result.length; i++) {
        const itemTime = result[i].time;
        if (i === 0) {
          prevItemTime = result[i].time;
        } else {
          prevItemTime = result[i - 1].time
        }

        result[i].durationTime = this.timeDifference(itemTime, prevItemTime)
      }

      const len = result.length;
      this.positionData = result.slice(0, len);
      barUnitVW = barVW / len;
      if (this.positionData.length == 2) {
        barUnitVW = barVW
      }
      this.setState({
        tableData: result,
        tableToggle: true
      }, () => {
        // 数据成功后
        this.trackTableRef.current.style.height = "300px";
        this.trackMapRef.current.style.bottom = "300px";
        this.initMonitorPolyline();
      })
    }
  }

  /**
   * 间隔时间
   */
  timeDifference = (time: string, prevTime: string) => {
    const date: any = this.timeSubstring(time);
    const prevDate: any = this.timeSubstring(prevTime);
    return date - prevDate
  }

  timeSubstring = (time: string) => {
    const year = time.substring(0, 4);
    const month = time.substring(4, 6);
    const day = time.substring(6, 8);
    const hours = time.substring(8, 10);
    const minutes = time.substring(10, 12);
    const seconds = time.substring(12, 14);
    return new Date(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
  }

  /**
   * 获取标段
   */
  getWorkObjectsByIdAndTime = async (start?: string, end?: string) => {
    const { startTime, endTime, monitorId } = this.state;

    if (!monitorId) {
      message.warn('请选择监控对象');
      return false;
    };

    const param = {
      monitorId,
      startTime,
      endTime
    }

    if (start) param.startTime = start;
    if (end) param.endTime = end;

    const result: any = await requestWorkObjects(param);

    if (result) {
      const { workObjects, sectionFences } = result;
      if (workObjects && workObjects.length) {
        this.polygonData = workObjects.slice(0, workObjects.length);
      }
      const { updateWorkObjectData } = this.props;
      updateWorkObjectData && updateWorkObjectData(workObjects);
      // 清空地图上的区域覆盖物
      if (this.mapPolygons) {
        for (const i in this.mapPolygons) {
          const _polygon = this.mapPolygons[i];
          if (_polygon && _polygon.obj) _polygon.obj.setMap(null);
        }
        this.mapPolygons = null;
      }

      workObjects && this.initPolygon(workObjects);
      sectionFences && this.initAreaPolyline(sectionFences);
    }
  }

  /**
     * 地图加载完成事件
     * @param obj 
     */
  getInstance = (mapWrapper: MapWrapper) => { // 
    const _mapWrapper = mapWrapper;
    /**
    * 添加地图插件
    */
    _mapWrapper.map.plugin([
      "AMap.MapType",
      "AMap.ToolBar",
      "AMap.MouseTool",
      "AMap.PolyEditor",
      "AMap.Scale",
      "AMap.Marker",
      "AMap.DistrictSearch",
      "AMap.Polygon",
      "AMap.GeometryUtil",
      "AMap.Polyline"
    ], () => {
      // 默认加载卫星地图
      // _mapWrapper.changeMapType('amapSatellite');
    });
    this.setState({
      _mapWrapper
    })
  }

  /**
   * 地图发生变化时 重新获取边界坐标
   */
  onMapAreaChange = () => {
    const { _mapWrapper } = this.state;
    if (!_mapWrapper) return false;
    const bounds = _mapWrapper.map.getBounds();
    const southwest = bounds.getSouthWest(),//获取西南角坐标
      northeast = bounds.getNorthEast();//获取东北角坐标
    const possa = southwest.getLat(),
      possn = southwest.getLng();
    const posna = northeast.getLat(),
      posnn = northeast.getLng();
    this.mapBounds = [

      [possn, possa], //西南角坐标
      [posnn, posna]//东北角坐标
    ];
  }
  /**
   * 判断点有没有出线
   */
  isOutOfBounds = (lnglat: number[]) => {
    if (!this.mapBounds || !this.mapBounds.length) return false;
    if (
      lnglat[0] <= this.mapBounds[0][0]
      || lnglat[1] <= this.mapBounds[0][1]
      || lnglat[0] >= this.mapBounds[1][0]
      || lnglat[1] >= this.mapBounds[1][1]
    ) {
      return true;
    }
    return false;
  }

  /**
   * marker移动到下一个点   是否不能使用moveTo方法（不能检测到moveend回调）
   */
  shouldJump = (x1: number, y1: number, x2: number, y2: number) => {
    if (x2 == 0 && y2 == 0 || (x2 == 114.059264 && y2 == 22.612487)) {
      return true;
    }
    const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    let thresholdValue = 0.00002;
    const { playTriple } = this.state;
    const speed = playTriple * speedUnit;
    if (speed === 10000) {
      thresholdValue = 0.00004;
    } else if (speed === 20000) {
      thresholdValue = 0.00008;
    }
    if (distance <= thresholdValue) {
      return true;
    }
    return false;
  }
  /**
   * 获取选择的对象id和时间  获取监控对象的轨迹路线
   */
  initMonitorPolyline = () => {
    // const { _mapMarker, _mapPolyline } = this.state;
    const polylineData = [];
    /**
     * 历史数据经纬度为0的点位置取上一个，具体逻辑为：
     * 如果一个点的经纬度同时为0，则同时向前向后寻找经纬度不为0的点，向前方向优先，
     * 如果遍历所有点都找不到有经纬度的点，则该点保持原样，也就是整条线都是经纬度为0
     * 后面的经纬度是厂商的经纬度，有时候会自动跳到该点，所以也需要过滤
     */
    for (let i = 0, len = this.positionData.length; i < len; i += 1) {
      const element = this.positionData[i];
      // const prevElement = i > 0 ? this.positionData[i-1] : null;
      if ((element.latitude === '0.0' && element.longitude === '0.0') || (element.latitude === '22.612487' && element.longitude === '114.059264') || (element.latitude === 0 && element.longitude === 0)) {
        let toReplace = null;
        for (let j = 0, max = Math.max(i, len - i - 1); j < max; j += 1) {
          const prev = this.positionData[i - j];
          const next = this.positionData[i + j];
          if (prev && (prev.latitude !== '0.0' || prev.longitude !== '0.0') && (prev.latitude !== '22.612487' || prev.longitude !== '114.059264') && (element.latitude !== 0 && element.longitude !== 0)) {
            toReplace = prev;
          } else if (next && (next.latitude !== '0.0' || next.longitude !== '0.0') && (next.latitude !== '22.612487' || next.longitude !== '114.059264') && (element.latitude !== 0 && element.longitude !== 0)) {
            toReplace = next;
          }
          if (toReplace !== null) {
            break;
          }
        }
        if (toReplace !== null) {
          element.latitude = toReplace.latitude;
          element.longitude = toReplace.longitude;
        } else {
          element.latitude = 29.538918;
          element.longitude = 106.518214;
        }
      }
      // console.log("经纬度：", element.longitude, element.latitude)
      polylineData.push([element.longitude * 1, element.latitude * 1]);
    }
    // for (let i = 0, len = this.positionData.length; i < len; i++) {
    //   const item = this.positionData[i];
    //   const { latitude, longitude } = item;
    //   if (latitude && longitude) {
    //     polylineData.push([longitude * 1, latitude * 1]);
    //   }
    // }
    maxIndex = polylineData.length;
    this.setState({
      polylineData,
      playIndex: 0,
      playStatus: false,
      playTriple: 1,
      loading: false
    })
    // 移除地图上已经存在的轨迹和车辆标记
    if (this.infoWindowLabel) this.infoWindowLabel.close();
    if (this.mapMarker) this.mapMarker.setMap(null);
    if (this.mapPolyline) this.mapPolyline.setMap(null);
    if (maxIndex) this.initTrackMapPolyline(polylineData.slice(0, maxIndex));
  }
  /**
   * 标记红线
   */
  initAreaPolyline = (data: any) => {
    const { _mapWrapper } = this.state, _map = _mapWrapper && _mapWrapper.map;

    for (let i = 0; i < data.length; i++) {
      const path = JSON.parse(data[i])[0];
      this.mapAreaPolyline = new AMap.Polyline({
        path,
        isOutline: true,
        outlineColor: '#f00',
        borderWeight: 1,
        strokeColor: "#f00",
        strokeOpacity: 1,
        strokeWeight: 1,
        strokeStyle: "dashed",
        strokeDasharray: [5, 10],
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
      })
      if (_map) {
        _map.add(this.mapAreaPolyline);
        _map.setFitView(); // 根据地图上填充的内容，自适应缩放比例
      }
    }
  }
  /**
   * 标段
   */
  initPolygon = (data: any[]) => {
    const { _mapWrapper } = this.state, _map = _mapWrapper && _mapWrapper.map;

    if (data && data.length) {
      const mapPolygons: any = {};
      for (let i = 0, len = data.length; i < len; i++) {
        const path = JSON.parse(data[i].fenceLongLat);
        const workType = data[i].workType;
        let _polygon: any;
        let _Polyline: any;
        if (workType === 1) {
          _Polyline = new AMap.Polyline({
            ...mapPolygonStyle,
            path
          });
        } else {
          _polygon = new AMap.Polygon({
            ...mapPolygonStyle,
            path
          })
        }


        if (_map) {
          _map.add(workType === 1 ? _Polyline : _polygon);
          _map.setFitView(); // 根据地图上填充的内容，自适应缩放比例
          const item = {
            obj: workType === 1 ? _Polyline : _polygon,
            show: true
          }
          mapPolygons[data[i].name] = item;
        }
      }
      this.mapPolygons = { ...mapPolygons };
      // console.log("_polygons", this.mapPolygons)
    }
  }
  /**
   * 根据获取的路线  将路线添加到地图中
   * @param polylineData 
   */
  initTrackMapPolyline = (polylineData: any) => {
    const { _mapWrapper } = this.state;
    const { currentSelectTreeNode } = this.props;
    const monitorType = currentSelectTreeNode.monitorType;

    const icon = new AMap.Icon({
      image: this.monitorIconUrl,
      imageSize: monitorType == 1 && this.monitorIconUrl === peopleIcon ? new AMap.Size(39, 47) : new AMap.Size(65, 40),
      size: monitorType == 1 ? new AMap.Size(39, 47) : new AMap.Size(65, 40),
    });

    // this.mapMarker marker地图车辆标记
    // this.mapPolyline 轨迹数据
    // passedPolyline 已经走过的轨迹数据
    this.mapMarker = new AMap.Marker({
      position: [116.478935, 39.997761],
      icon: icon,
      offset: monitorType == 1 && this.monitorIconUrl === peopleIcon ? new AMap.Pixel(-18, -40) : new AMap.Pixel(-31, -17),
      autoRotation: true,
      angle: monitorType == 0 ? 90 : 0,
    }), this.mapPolyline = new AMap.Polyline({
      path: polylineData,
      showDir: true,
      strokeColor: "#28F",  //线颜色
      strokeWeight: 6,      //线宽
    });

    // marker移动过程中，将走过的路径设置到走过的轨迹数据中
    // this.mapMarker.on('moving', (e: any) => {
    // });
    this.mapMarker.on('moveend', () => {
      if (this.state.playStatus) this.markerMoveContinue();
    });
    if (_mapWrapper && _mapWrapper.map) {
      _mapWrapper.map.on('moveend', this.onMapAreaChange);
      _mapWrapper.map.on('complete', this.onMapAreaChange);
      _mapWrapper.map.add(this.mapPolyline); // 所有的轨迹数据
      _mapWrapper.map.add(this.mapMarker); // 移动的maker
      if (polylineData && maxIndex) {
        this.mapMarker.setPosition(polylineData[0]);
        this.settingMarkerLabelText();
      };
      _mapWrapper.map.setFitView(); // 根据地图上填充的内容，自适应缩放比例
      this.handleProgressPosition(0, false);
    }
  }
  /**
   * 根据播放索引 判断是否播放完毕   完成设置状态为false   反之增加索引，执行marker移动渲染方法
   */
  markerMoveContinue = () => {
    const { playIndex, playStatus } = this.state;
    const _index = playIndex + 1;

    if (!playStatus) return false;
    if (_index < maxIndex) {
      this.setState({
        playIndex: _index
      }, () => {
        this.handleProgressPosition(_index, false);
        this.renderMapMarker();
      })
    } else {
      this.handleProgressPosition(maxIndex - 1, false);
      this.setState({
        playStatus: false
      })
    }
  }
  /**
   * 根据当前索引获取当前位置点   判断marker移动至位置点的方式
   */
  renderMapMarker = () => {
    const { polylineData, playIndex, playTriple } = this.state;
    const { _mapWrapper } = this.state;
    if (!_mapWrapper) return false;
    const currentPoint: any = maxIndex && polylineData[playIndex];
    // 如果监控对象跑出了可视区域，重新定位地图中心为监控对象
    if (this.isOutOfBounds(currentPoint)) {
      _mapWrapper.map.setCenter(currentPoint);
    }
    const currentPosition: any = this.mapMarker.getPosition();
    const jumpStatus = this.shouldJump(currentPosition.lng, currentPosition.lat, currentPoint[0], currentPoint[1]);
    if (jumpStatus) {
      console.log('1111', playIndex);
      this.mapMarker.stopMove();
      this.mapMarker.setPosition(currentPoint);
      requestAnimationFrame(this.markerMoveContinue);
    } else {
      console.log('2222', playIndex);
      const speed = playTriple * speedUnit;
      this.mapMarker.moveTo(currentPoint, speed);
    }
  }
  /**
   * 开始播放
   */
  startMarkerMove = () => {
    if (!maxIndex) return false;
    if (this.infoWindowLabel) this.infoWindowLabel.close();
    this.setState({
      playStatus: true,
      timeOut: true
    }, () => {
      // console.log("startMarkerMove - 1")
      this.markerMoveContinue();
    })
  }
  /**
   * 暂停播放
   */
  startMarkerPause = () => {
    this.mapMarker && this.mapMarker.pauseMove();
    const { playIndex } = this.state;
    // console.log(playIndex)
    // console.log('playIndex', playIndex);
    this.handleProgressPosition(playIndex, false);
    this.setMapPosition(playIndex);
    this.setState({
      playStatus: false,
      timeOut: false
    }, () => {
      // this.settingMarkerLabelText();
    })
  }
  /**
   * 重置播放
   */
  startMarkerReset = () => {
    this.mapMarker && this.mapMarker.pauseMove();
    this.setState({
      playStatus: false,
      playIndex: 0,
      timeOut: true
    }, () => {
      this.handleProgressPosition(0, true);
      // this.setMapPosition(0);
    })
  }
  /**
   * 车辆点向前移动
   */
  startMarkerBackward = () => {
    this.mapMarker && this.mapMarker.pauseMove();
    let { playIndex } = this.state;
    if (playIndex > 0) {
      playIndex -= 1;
      this.setState({
        playStatus: false,
        playIndex
      }, () => {
        this.handleProgressPosition(playIndex, false);
        this.setMapPosition(playIndex);
      })
    } else {
      message.warn("已经是第一个点了");
      this.setState({
        playStatus: false
      })
    }
  }
  /**
   * 车辆点向后移动
   */
  startMarkerForward = () => {
    this.mapMarker && this.mapMarker.pauseMove();
    const { playIndex } = this.state;
    const _index = playIndex + 1;
    if (_index < maxIndex) {
      this.setState({
        playStatus: false,
        playIndex: _index
      }, () => {
        this.handleProgressPosition(_index, false);
        this.setMapPosition(_index);
      })
    } else {
      message.warn("已经是最后一个点了");
      this.setState({
        playStatus: false
      })
    }
  }

  /**
   * 根据index设置车辆标记点marker的位置
   */
  setMapPosition = (index: number) => {
    const { polylineData } = this.state;
    const current = this.positionData[index], angle = parseInt(current.direction) + 270;
    if (polylineData && maxIndex) {
      this.mapMarker.setAngle(angle);
      this.mapMarker.setPosition(polylineData[index]);
      this.settingMarkerLabelText();
    }
  }

  /**
   * 設置车辆标记点文本
   */
  settingMarkerLabelText = () => {
    const currentItem = this.positionData[this.state.playIndex];
    if (currentItem) {
      const content = `<div class='label-info'>${currentItem.monitorName}</div>`;
      // 创建 infoWindow 实例 
      if (this.infoWindowLabel) {
        this.infoWindowLabel.setContent(content);
      } else {
        this.infoWindowLabel = new AMap.InfoWindow({
          isCustom: true,
          content: content,
          offset: new AMap.Pixel(72, 22),
          closeWhenClickMap: true
        });
      }
      const { _mapWrapper } = this.state;
      if (_mapWrapper && _mapWrapper.map) this.infoWindowLabel.open(_mapWrapper.map, this.mapMarker.getPosition());
    }
  }

  /**
  * 播放倍速切换
  */
  changePlayTriple = () => {
    let { playTriple } = this.state;
    if (playTriple === 4) {
      playTriple = 0.5
    } else if (playTriple === 0.5) {
      playTriple = 1
    } else {
      playTriple *= 2;
    }
    this.setState({
      playTriple
    })
  }

  /**
   * 地图下表格点击收缩
   * @param event 
   */
  handleCollapseTable = () => {
    const { tableToggle } = this.state;
    this.setState({
      tableToggle: !tableToggle
    }, () => {
      if (!tableToggle) {
        const height = this.trackTableRef.current.clientHeight;
        this.trackTableRef.current.style.height = "300px";
        this.trackMapRef.current.style.bottom = "300px";
      } else {
        this.trackTableRef.current.style.height = '50px';
        this.trackMapRef.current.style.bottom = '44px';
      }
    })
  }
  /**
     *  绑定拖拽事件   鼠标按下事件
    **/
  hanleMouseDown = (event: React.MouseEvent) => {
    if (!this.isMoving) {
      this.isMoving = true
      const dragBar = this.dragBarRef.current;
      dragBar.style.background = "#6dcff6";
      //保存按下初始位置
      this.startY = event.clientY;
      const trackTable = this.trackTableRef.current;
      this.dragBarStartHeight = trackTable.offsetHeight;
      this.mouseMoveHandler = this.handleMouseMove;
      this.mouseUpHandler = this.handleMouseUp;
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHandler);
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      return false
    }
  };

  /**
   * 鼠标拖动事件
   * @param event 
   */
  handleMouseMove = (event: React.MouseEvent) => {
    if (this.isMoving) {
      this.offsetY = this.startY - event.clientY;
      const trackTable = this.trackTableRef.current;
      const trackMap = this.trackMapRef.current;
      const tableBoxRef = this.tableBoxRef.current;
      let currentHeight = this.offsetY + this.dragBarStartHeight;
      if (currentHeight <= 4) currentHeight = 4;
      if (currentHeight >= 500) currentHeight = 500;
      if (currentHeight <= 60) currentHeight = 60;
      trackMap.style.bottom = currentHeight + 'px';
      trackTable.style.height = currentHeight + 'px';
      tableBoxRef.style.height = (currentHeight - 60) + 'px'
    }
  };

  /**
   * 鼠标放开事件
   */
  handleMouseUp = () => {
    if (this.isMoving) {
      this.isMoving = false;
      const dragBar = this.dragBarRef.current;
      dragBar.style.background = "#c5c5c5";
      document.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mouseup', this.mouseUpHandler);
      let currentHeight = this.offsetY + this.dragBarStartHeight;
      if (currentHeight >= 500) currentHeight = 500;
      if (currentHeight <= 60) currentHeight = 60;
      if (this.dragHeight != currentHeight) {
        this.dragHeight = currentHeight;
        this.trackMapRef.current.style.bottom = currentHeight + 'px';
        this.trackTableRef.current.style.height = currentHeight + 'px';
        if (currentHeight == 4) {
          this.setState({
            tableToggle: false
          })
        } else {
          this.setState({
            tableToggle: true
          })
        }
      }
    }
  };

  /**
   * 轨迹进度条
   */
  renderTrackProgress = (data: any[]) => {
    const len = data.length;
    return (
      <div className={styles.playControlBar}>
        <svg width="100%" height="16" version="1.1" xmlns="http://www.w3.org/2000/svg">
          {
            data && len ?
              <>
                {
                  data.map((item, index) => {
                    const x2 = index * barUnitVW, x1 = index >= 1 ? x2 - barUnitVW : 0;
                    const _style = {
                      stroke: !item.speed || item.speed == '0B/min' || item.speed == "0.0km/h" ? "#f99" : "#4590f7",
                      strokeWidth: 5
                    }
                    return <line key={index} x1={x1 + 8} y1="8" x2={x2 + 8} y2="8" style={_style} />
                  })
                }
              </>
              :
              <>
                <line x1="0" y1="8" x2="100%" y2="5" style={{
                  stroke: "#f99",
                  strokeWidth: 5
                }} />
              </>
          }
          <circle cx="8" cy="8" r="8" fill='#4590f7' ref={this.circleRef} onMouseDown={this.hanleProgressMouseDown} />
        </svg>
      </div>
    )
  }

  /**
   * 进度条拖动开始事件
   */
  hanleProgressMouseDown = (event: React.MouseEvent) => {
    if (!maxIndex) return false;
    if (!this.isMoving) {
      this.isMoving = true
      this.startX = event.clientX;
      const dragBar = this.circleRef.current;
      const transform = dragBar.style.transform, transforms = transform ? transform.split("(") : [], offsetVW = transforms.length && transforms[1].split("px")[0];
      this.offsetDis = parseInt(offsetVW);
      if (dragBar.style.transform) dragBar.style.transform = dragBar.style.transform;
      this.progressMoveHandler = this.handleProgressMove;
      this.progressUpHandler = this.handleProgressUp;
      document.addEventListener('mousemove', this.progressMoveHandler);
      document.addEventListener('mouseup', this.progressUpHandler);
      if (event.stopPropagation) event.stopPropagation();
      if (event.preventDefault) event.preventDefault();
      return false
    }
  };
  /**
   * 进度条拖动事件
   * @param event 
   */
  handleProgressMove = (event: React.MouseEvent) => {
    if (this.isMoving) {
      this.offsetX = event.clientX - this.startX;
      // const dragBar = this.circleRef.current;
      const currentX = this.offsetX + this.offsetDis;
      // if(currentX <= 0) currentX = 0;
      // if(currentX >= barVW) currentX = barVW;
      const index = Math.round(currentX / barUnitVW);
      // const currentPoint: any = maxIndex && polylineData[currentIndex];
      // this.mapMarker.setPosition(currentPoint);
      // dragBar.style.transform = `translateX(${currentX}px)`;
      this.handleProgressPosition(index, true);
    }
  };
  /**
   * 进度条拖动放开事件
   */
  handleProgressUp = () => {
    if (this.isMoving) {
      this.isMoving = false;
      document.removeEventListener('mousemove', this.progressMoveHandler);
      document.removeEventListener('mouseup', this.progressUpHandler);
      // console.log("handleProgressUp", currentIndex, this.offsetDis)
      // this.setMapPosition(currentIndex);
      // this.setState({
      //   playIndex: currentIndex
      // })
    }
  };

  /**
   * 设置进度条的位置
   */
  handleProgressPosition = (index: number, move: boolean) => {
    // const { polylineData } = this.state;
    if (index <= 0) index = 0;
    if (index >= maxIndex - 1) index = maxIndex - 1;

    if (this.circleRef.current) {
      const dragBar = this.circleRef.current;
      const currentX = index * barUnitVW;
      dragBar.style.transform = `translateX(${currentX}px)`;

      if (move) {
        this.setState({
          playIndex: index
        });

        this.setMapPosition(index);
      }
    }
  }


  /**
   * 底部全部数据表格  单行点击  跳转至相应的轨迹位置
   */
  handleItemClick = (index: number) => {
    if (index != -1) {
      this.mapMarker && this.mapMarker.pauseMove();
      this.setState({
        playIndex: index
      }, () => {
        this.handleProgressPosition(index, false);
        this.setMapPosition(index)
      })
    };
  }
  renderEmpty = (text: any) => {
    return text ? text : '--'
  }
  /**
   * 时间选择
   */
  handleTimeChange = (dateStr: any) => {
    const { currentSelectTreeNode } = this.props;
    this.setState({
      monitorId: currentSelectTreeNode.id
    }, () => {
      if (dateStr) {
        this.getHistoryDataByIdAndTime(dateStr[0], dateStr[1]);
        this.getWorkObjectsByIdAndTime(dateStr[0], dateStr[1]);
      }
    });

  }

  //
  handleWorkItemClick = (str: any, prop: string) => {
    if (this.mapPolygons) {
      const current = this.mapPolygons[prop];
      if (current.show) {
        current.obj.hide();
      } else {
        current.obj.show();
      }
      current.show = !current.show;
    }
  }

  /**
   * 视频回放
   */
  videoPlayback = (record: any) => {
    const monitorId = record.monitorId;
    const monitorName = record.monitorName;
    const startTime = record.time;
    const endTime = startTime.substring(0, 8) + '235959';
    monitorOnline(monitorId).then((res) => {
      if (res) {
        this.setState({
          monitorInfo: { monitorId, monitorName, startTime, endTime },
          isEmpty: false,
          tabsKey: '2',
          videoPlayVisible: true,
        });
      } else {
        message.error('终端已离线', 2)
      }
    })
  }

  /**
   * 数据列/播放列 切换
   */
  onChange = (activeKey: string) => {
    this.setState({
      tabsKey: activeKey
    })
  }

  /**
   * 关闭视频回放抽屉
   */
  closeVideoPlayDrawer = () => {
    this.setState({
      monitorInfo: {},
      isEmpty: true,
      tabsKey: '1',
      videoPlayVisible: false,
    });
  }


  render() {
    const { isEmpty, tabsKey, tableToggle, tableData, playStatus, playIndex, playTriple, polylineData, _mapWrapper, loading,
      timeOut, monitorInfo, videoPlayVisible } = this.state;
    const columns: any = [
      {
        title: '序号', //
        width: 100,
        align: 'center' as const,
        render: (text: any, record: any, index: any) => `${index + 1}`,
      },
      {
        title: '操作',
        dataIndex: 'monitorId',
        width: 150,
        align: 'center',
        render: (text: any, record: any) => {
          return (
            this.props.isVideo ? <a onClick={this.videoPlayback.bind(this, record)}>视频回放</a> : '未设通道参数'
          )
        }
      },
      {
        title: '定位时间',
        dataIndex: 'time',
        width: 160,
        align: 'center',
        render: (text: any) => {
          const year = text.substring(0, 4), month = text.substring(4, 6), day = text.substring(6, 8);
          const hh = text.substring(8, 10), mm = text.substring(10, 12), ss = text.substring(12, 14);
          const date = [year, month, day], time = [hh, mm, ss];
          return date.join("-") + ' ' + time.join(":");
        }
        // fixed: true
      },
      {
        title: '间隔时间', //车牌颜色'',
        dataIndex: 'durationTime',
        width: 120,
        align: 'center',
        render: (text: any) => {
          return text ? formatDuring(text) : '0秒'
        }
      },
      {
        title: '终端号', //定位时间'',
        dataIndex: 'deviceNumber',
        width: 120,
        align: 'center'
      },
      {
        title: '终端手机号', //间隔时间'',
        dataIndex: 'simCard',
        width: 120,
        align: 'center'
      },
      {
        title: 'ACC状态', //ACC状态'',
        dataIndex: 'acc',
        width: 120,
        align: 'center',
        render: (data: number) => {
          return data == 1 ? '开' : data == 0 ? '关' : '--';
        }
      },
      {
        title: '作业状态', //速度（km/h）'',
        dataIndex: 'workStatus',
        width: 120,
        align: 'center',
        render: renderWorkStatus
      },
      {
        title: '设备开启状态', //总里程（km）'',
        dataIndex: 'functionStatus',
        width: 120,
        align: 'center',
        render: (text: any) => {
          if (text) {
            return (
              <Tooltip placement="top" title={text}>
                {text}
              </Tooltip>
            )
          } else {
            return '--'
          }
        }
      },
      {
        title: '速度', //方向'',
        dataIndex: 'speed',
        width: 120,
        align: 'center',
        render: this.renderEmpty
      },
      {
        title: '总里程(km)', //定位方式'',
        dataIndex: 'gpsMileage',
        width: 120,
        align: 'center',
        render: this.renderEmpty
      },
      {
        title: '经度', //卫星颗数'',
        dataIndex: 'longitude',
        width: 120,
        align: 'center'
      },
      {
        title: '纬度', //经度'',
        dataIndex: 'latitude',
        width: 120,
        align: 'center'
      },
      {
        title: '位置', //纬度'',
        dataIndex: 'address',
        width: 160,
        align: 'center',
      }
    ]

    return (
      <Spin spinning={loading} size={'large'}>
        <div className={styles.rightContainer}>
          <div className={styles['trackPlayback-map']} ref={this.trackMapRef}>
            <div className={styles['trackMap-container']}>
              <div className={videoPlayVisible ? styles.amapSizeSmall : styles.amapSizeBig}>
                <AmapContainer
                  getInstance={this.getInstance}
                  amapOption={{ zoom: 18 }}
                />
                {/* 查询 */}
                <SearchForm onInquire={this.handleTimeChange} />
                {/* 工具条 */}
                {_mapWrapper && <Toolbar mapWrapper={_mapWrapper} />}
                {/* 右上角作业内容 */}
                <WorkContent itemClick={this.handleWorkItemClick} />
                {
                  polylineData && maxIndex ?
                    <div className={styles.trackControl}>

                      <div className={styles.playControlContainer}>
                        <div className={styles.playControlButton}>
                          <Tooltip placement="top" title={'上个点'}>
                            <div className={styles.playControlBackward} onClick={this.startMarkerBackward}></div>
                          </Tooltip>
                          <Tooltip placement="top" title={!playStatus ? '播放' : '暂停'}>
                            {
                              !playStatus ? <div className={styles.playControlStart} onClick={this.startMarkerMove}></div>
                                : <div className={styles.playControlPause} onClick={this.startMarkerPause}></div>
                            }
                          </Tooltip>
                          <Tooltip placement="top" title={'重置'}>
                            <div className={styles.playControlReset} onClick={this.startMarkerReset}></div>
                          </Tooltip>
                          <Tooltip placement="top" title={'下个点'}>
                            <div className={styles.playControlForward} onClick={this.startMarkerForward}></div>
                          </Tooltip>
                          <Tooltip placement="top" title={'当前播放倍速：' + playTriple}>
                            <div className={styles.playControlTriple} onClick={this.changePlayTriple}>
                              <FastForwardOutlined style={{
                                fontSize: 24
                              }} />
                            </div>
                          </Tooltip>
                        </div>
                        <div className={styles.playControlProgress}>
                          {this.renderTrackProgress(tableData)}
                        </div>
                      </div>
                    </div>
                    : null
                }
              </div>
              {
                videoPlayVisible && <VideoPlayback
                  getContainer={this.trackMapRef.current}
                  monitorInfo={monitorInfo}
                  closeVideoPlayDrawer={this.closeVideoPlayDrawer}
                />
              }


              <div className={styles.playControlShrink} onClick={this.handleCollapseTable}>
                {
                  tableToggle ? <DownOutlined /> : <UpOutlined />
                }
              </div>

              <Tabs activeKey={tabsKey} onChange={this.onChange}>
                <TabPane tab="轨迹数据" key='1'>
                  <div style={{ marginTop: 4 }} ref={this.trackTableRef}>
                    <div className={styles['drag-bar']} onMouseDown={this.hanleMouseDown} ref={this.dragBarRef}></div>
                    {
                      tableToggle ? <div ref={this.tableBoxRef}>
                        <CommonTable timeOut={timeOut} currentIndex={playIndex} columns={columns} dataSource={tableData} itemClick={this.handleItemClick} />
                      </div>
                        : null
                    }
                  </div>
                </TabPane>
                <TabPane tab='播放列表' key='2'>
                  <div className={styles.videoProgressBox} >
                    <VideoProgress
                      webSocket={this.socket}
                      monitorInfo={monitorInfo}
                      isEmpty={isEmpty}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </div>
          </div>

        </div>
      </Spin>
    )
  }
}
export default connect(
  (state: AllState) => ({
    currentSelectTreeNode: state.workPlayTrack.currentSelectTreeNode,
    currentSelectDate: state.workPlayTrack.currentSelectDate,
    isVideo: state.workPlayTrack.isVideo
  }),
  dispatch => ({
    updateWorkObjectData: (payload: any) => {
      dispatch({ type: 'workPlayTrack/changeWorkObjectDataEvery', payload });
    }
  })
)(RightContainer);