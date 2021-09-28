/**
 * 排班调整
 */
import { Model } from '../framework/d.ts/model';
import { getStore } from '../framework/utils/localStorage';

export type StateType = {
    monitorId: string; //监控对象id
    sectionId: string; //标段id
    workId: string; //作业对象id，机动组
    workType: string; //1 作业道路 2作业区域 3 清运区域 4 机动组
    monitorCategory: string; //监控对象类型(岗位类型，车辆类型) id
    monitorType: number; //监控对象类型 (0 :车， 1：人， 2：物)
    type: string; //作业对象类型 work 作业对象  monitor 监控对象
    shiftId: string; //班次id
    shiftName: string; //排班的名字
    shiftStatus: number;
    shiftTime: string; //排班的时间 08:00-10:00
    shiftType: number;
    time: string; //班次时间yyyymmdd
    weekType: number; //时间类型 (1：星期一；2：星期二…)
    workName: string; //作业对像名字
    clickedDate: string; //选中的日期
    enterpriseId: string; //企业id
    canTemp: boolean; //某个对象能否设置临班
};
const schedulCalendar: Model<StateType> = {
    namespace: 'schedulCalendar',
    defaultState: {
        monitorId: '', //监控对象id
        sectionId: '', //标段id
        workId: '', //作业对象id，机动组
        workType: '', //1 作业道路 2作业区域 3 清运区域 4 机动组
        monitorCategory: '', //监控对象类型(岗位类型，车辆类型) id
        monitorType: 0, //监控对象类型 (0 :车， 1：人， 2：物)
        type: '', //作业对象类型 work 作业对象  monitor 监控对象
        shiftId: '', //班次id
        shiftName: '', //排班的名字
        shiftStatus: 0,
        shiftTime: '', //排班的时间 08:00-10:00
        shiftType: 0,
        time: '', //班次时间yyyymmdd
        weekType: 0, //时间类型 (1：星期一；2：星期二…)
        workName: '', //作业对像名字
        clickedDate: '', //选中的日期
        enterpriseId: '',
        canTemp: false,
    },
    reducers: {
        start: function (state: StateType) {
            return state;
        },
        default: (state: StateType) => {
            const token = getStore('token');
            if (token) {
                return Object.assign({}, state, { logined: true });
            }
            return state;
        },
        // 更新state数据
        refreshData: function (state: StateType, action: any) {
            const {
                payload: { key, data },
            } = action;
            (state as any)[key] = data;
            return state;
        },
        setBaseData(state: StateType, action: any) {
            const { payload } = action;
            return { ...state, ...payload };
        },
    },
};

export default schedulCalendar;
