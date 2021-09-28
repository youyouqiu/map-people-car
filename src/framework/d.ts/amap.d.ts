declare namespace AMap {
    namespace MassMarks {
        interface Options {
            alwaysRender: boolean;
            zooms?: Array<number>;
        }
    }

    export class MouseTool {
        constructor(map: AMap.Map);

        /**
         * 开启鼠标画点标注模式。鼠标在地图上单击绘制点标注，标注样式参考MarkerOptions设置
         * @param options 
         */
        marker(options?: any): void;

        polyline(options?: any): void;

        polygon(options?: any): void;

        rectangle(options?: any): void;

        circle(options?: any): void;

        rule(options?: any): void;

        measureArea(options?: any): void;

        rectZoomIn(options?: any): void;

        rectZoomOut(options?: any): void;

        close(arg?: boolean): void;

        on(events: string, handler: Function): void;

        off(events: string, handler: Function): void;
    }

    export class CircleEditor {
        constructor(map: AMap.Map, Circle: any);

        open(): void;

        close(): void;

        on(events: string, handler: Function): void;
    }

    export class RectangleEditor {
        constructor(map: AMap.Map, Rectangle: AMap.Rectangle);

        open(): void;

        close(): void;

        on(events: string, handler: Function): void;
    }

    export class DragRoute {
        constructor(map: AMap.Map, path: any, policy: any, opts: any);

        polyOptions(): object;
        startMarkerOptions(): object;
        midMarkerOptions(): object;
        endMarkerOptions(): object;
        showTraffic(): boolean;
        destroy(): void;
        on(events: string, handler: Function): void;
        search(): void;
    }

    export class PolyEditor {
        constructor(map: AMap.Map, Object: any);
        open(): void;
        close(): void;
        on(events: string, handler: Function): void;
    }

    export class MarkerClusterer {
        constructor(map: AMap.Map, markers: Array<Marker>, opts: any)
        addMarker(): void;
        setMap(): void;
        clearMarkers(): void;
    }

    export class CustomLayer {
        constructor(canvas: any, ops: any)
        render(): void;
    }

    namespace MediaLayer {
        interface Options extends Layer.Options {
            /**
             * 路径
             */
            url?: string;
        }
    }

    export class DistrictSearchZrp extends DistrictSearch {
        /**
         * 设置关键字对应的行政区级别或商圈
         * @param level 级别
         */
        setLevel(level?: DistrictSearch.Level): void;
        // internal
        setExtensions(extensions?: boolean | string): void;
    }
}