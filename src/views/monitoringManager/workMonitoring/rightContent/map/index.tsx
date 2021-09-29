/**
 * 地图模块
 */
import React, { useState, useEffect, memo, useRef } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import LoadMap from '@/common/mapEngine';
import Toolbar from './toolbar';
import vehicleIcon from '@/static/image/vehicleIcon.png';
import peopleIcon from '@/static/image/people.png';
import thingIcon from '@/static/image/thing.png';
import { message } from 'antd';
import { getMonitorWindowInfo } from '@/server/workMonitoring';
import { getMonitorStatus } from '../../publicFun';
import { getStore } from '@/framework/utils/localStorage';
import { INodeItem } from '@/framework/utils/tree';
import { useHistory } from 'react-router-dom';
import channel from '../../channel';
import MonitorWindow from './monitorWindow';
import styles from '../../index.module.less';
import { publicCarPath } from '@/framework/utils/publicCar';
import ReactDOM from 'react-dom';
import { monitorIsOnline } from '@/framework/utils/function';
import Weather from './weather';


// 海量点数据类型
interface IMassMarker {
  iconUrl?: string,
  latitude?: number,
  longitude?: number,
  monitorId?: number,
  monitorName?: string,
  monitorType?: number,
  name?: string,
  status?: number,
  time?: string,
  iconId?: number;
  monitorKey?: string,
  workType?: number,
}



let curFocusingTrack: any;// 当前聚焦跟踪的对象
let infoMonitor: any;// 显示弹窗的监控对象信息
const monitorNameMarkerMap: any = {// 存放监控对象名称marker集合Map<number, { status: string, marker: any }>
  people: new Map(),
  vehicle: new Map()
};
const MapComponent = memo(() => {
  const videoAciveEl = useRef(null);
  const trajectoryEl = useRef(null);
  const trackingEl = useRef(null);
  const history = useHistory();
  const refObj: any = useRef({
    wakePolyline: null,// 尾迹线段
    subscribeMonitor: null,// 聚焦订阅的监控对象信息
    infoWindow: null,// 地图监控对象弹窗信息显示
    drawMonitor: {
      people: [],
      vehicle: []
    }
  })
  const dispatch = useDispatch();
  // 当前显示的地图
  const [currentMap, setcurrentMap] = useState<any>('amap');
  // 地图实例
  const [mapWrapper, setMapWrapper] = useState<any>();
  // 地图海量点
  const defaultMassMarks = {
    people: {
      data: null,
      nameMarker: [],
    }, vehicle: {
      data: null,
      nameMarker: [],
    }
  };
  const [massMarks, setMassMarks] = useState<any>(defaultMassMarks);
  const [facilityMassMarks, setFacilityMassMarks] = useState<any>();
  // 显示设施名称的marker
  const [monitorNameMarker, setMonitorNameMarker] = useState<any>();
  // 地图上显示的标段图形(数据格式{key:'标段id',data:图形)
  const [sectionPolygon, setSectionPolygon] = useState<any>();
  // 地图上显示的作业对象图形(数据格式{key:'作业对象id',value:图形)
  const [workObjectGraph, setWorkObjectGraph] = useState<any>();

  // 连接redux数据
  const { globalSocket, mapCenterPos, mapSection, mapWorkObject, mapMonitor, focusingTrack, focusMonitor, monitorStatusMap, currentSelectTreeNode } = useSelector(({
    workMonitoring: {
      mapCenterPos,// 地图中心点经纬度
      mapSection,// 地图显示的标段数据
      mapWorkObject,// 地图上显示的作业对象(线路,区域,清运区域)
      mapMonitor,// 地图上显示的监控对象集合 
      focusMonitor,// 聚焦显示的监控对象信息
      focusingTrack,// 聚焦跟踪的对象信息
      monitorStatusMap,// 存储监控对象状态的Map集合
      currentSelectTreeNode,// 当前选中的节点信息
    },
    root: {
      globalSocket,// 全局socket对象
    }
  }: any) => {
    return {
      mapCenterPos,
      mapSection,
      mapWorkObject,
      mapMonitor,
      focusingTrack,
      focusMonitor,
      monitorStatusMap,
      currentSelectTreeNode,
      globalSocket
    }
  }, shallowEqual);

  useEffect(() => {
    history.listen(listenRouter);
  }, [mapWrapper])

  /**
   * 监听路由变化
   * 回到本页面时设置地图中心点为信息窗体位置
   */
  const listenRouter = (route: any) => {
    const { pathname } = route;
    if (pathname === '/view/monitoringManager/workMonitoring') {
      const { infoWindow } = refObj.current;
      if (infoWindow.getIsOpen()) {
        const lnglat: any = [infoMonitor.longitude, infoMonitor.latitude];
        mapWrapper?.map.setCenter(lnglat);
      }
    }
  }

  useEffect(() => {
    if (workObjectGraph) {// 移除之前的作业对象
      const deleteGraph: any = [];
      Object.keys(workObjectGraph).map(key => {
        deleteGraph.push(workObjectGraph[key]);
      })
      if (mapWrapper) mapWrapper.map.remove(deleteGraph);
    }
  }, [currentSelectTreeNode])

  // 监控对象状态变化,改变marker显示状态
  useEffect(() => {
    if (monitorStatusMap) {
      const vehicleArr = Array.from(monitorNameMarkerMap.vehicle.values());
      const peopleArr = Array.from(monitorNameMarkerMap.people.values());
      const vehicleMap = [...vehicleArr];
      const peopleMap = [...peopleArr];
      vehicleMap.map((item: any) => {
        if (!item) return;
        const { monitorId, status, showName, marker } = item;
        const curStatus = monitorStatusMap.data ? monitorStatusMap.data.get(monitorId) : null;
        if (curStatus !== null && curStatus !== status) {
          if (!getMonitorStatus(curStatus)) return;
          const content = `<div class='${styles.monitorName}'>${getMonitorStatus(curStatus)}${showName}</div>`;
          marker.setContent(content);
          item.status = curStatus;
          monitorNameMarkerMap.vehicle.set(monitorId, item);
          return item;
        }
      })
      peopleMap.map((item: any) => {
        if (!item) return;
        const { monitorId, status, showName, marker } = item;
        const curStatus = monitorStatusMap.data ? monitorStatusMap.data.get(monitorId) : null;
        if (curStatus !== null && curStatus !== status) {
          if (!getMonitorStatus(curStatus)) return;
          const content = `<div class='${styles.monitorName}'>${getMonitorStatus(curStatus)}${showName}</div>`;
          marker.setContent(content);
          item.status = curStatus;
          monitorNameMarkerMap.people.set(monitorId, item);
          return item;
        }
      })
    }
  }, [monitorStatusMap])

  // 地图中心点变化
  useEffect(() => {
    if (mapWrapper && mapCenterPos) {
      mapWrapper.map.setCenter(mapCenterPos);
    }
  }, [mapCenterPos])

  // 地图聚焦显示的监控对象信息变化
  useEffect(() => {
    clearWakePolyline();
    const { current: { subscribeMonitor } } = refObj;
    if (subscribeMonitor) {// 取消上一个聚焦监控对象的位置信息订阅
      onSocketSucces(2, subscribeMonitor.monitorId);
    }
    refObj.current.subscribeMonitor = focusMonitor;
    if (mapWrapper && focusMonitor) {
      monitorFilter(focusMonitor);
      onSocketSucces(1, focusMonitor.monitorId);
    }
  }, [focusMonitor])

  // 监听地图显示标段数据变化绘制标段图形
  useEffect(() => {
    if (mapWrapper && mapSection) {
      const { id } = mapSection;
      if (!sectionPolygon || (sectionPolygon && sectionPolygon.key !== id)) {
        renderSection(mapSection);
      } else if (sectionPolygon && sectionPolygon.key === id) {
        mapWrapper.map.setFitView(sectionPolygon.data);
      }
      clearWakePolyline();
    }
  }, [mapSection, mapWrapper])

  // 监听地图显示作业对象数据变化
  useEffect(() => {
    if (mapWorkObject !== null) {
      if (workObjectGraph) {// 移除之前的作业对象
        const deleteGraph: any = [];
        Object.keys(workObjectGraph).map(key => {
          deleteGraph.push(workObjectGraph[key]);
        })
        if (mapWrapper) mapWrapper.map.remove(deleteGraph);
      }
      // 在地图上绘制相应作业对象
      mapWorkObject.forEach((value: any) => {
        renderWorkObject(value);
      })
      clearWakePolyline();
    }
  }, [mapWorkObject])

  // 监听地图显示监控对象数据变化
  useEffect(() => {
    if (mapMonitor) {
      if (mapMonitor instanceof Array) {
        mapMonitor.map(item => renderMassMarks(item));
        return;
      }
      if (mapMonitor.type === 'facility') {
        renderFacilityMassMarks(mapMonitor);
      } else {
        renderMassMarks(mapMonitor);
      }
      clearWakePolyline();
    }
  }, [mapMonitor])

  // 监听地图聚焦跟踪对象数据变化
  useEffect(() => {
    if (focusingTrack) {
      // 清除之前设置的海量点刷新定时器
      const windowObj: any = window;
      if (windowObj.mapPointTimer) {
        clearInterval(windowObj.mapPointTimer);
        windowObj.mapPointTimer = undefined;
      }

      clearWakePolyline();
      curFocusingTrack = focusingTrack;
      monitorFilter(focusingTrack);
      onSocketSucces();
    } else {
      clearWakePolyline();
    }
  }, [focusingTrack])

  /**
   * socket 连接成功
   */
  function onSocketSucces(typeStatus?: number, monitorId?: string) {
    if (!globalSocket) return;
    // const token = getStore('token');
    // const header = { access_token: `Bearer ${token}` };
    const header = {};
    const requestStr = { data: { monitorIds: [monitorId ? monitorId : curFocusingTrack.monitorId] }, desc: { type: typeStatus ? typeStatus : 1 } }// type: 1订阅,2取消订阅
    globalSocket.subscribeAndSend('/user/queue/monitor/location', getLocation, '/app/monitor/location', header, requestStr);
  }

  /**
   * socket回调方法
   * @param res 
   */
  const getLocation = (res: any) => {
    const result = JSON.parse(res.body);
    console.log('socket result', result);
    const { monitorId: curMonitorId } = result.monitorInfo;
    const data = curFocusingTrack || refObj.current.subscribeMonitor;
    if (!data) return;
    const monitorId = data.monitorId;
    if (curMonitorId === monitorId) {
      const { longitude, latitude, direction } = result.gpsInfo;
      if ((!longitude || !latitude) || (data.longitude === longitude && data.latitude === latitude)) return;
      const angle = calcAngle([data.longitude, data.latitude], [longitude, latitude])
      data.longitude = longitude;
      data.latitude = latitude;
      data.direction = direction;
      data.windowResult = null;
      monitorFilter(data, angle, true);// 监控对象图标移动
      if (curFocusingTrack) {// 跟踪监控对象时,需要绘制尾迹
        const { current: { wakePolyline } } = refObj;
        let path = [[data.longitude, data.latitude]];
        if (wakePolyline !== null) {
          path = wakePolyline.path;
        }
        path.push([longitude, latitude]);
        renderWakePolyine(path);// 绘制尾迹
      }
    }
  }

  /**
   * 清除尾迹及socket订阅
   */
  function clearWakePolyline() {
    if (focusMonitor) {
      onSocketSucces(2, focusMonitor.monitorId);// 取消之前车辆的订阅
    }
    if (curFocusingTrack) {
      onSocketSucces(2);// 取消之前车辆的订阅
      // 移除之前绘制的尾迹线段
      const { current: { wakePolyline } } = refObj;
      if (mapWrapper && wakePolyline) {
        mapWrapper.map.remove(wakePolyline.polyline);
      }
      refObj.current.wakePolyline = null;
      curFocusingTrack = null;
    }
  }

  /**
  * 判断监控对象是否已绘制
  */
  function monitorFilter(focusMonitor: INodeItem, angle?: number, notShow?: boolean) {
    if (!mapWrapper) return;
    const { monitorId, monitorType, monitorKey, longitude, latitude, direction, workType, windowResult } = focusMonitor;
    if (!longitude || !latitude) return;
    let type;
    if (monitorType === 0) {
      type = 'vehicle';
    } else if (monitorType === 1) {
      type = 'people';
    } else {
      type = 'facility';
    }
    const hasMonitorData = [];
    const { map } = mapWrapper;
    if (massMarks[type].data) {// 如果已经绘制过该类型的海量点
      const allData = massMarks[type].data.getData();
      const styles = massMarks[type].data.getStyle();
      let index = -1;
      for (let i = 0; i < allData.length; i += 1) {
        const item = allData[i];
        if (item.id === monitorId) {
          styles[i].rotation = angle ? angle : direction;// 修改角度
          if (angle !== undefined) {
            if (monitorType === 0) {
              styles[i].anchor = map.pixel(30, 15);
            } else {
              styles[i].anchor = map.pixel(6, 20);
            }
          }
          item.lnglat = [longitude, latitude];// 修改位置
          hasMonitorData.push(item);
          index = i;
          break;
        }
      }
      if (angle === undefined) {
        const nameArr = [...massMarks.vehicle.nameMarker, ...massMarks.people.nameMarker];
        for (let i = 0; i < nameArr.length; i += 1) {
          const marker = nameArr[i];
          if (marker.getzIndex() > 100) {
            marker.setzIndex(100);
          }
        }
      }

      if (hasMonitorData.length > 0) {
        const marker = massMarks[type].nameMarker[index];
        marker.setPosition([longitude, latitude]);
        marker.setzIndex(101);

        if (index === 0 || index !== allData.length - 1) {// 将监控对象标注显示至最上层级
          allData.splice(index, 1);
          allData.push(hasMonitorData[0]);

          const item = massMarks[type].nameMarker.splice(index, 1)[0];
          massMarks[type].nameMarker.push(item);
        }
        if (massMarks[type].data.Ce) {
          const zIndex = 2000;
          if (type === 'vehicle') {
            if (massMarks.people.data) {
              massMarks.people.data.Ce.zIndex = 999;
            }
          } else {
            if (massMarks.vehicle.data) {
              massMarks.vehicle.data.Ce.zIndex = 999;
            }
          }
          massMarks[type].data.Ce.zIndex = zIndex;
        }
        massMarks[type].data.clear();
        massMarks[type].data.setStyle(styles);
        massMarks[type].data.setData(allData);
      }
    }
    if (hasMonitorData.length > 0) {// 之前已绘制了该监控对象海量点
      mapWrapper.map.setCenter(hasMonitorData[0].lnglat);
      mapWrapper.map.setZoom(18);
    } else {
      renderMassMarks({
        type,
        data: [focusMonitor]
      });
      mapWrapper.map.setCenter([longitude, latitude]);
      mapWrapper.map.setZoom(18);
      // 清除之前设置的海量点刷新定时器
      const windowObj: any = window;
      if (windowObj.mapPointTimer) {
        clearInterval(windowObj.mapPointTimer);
        windowObj.mapPointTimer = undefined;
      }
    }
    const { infoWindow } = refObj.current;
    if (!notShow || (notShow && infoWindow.getIsOpen())) {
      getWindowInfoContent({
        id: monitorId,
        workType,
        monitorKey,
        lnglat: [longitude, latitude]
      }, windowResult);
    }
  }

  /**
   * 获取两点间旋转角度
   * @param start 
   * @param end 
   */
  function calcAngle(start: any, end: any) {
    if (!mapWrapper) return 0;
    const p_start: any = mapWrapper.map.lngLatToContainer(start);
    const p_end: any = mapWrapper.map.lngLatToContainer(end);
    const diff_x = p_end.x - p_start.x;
    const diff_y = p_end.y - p_start.y;
    return 360 * Math.atan2(diff_y, diff_x) / (2 * Math.PI);
  }

  /**
   * 获取实例并初始化地图
   * @param mapWrapper 高德地图容器
   */
  function getInstance(mapWrapper: any) {
    const { map } = mapWrapper;
    const toolbar = map.scale({ offset: map.pixel(10, 10) });
    map.addControl(toolbar);

    const infoWindow = map.infoWindow({
      content: ' ',
      offset: map.pixel(12, -45),
    });
    const marker = map.marker({
      content: ' ',
      map: mapWrapper.map,
      zIndex: 1000,
      offset: map.pixel(36, -26),
    });
    setMonitorNameMarker(marker);
    refObj.current.infoWindow = infoWindow;
    setMapWrapper(mapWrapper);
    // 点击地图关闭信息窗体弹窗
    map.on('click', closeInfoWindow)
  }

  /**
   * 初始化尾迹线段
   */
  function renderWakePolyine(path: any) {
    if (!mapWrapper) return;
    const { current: { wakePolyline } } = refObj;
    if (wakePolyline) {
      wakePolyline.polyline.setPath(path);
    } else {
      // 绘制轨迹
      const { map } = mapWrapper;
      const polyline = map.polyline({
        map: mapWrapper.map,
        path,
        showDir: true,
        strokeColor: "#28F",  //线颜色
        strokeWeight: 6,      //线宽
      });
      refObj.current.wakePolyline = {
        path: path,
        polyline
      }
    }
  }

  /**
   * 绘制监控对象海量点
   * @param type:海量点类型(车辆、人员、设施)
   * @param data:海量点数据
   */
  function renderMassMarks(massMarksData: { type: string, setFitView?: boolean, data: Array<IMassMarker> }) {
    const { type, setFitView, data: marksData } = massMarksData;
    if (marksData && mapWrapper) {
      const { map } = mapWrapper;
      refObj.current.drawMonitor[type] = marksData;
      const data: any = [];
      const options: any = [];
      const newNameMarker: any = [];// 存储监控对象名称的marker集合
      monitorNameMarkerMap[type] = new Map();
      for (let i = 0; i < marksData.length; i += 1) {
        const item: IMassMarker = marksData[i];
        if (!item.longitude || !item.latitude) continue;
        const lnglat: any = [item.longitude, item.latitude];
        let showName = item.monitorName;
        if (item.monitorType === 1) {// 人名(工号+姓名)
          showName = `${item.monitorName}${item.name ? `(${item.name})` : ''}`;
        }
        const content = `<div class='${styles.monitorName}'>${getMonitorStatus(item.status)}${showName}</div>`;
        const marker = map.marker({
          content: content,
          map: mapWrapper.map,
          position: lnglat,
          zIndex: 100,
          monitorName: showName,
          offset: map.pixel(36, -26),
        });
        newNameMarker.push(marker);
        if (item.monitorId) {
          monitorNameMarkerMap[type].set(item.monitorId, { status, monitorId: item.monitorId, showName, marker })
        }
        data.push({
          lnglat: lnglat,
          name: item.monitorName,
          id: item.monitorId,
          status: item.status,
          monitorKey: item.monitorKey,
          workType: item.workType,
          type: item.monitorType,
          style: i
        });
        let icon = vehicleIcon;
        let iconSize = map.size(65, 35);
        let offset = map.pixel(30, 30);
        if (item.monitorType === 1) {
          icon = peopleIcon;
          iconSize = map.size(39, 47);
          offset = map.pixel(6, 36);
        }
        if (item.iconId && item.iconId > 0 && item.iconId <= 10000) {
          icon = publicCarPath(item.iconId)
        } else {
          icon = item.iconUrl ? item.iconUrl : icon;
        }
        options.push({
          url: icon,
          anchor: offset,
          size: iconSize,
          rotation: 0,
        });
      }
      // 创建海量点
      if (!massMarks[type].data) {
        const zIndex = 999 + refObj.current.drawMonitor.vehicle.length + refObj.current.drawMonitor.people.length;
        const styleObject: any = {
          opacity: 1,
          cursor: 'pointer',
          zIndex,
          style: options,
        };
        const typeMassMarks = map.massMarks(data, styleObject);
        typeMassMarks.setMap(mapWrapper.map);
        massMarks[type].data = typeMassMarks;
        massMarks[type].nameMarker = newNameMarker;
        setMassMarks(massMarks);
        // 点击监控对象图标，展现信息弹窗
        typeMassMarks.on('click', function (e: any) {
          const { infoWindow } = refObj.current;
          if (infoWindow.getIsOpen()) {
            infoWindow.close();
          } else {
            getWindowInfoContent(e.data);
          }
        });
      } else {
        mapWrapper.map.remove(massMarks[type].nameMarker);
        massMarks[type].data.clear();
        massMarks[type].data.setStyle(options);
        massMarks[type].data.setData(data);
        const zIndex = 999 + refObj.current.drawMonitor.vehicle.length + refObj.current.drawMonitor.people.length;
        if (massMarks[type].data.Ce) {
          massMarks[type].data.Ce.zIndex = zIndex;
        }
        massMarks[type].nameMarker = newNameMarker;
        setMassMarks(massMarks);
      }
      closeInfoWindow();
      if (setFitView) {
        mapWrapper.map.setFitView([...massMarks.vehicle.nameMarker, ...massMarks.people.nameMarker]);
      }
    }
  }

  /**
   * 绘制设施海量点
   * @param massMarksData 
   */
  function renderFacilityMassMarks(massMarksData: { type: string, data: Array<IMassMarker> }) {
    const { data: marksData } = massMarksData;
    if (marksData && mapWrapper) {
      const { map } = mapWrapper;
      const data: any = [];
      const options: any = [];
      for (let i = 0; i < marksData.length; i += 1) {
        const item: IMassMarker = marksData[i];
        if (!item.longitude || !item.latitude) continue;
        const lnglat: any = [item.longitude, item.latitude];
        data.push({
          lnglat: lnglat,
          name: item.monitorName,
          id: item.monitorId,
          status: item.status,
          type: item.monitorType,
          style: i
        });
        let icon = thingIcon;
        if (item.iconId && item.iconId > 0 && item.iconId <= 10000) {
          icon = publicCarPath(item.iconId)
        } else {
          icon = item.iconUrl ? item.iconUrl : icon;
        }
        const iconSize = map.size(39, 47);
        const offset = map.pixel(6, 36);
        options.push({
          url: item.iconUrl ? item.iconUrl : icon,
          anchor: offset,
          size: iconSize,
          rotation: 0,
        });
      }
      // 创建海量点
      if (!facilityMassMarks) {
        const zIndex = 1000 + refObj.current.drawMonitor.vehicle.length + refObj.current.drawMonitor.people.length;
        const styleObject: any = {
          opacity: 1,
          cursor: 'pointer',
          zIndex,
          style: options,
        };
        const typeMassMarks = map.massMarks(data, styleObject);
        typeMassMarks.setMap(mapWrapper.map);
        setFacilityMassMarks(typeMassMarks);

        // 点击监控对象图标，关闭信息弹窗
        typeMassMarks.on('click', function () {
          const { infoWindow } = refObj.current;
          if (infoWindow.getIsOpen()) {
            infoWindow.close();
          }
        });
        typeMassMarks.on('mouseover', function (e: any) {
          monitorNameMarker.setPosition(e.data.lnglat);
          const content = `<div class='${styles.monitorName}'>${getMonitorStatus(e.data.status)}${e.data.name}</div>`;
          monitorNameMarker.setContent(map.currentMap === 'google' ? e.data.name : content);
          monitorNameMarker.show();
        });
        typeMassMarks.on('mouseout', function () {
          monitorNameMarker.hide();
        });
      } else {
        facilityMassMarks.clear();
        facilityMassMarks.setStyle(options);
        facilityMassMarks.setData(data);
        setFacilityMassMarks(facilityMassMarks);
        const zIndex = 1000 + refObj.current.drawMonitor.vehicle.length + refObj.current.drawMonitor.people.length;
        if (facilityMassMarks.De) {
          facilityMassMarks.De.zIndex = zIndex;
        }
      }
      closeInfoWindow();
      if (marksData.length > 0) {
        mapWrapper.map.setFitView();
      }
    }
  }

  /**
   * 关闭监控对象弹窗
   */
  function closeInfoWindow() {
    const { infoWindow } = refObj.current;
    if (infoWindow && infoWindow.getIsOpen()) {
      infoWindow.close();
    }
  }

  /**
   * 绘制标段
   */
  function renderSection(data: { id: string, longLat: any, type: string }) {
    if (mapWrapper) {
      if (sectionPolygon) mapWrapper.map.remove(sectionPolygon.data);
      const { map } = mapWrapper;
      const polygon = map.polygon({
        map: mapWrapper.map,
        // fillColor: 'transparent',
        fillOpacity: 0,
        path: data.longLat,
        strokeColor: 'red',
        strokeStyle: 'dashed',
      });
      polygon.on('click', closeInfoWindow)
      setSectionPolygon({
        key: data.id,
        data: polygon
      });
      mapWrapper.map.setFitView(polygon);
    }
  }

  /**
  * 绘制作业对象
  */
  function renderWorkObject(data: { type: string, workId: string, path: any }) {
    if (!mapWrapper) return;
    const { type, path, workId } = data;
    const poly = workObjectGraph || {};
    const { map } = mapWrapper;
    if (type === 'line' || type === 'navigationLine') {// 作业道路
      // 创建折线实例
      const polyline = map.polyline({
        map: mapWrapper.map,
        path: path,
        borderWeight: 2, // 线条宽度
        strokeColor: 'blue', // 线条颜色
        lineJoin: 'round' // 折线拐点连接处样式
      });
      polyline.on('click', closeInfoWindow);
      poly[workId] = polyline;
    } else {// 作业区域,清运区域
      const polygon = map.polygon({
        map: mapWrapper.map,
        path: path,
        strokeColor: "#FF33FF",
        strokeWeight: 2,
        strokeOpacity: 0.1,
        fillOpacity: 0.4,
        fillColor: '#1791fc',
        zIndex: 50,
      })
      polygon.on('click', closeInfoWindow);
      poly[workId] = polygon;
    }
    setWorkObjectGraph(poly);
    map.setFitView([poly[workId]]);
  }

  /** 
   * 监控对象弹窗中的跟踪功能
   */
  const setfocusingTrackInfo = async () => {
    if (infoMonitor) {
      const isOnline = await monitorIsOnline(infoMonitor.monitorId);
      if (!isOnline) {
        message.warning('监控对象离线');
        return;
      }
    }
    if (curFocusingTrack) {// 取消之前监控对象的跟踪订阅
      onSocketSucces(2, curFocusingTrack.monitorId);
    }
    const { current: { wakePolyline } } = refObj;
    if (mapWrapper && wakePolyline) {
      mapWrapper.map.remove(wakePolyline.polyline);
    }
    refObj.current.wakePolyline = null;
    curFocusingTrack = infoMonitor;
    onSocketSucces();
    closeInfoWindow();
  }

  /**
   * 跳转作业回放
   */
  const goTrackBack = function () {
    console.log('goTrackBack');
    
    const { monitorKey, workType, monitorName } = infoMonitor;
    channel.trigger(`/view/monitoringManager/workPlayback?key=${monitorKey}&name=${monitorName}&workType=${workType}`);
    history.replace(`/view/monitoringManager/workPlayback?key=${monitorKey}&name=${monitorName}&workType=${workType}`);
  }

  /**
   * 改变实时视频监控对象信息
   */
  const changeVideoMonitroInfo = async () => {
    const isOnline = await monitorIsOnline(infoMonitor.monitorId);
    if (!isOnline) {
      message.warning('监控对象离线');
      return;
    }
    dispatch({ type: 'workMonitoring/refreshData', payload: { key: 'videoParam', data: { id: infoMonitor.monitorId, name: infoMonitor.monitorName } } });
  }

  /**
  * 获取监控对象弹窗信息
  * @param data 
  */
  const getWindowInfoContent = async (data: any, windowResult?: any) => {
    const { id, monitorId, workType, monitorKey, lnglat, marker } = data;
    const { infoWindow } = refObj.current;
    infoWindow.setPosition(mapWrapper.map.currentMap === 'google' ? { lng: lnglat[0], lat: lnglat[1] + 0.00024 } : lnglat);
    let result = windowResult;
    if (!result) {
      result = await getMonitorWindowInfo({ monitorId: id || monitorId });
    }
    if (!result) {
      if (infoWindow.getIsOpen()) infoWindow.close();
      return;
    };
    const { lastLocation } = result;
    infoMonitor = lastLocation;
    infoMonitor.workType = workType;
    infoMonitor.monitorKey = monitorKey;
    const windowDiv = document.createElement('div');
    ReactDOM.render(<MonitorWindow data={result} changeVideoMonitroInfo={changeVideoMonitroInfo} goTrackBack={goTrackBack} setfocusingTrackInfo={setfocusingTrackInfo} refs={{videoAciveEl, trajectoryEl, trackingEl}} />, windowDiv);
    infoWindow.setContent(windowDiv);
    // 打开信息窗体
    infoWindow.open(mapWrapper?.map, marker, windowDiv, lnglat, {changeVideoMonitroInfo, goTrackBack, setfocusingTrackInfo}, {videoAciveEl, trajectoryEl, trackingEl});
  }

  /**
   * 修改地图
   * @param value 
   */
  const changeMap = (value: string) => {
    setMassMarks(defaultMassMarks);
    setcurrentMap(value)
  }
  return <div className={styles.mapContainer}>
    <LoadMap
      mapType={currentMap}
      getInstance={getInstance.bind(this)}
      mapOption={{
        zoom: 18,
        viewMode: '3D',
        pitch: 0,
      }}
      plugins={currentMap === 'amap' ? ["AMap.MapType",
        "AMap.ToolBar",
        "AMap.MouseTool",
        "AMap.PolyEditor",
        "AMap.Scale",
        "AMap.Marker",
        "AMap.DistrictSearch",
        "AMap.Polygon",
        "AMap.GeometryUtil",
        "AMap.ControlBar",
        'AMap.OverView',
        'AMap.RectangleEditor',
        'AMap.CircleEditor',
        'AMap.Weather',
        'AMap.CitySearch',
      ] : []}
    />
    {/* 工具条 */}
    {mapWrapper && <Toolbar mapWrapper={mapWrapper} toggleMapType={changeMap} currentMap={currentMap} />}
    {/* 天气 */}
    {currentMap === 'amap' && mapWrapper && <Weather mapWrapper={mapWrapper} />}
  </div>
});

export default MapComponent;
