
import { Tool } from './toolbar';
import destroy from '../../../../../static/image/destroy-marker.png';


let textMarker: null | AMap.Marker = null;
let rectangleEditor: null | AMap.RectangleEditor = null;
let rectangle: null | AMap.Rectangle = null;
let circleEditor: null | AMap.CircleEditor = null;
let tool: Tool;
let func: Function

/**
 * 距离量算
 */
export const distanceMeasurement = (tool: Tool | null) => {
  return {
    distanceOpen: () => tool?.mousetool.rule({ borderWeight: 20 }),
    distanceClose: () => tool?.mousetool.close(true)
  }
}

/**
 * 矩形量算
 */
export const rectangularMeasurement = (measurementTool: Tool | null, toggleButton: Function) => {
  if (measurementTool) tool = measurementTool;
  func = toggleButton;
  return {
    rectangularOpen: () => {
      tool.mousetool.rectangle({
        map: tool.map,
        fillColor: '#00b0ff',
        strokeColor: '#80d8ff',
      });
      tool.mousetool.on('draw', rectangleDraw)
    },
    rectangularClose: () => removeMulch()
  }
}

/**
 * 矩形编辑
 */
const rectangleDraw = (e: { obj: any; CLASS_NAME?: string | undefined; }) => {
  if (e.obj.CLASS_NAME !== "AMap.Polygon") return;
  const { map } = tool;
  const overlay = e.obj;
  const bounds = overlay.getBounds();

  tool.mousetool.close(true);

  rectangle = map.rectangle({
    bounds: bounds,
    fillColor: '#00b0ff',
    strokeColor: '#80d8ff',
    fillOpacity: 0.4,
    map: map
  });

  if (!rectangleEditor) rectangleEditor = map.rectangleEditor(map, rectangle);
  rectangleEditor?.open()

  rectangleEditor?.on('adjust', function () {
    createRectangleText(rectangle)
  });

  createRectangleText(rectangle);
}

/**
 * 创建显示矩形的周长和面积文本标注
 */
const createRectangleText = (overlay: any) => {
  const { map } = tool;
  const paths = overlay.getPath();
  const x = paths[0].distance(paths[1]);
  const y = paths[1].distance(paths[2]);
  const perimeter = (2 * (x + y)).toFixed(2);
  const area = overlay.getArea();

  const text = '<div class="text-marker">'
    + '<span>周长：' + perimeter + 'm</span><br>'
    + '<span>面积：' + area + 'm²</span>'
    + '</div>';

  if (!textMarker) {
    textMarker = new AMap.Marker({
      position: paths[1],
      label: {
        content: text,
        direction: 'right',
        offset: new AMap.Pixel(-2, 24),
      },
      offset: new AMap.Pixel(0, 0),
      map: map,
      zIndex: 999999,
      icon: destroy,
    })

    textMarker.on('click', function () {
      removeMulch();
    })
  } else {
    textMarker.setPosition(paths[1]);
    textMarker.setLabel({
      content: text,
    });
  }
}

/**
 * 圆形量算
 */
export const circularMeasurement = (measurementTool: Tool | null, toggleButton: Function) => {
  if (measurementTool) tool = measurementTool;
  func = toggleButton;
  return {
    circularOpen: () => {
      measurementTool?.mousetool.circle();
      measurementTool?.mousetool.on('draw', circleDraw);
    },
    circularClose: () => removeMulch()
  }
}

/**
 * 圆形编辑
 */
const circleDraw = (e: { obj: any; CLASS_NAME?: string | undefined; }) => {
  const { map } = tool;
  const overlay = e.obj;
  if (e.obj.CLASS_NAME !== "AMap.Circle") return;
  tool.mousetool.close(false);

  if (!circleEditor) circleEditor = map.circleEditor(map, overlay);
  circleEditor?.open();

  circleEditor?.on('move', function () {
    createCircleText(overlay)
  });

  circleEditor?.on('adjust', function () {
    createCircleText(overlay)
  });

  createCircleText(overlay)
}

/**
 * 创建显示圆的直径、周长和面积文本标注
 */
const createCircleText = (overlay: any,) => {
  const { map } = tool
  const center = overlay.getCenter();
  const radius = overlay.getRadius();
  const diameter: any = (radius * 2).toFixed(2);
  const perimeter = (diameter * 3.14159).toFixed(2);
  const area = (radius * radius * 3.14159).toFixed(2);
  const text = '<div class="text-marker">'
    + '<span>直径：' + diameter + 'm</span><br>'
    + '<span>周长：' + perimeter + 'm</span><br>'
    + '<span>面积：' + area + 'm²</span>'
    + '</div>';

  if (!textMarker) {
    textMarker = new AMap.Marker({
      position: center,
      offset: new AMap.Pixel(5, 5),
      map: map,
      label: {
        content: text,
        direction: 'right',
        offset: new AMap.Pixel(0, 30),
      },
      icon: destroy
    });
    textMarker.on('click', function () {
      removeMulch()
    })
  } else {
    textMarker.setPosition(center);
    textMarker.setLabel({
      content: text,
    });
  }
}


/**
 * 清除覆盖物
 */
export const removeMulch = () => {
  if (!textMarker) return;
  if (func) func();
  tool.mousetool.close(true);
  tool.map.remove([textMarker])
  rectangle && tool.map.remove([rectangle])
  circleEditor && circleEditor.close();
  rectangleEditor && rectangleEditor.close();
  rectangleEditor = null;
  circleEditor = null;
  textMarker = null;
}






