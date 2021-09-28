/**
 * 监控对象信息弹窗
 */
import React from "react";
import { publicCarPath } from "@/framework/utils/publicCar";
import styles from '../../index.module.less';
import { getOnWorkStatus, getWorkStatus, noImg } from "../../publicFun";
import vehicleIcon from '@/static/image/vehicleIcon.png';
import peopleIcon from '@/static/image/people.png';
import tracking from '@/static/image/tracking.svg';// 跟踪
import trajectory from '@/static/image/trajectory.svg';// 轨迹
import videoAcive from '@/static/image/videoActive.png';// 视频

interface IProps {
  data: any,
  goTrackBack: Function,
  setfocusingTrackInfo: Function,
  changeVideoMonitroInfo: Function,
}

const MonitorWindow = (props: IProps) => {
  const getWindowView = () => {
    const {
      lastLocation: {
        address,
        gpsTime,
        iconId,
        monitorName,
        oilCapacityInfo,
        loadWeightInfo,
        waterCapacityInfo,
        monitorType,
      },
      workMonitorDto: {
        enterpriseName,
        gpsSpeed,
        iconUrl,
        name,
        onWorkStatus,
        photoUrl,
        terminalPhoneNum,
        type,
        workStatus,
        professionalsList,
        isVideo
      }
    } = props.data;

    const professionalsName: any = [];// 驾驶员信息
    if (professionalsList && professionalsList.length > 0) {
      professionalsList.map((item: any) => {
        professionalsName.push(`${item.number}(${item.name})`);
      })
    }

    const statusText = getOnWorkStatus(onWorkStatus);
    const workText = getWorkStatus(workStatus);
    let content: any = '';
    let icon = vehicleIcon;
    if (monitorType !== 0) {
      icon = peopleIcon;
    }
    if (iconId && iconId > 0 && iconId <= 10000) {
      icon = publicCarPath(iconId)
    } else {
      icon = iconUrl ? iconUrl : icon;
    }
    if (monitorType === 0) {// 车辆
      content = <div className={styles.mapInfoWindow}>
        <h3>
          <span className={styles.name}><img src={icon} /> {monitorName}</span>
          <span className={styles.time}>{gpsTime}</span>
        </h3>
        <div className={styles.windowContent}>
          <div className={styles.topInfo}>
            <div className={styles.leftInfo}>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>在岗状态:</span>{statusText}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>作业状态:</span>{workText}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>行驶速度:</span>
                <span>{gpsSpeed === undefined ? '--' : `${gpsSpeed}km/h`}</span>
              </div>
              {oilCapacityInfo[0] !== -1 ? <div className={styles.infoItem}>
                <span className={styles.itemName}>剩余油量:</span>
                <span>{oilCapacityInfo === undefined || oilCapacityInfo.length === 0 ? '--' : `${oilCapacityInfo.join('L/')}L`}</span>
              </div>
                : ''}
            </div>
            <div className={styles.rightImg}>
              <img src={photoUrl ? photoUrl : noImg} />
            </div>
          </div>
          {loadWeightInfo[0] !== -1 ? <div className={styles.infoItem}>
            <span className={styles.itemName}>载重量:</span>
            <span>{loadWeightInfo === undefined || loadWeightInfo.length === 0 ? '--' : `${loadWeightInfo.join('kg/')}kg`}</span>
          </div> : ''}
          {waterCapacityInfo[0] !== -1 ? <div className={styles.infoItem}>
            <span className={styles.itemName}>剩余水量:</span>
            <span>{waterCapacityInfo === undefined || waterCapacityInfo.length === 0 ? '--' : `${waterCapacityInfo.join('L/')}L`}</span>
          </div> : ''}
          <div className={styles.infoItem}>
            <span className={styles.itemName}>所属企业:</span>
            <span>{enterpriseName}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.itemName}>终端手机号:</span>
            <span>{terminalPhoneNum}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.itemName}>驾驶员:</span>
            <span>{professionalsName.length > 0 ? professionalsName.join(',') : '--'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.itemName}>位置信息:</span>
            <span>{address ? address : '--'}</span>
          </div>
        </div>
        <div className={styles.windowFooter}>
          <div>
            {isVideo && <button onClick={() => props.changeVideoMonitroInfo()}>
              <img width='20' src={videoAcive} alt="视频" /> 视频
            </button>}
            <button onClick={() => props.goTrackBack()}>
              <img className={styles.trajectory} src={trajectory} alt="轨迹" /> 轨迹
            </button>
            <button onClick={() => props.setfocusingTrackInfo()}>
              <img className={styles.tracking} src={tracking} alt="跟踪" /> 跟踪
            </button>
          </div>
        </div>
      </div>;
    } else {// 人员
      content = <div className={styles.mapInfoWindow}>
        <h3>
          <span className={styles.name}><img src={icon} /> {monitorName}({name})</span>
          <span className={styles.time}>{gpsTime}</span>
        </h3>
        <div className={styles.windowContent}>
          <div className={styles.topInfo}>
            <div className={styles.leftInfo}>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>在岗状态:</span>{statusText}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>作业状态:</span>{workText}
              </div>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>岗位类型:</span>
                <span>{type}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.itemName}>所属企业:</span>
                <span>{enterpriseName}</span>
              </div>
            </div>
            <div className={styles.rightImg}>
              <img src={photoUrl ? photoUrl : noImg} />
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.itemName}>终端手机号:</span>
            <span>{terminalPhoneNum}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.itemName}>位置信息:</span>
            <span>{address ? address : '--'}</span>
          </div>
        </div >
        <div className={styles.windowFooter}>
          <div>
            <button onClick={() => props.goTrackBack()}>
              <img className={styles.trajectory} src={trajectory} alt="轨迹" /> 轨迹
            </button>
            <button onClick={() => props.setfocusingTrackInfo()}>
              <img className={styles.tracking} src={tracking} alt="跟踪" /> 跟踪
            </button>
          </div>
        </div>
      </div >;
    }
    return content;
  }

  return getWindowView();
}

export default MonitorWindow;