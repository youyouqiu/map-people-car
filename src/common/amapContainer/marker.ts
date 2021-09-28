import { IMonitor } from "./mapWrapper";

export default class MarkerWrapper {
    constructor(map: AMap.Map) {
        this.map = map;
        this.monitors = [];
    }

    /**
     * 高德地图实例
     */
    map: AMap.Map

    monitors: IMonitor[]

    markers: { [key: string]: AMap.Marker }

    addMonitor(monitor: IMonitor) {
        const marker = new AMap.Marker({
            map: this.map,
            position: monitor.points[0].lnglat,//基点位置
            icon: monitor.icon, //marker图标，直接传递地址url
            offset: new AMap.Pixel(-5, -10), //相对于基点的位置
            zIndex: 99,
            autoRotation: true,
            angle: monitor.points[0].direction + 270
        });
        this.markers[monitor.name] = marker;

        // var carState = Util.status2ColorClass(status);
        // var carContent = "<p class='carNameShowRD'><i class='" + carState + "'></i>&ensp;<span class='monitorNameBox'>" + name + "</span></p>";

        // var markerContent = new AMap.Marker({
        //     position: position,
        //     content: carContent,
        //     offset: new AMap.Pixel(iconInfo.picWidth, iconInfo.picHeight), //相对于基点的位置
        //     autoRotation: false,//自动调节图片角度
        //     map: map,
        //     zIndex: 999

        // });
    }
}