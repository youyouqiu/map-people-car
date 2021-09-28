/**
 * 标定修正图表
 */
import React, { memo } from "react";
import ReactEcharts from '@/common/reactEcharts'; // Echarts组件
import oilBeforeImg from '@/static/image/oil_before.png';
import oilAfterImg from '@/static/image/oil_after.png';

interface IProps {
  echartData: any,
  addOilObj: any,
  chartsEvent: Function,
}

const CalibrationChart = memo((props: IProps) => {

  // echart数据配置
  const echartsOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          fontSize: 15
        },
        formatter: function (a: any) {
          const unit = ['L', 'km', '°C', '°C'];
          let relVal = "";
          relVal = a[0].name;
          if (a[0].data == null) {
            relVal = '无相关数据';
          } else {
            for (let i = 0; i < a.length; i++) {
              const data = a[i].data == '-' ? '无数据' : a[i].data + unit[a[i].seriesIndex];
              relVal += "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" + a[i].color + "'></span>" + a[i].seriesName + "：" + data + "";
            }
          }
          return relVal;
        }
      },
      legend: {
        left: 10,
        data: ['主油箱', '里程', '燃油温度', '环境温度']
      },
      grid: {
        top: 80,
        left: 120,
        right: 60,
      },
      xAxis: [
        {
          type: 'category',
          data: props.echartData.date,
          boundaryGap: false,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '油量(L)',
          scale: true,
          position: 'left',
          // max: oilMax,
          axisLabel: {
            formatter: '{value}'
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: false
          },
        },
        {
          type: 'value',
          name: '里程(km)',
          position: 'left',
          offset: 60,
          min: 0,
          scale: true,
          axisLabel: {
            formatter: '{value}'
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: false
          }
        },
        {
          type: 'value',
          name: '温度(°C)',
          scale: true,
          position: 'right',
          min: -30,
          max: 100,
          axisLabel: {
            formatter: '{value}'
          },
          axisLine: {
            show: true,
          },
          splitLine: {
            show: false
          }
        },
      ],
      dataZoom: [{
        type: 'slider',
        show: true,
        height: 14,
        bottom: 20,
        borderColor: 'transparent',
        backgroundColor: '#e2e2e2',
        handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: 22,
        handleStyle: {
          color: '#fff',
          shadowBlur: 3,
          shadowColor: 'rgba(0, 0, 0, 0.6)',
          shadowOffsetX: 2,
          shadowOffsetY: 2
        },
        start: 0,
        end: 100
      }],
      series: [
        {
          name: '主油箱',
          yAxisIndex: 0,
          type: 'line',
          smooth: true,
          // symbol: 'image://@/static/image/oil_before.png',
          symbolSize: 15,
          showSymbol: false,
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(240, 182, 125)'
            },
            borderColor: {
              color: 'rgb(240, 182, 125)'
            }
          },
          data: props.echartData.oil || [],
          markPoint: {
            symbolSize: [48, 61],
            symbolOffset: [0, -32],
            silent: true,
            data: [
              {
                yAxis: props.addOilObj.oilBefore,
                xAxis: props.addOilObj.timeBefore,
                symbol: `image://${oilBeforeImg}`,
                label: {
                  normal: {
                    show: true,
                    formatter: "",
                  }
                }
              },
              {
                yAxis: props.addOilObj.oilAfter,
                xAxis: props.addOilObj.timeAfter,
                symbol: `image://${oilAfterImg}`,
                label: {
                  normal: {
                    show: true,
                    formatter: "",
                  }
                }
              },
            ]
          }
        },
        {
          name: '里程',
          yAxisIndex: 1,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(109, 207, 246)'
            }
          },
          data: props.echartData.mileage || []
        },
        {
          name: '燃油温度',
          yAxisIndex: 2,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(245, 0, 0)'
            }
          },
          data: props.echartData.oilTemp || []
        },
        {
          name: '环境温度',
          yAxisIndex: 2,
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(244, 168, 177)'
            }
          },
          data: props.echartData.envTemp || []
        }
      ]
    }
  }

  return <ReactEcharts echartsOption={echartsOption()} clickFun={props.chartsEvent} style={{ height: 380 }} />
}, (preProps: IProps, nextProps: IProps) => {
  const flag1 = JSON.stringify(preProps.addOilObj) === JSON.stringify(nextProps.addOilObj);
  const flag2 = JSON.stringify(preProps.echartData) === JSON.stringify(nextProps.echartData);
  return flag1 && flag2;
})

export default CalibrationChart;
