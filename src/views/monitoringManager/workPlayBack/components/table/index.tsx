import React, { Component, PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Empty, Button, Tooltip } from 'antd';
import styles from './index.module.less'
import { requestAddressData } from '@/server/workMonitoring'
import { getSelectContainer } from '@/framework/utils/function';
import { equalsObj } from './fun';
interface TColumn {
  title: string;
  dataIndex: string;
  width?: string | number;
  fixed?: boolean;
  align?: string;
  render?: Function;
}

interface IProps {
  intl: any;
  currentIndex?: number;
  rowHeight?: number;
  columns: TColumn[];
  dataSource: any[];
  itemClick?: Function;
  timeOut?: boolean;
}

interface IState {
  tableData: any[];
  playIndex: number;
  scrollTop: number;
  addressIndex: number | undefined;
}




class CommonTable extends PureComponent<IProps, IState, any>{
  defaultLine: number; // 行高
  scrollRef: React.RefObject<any>;
  constructor(props: IProps) {
    super(props);
    this.state = {
      tableData: [],
      playIndex: 0,
      scrollTop: 0,
      addressIndex: undefined,
    };
    this.defaultLine = props.rowHeight || 30;
    this.scrollRef = React.createRef();
  }

  componentDidMount() {
    this.setState({
      tableData: this.props.dataSource
    });
  }

  UNSAFE_componentWillReceiveProps = (nextProps: IProps) => {
    const { dataSource, currentIndex, timeOut } = nextProps;

    if (dataSource) {
      // const len = nextProps.dataSource && nextProps.dataSource.length;
      if (!timeOut && currentIndex) {
        this.getAddress(dataSource[currentIndex], currentIndex);
      } else {
        this.setState({
          tableData: dataSource
        });
      }
    }

    if (currentIndex || currentIndex === 0) {
      const top = currentIndex * (this.defaultLine + 15);
      const scrollEle = this.scrollRef.current;
      scrollEle.scrollTop = top;
      this.setState({
        playIndex: currentIndex
      })
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    if (!equalsObj(nextProps.tableData, this.state.tableData)) {
      return true;
    }
    if (nextProps.currentIndex != this.props.currentIndex) {
      return true;
    }
    if (nextState.addressIndex != this.state.addressIndex) {
      return true;
    }

    return false;
  }

  /**
   * 渲染表头数据
   */
  renderTableTheader = (columns: TColumn[]) => {
    if (columns.length) {
      return (
        <thead key='1'>
          <tr key='2'>
            {
              columns.map((item: TColumn) => {
                const _style: React.CSSProperties = {
                  textAlign: item.align ? item.align as "left" | "-moz-initial" | "inherit" | "initial" | "revert" | "unset" | "center" | "end" | "justify" | "match-parent" | "right" | "start" | undefined : 'left',
                  width: item.width
                };
                return (
                  <td key={item.dataIndex} className={styles['common-table-th']} style={_style}>
                    <div style={{
                      width: item.width ? (item.width as number - 20 + 'px') : 'auto'
                    }}>{item.title}</div>
                  </td>
                )
              })
            }
          </tr>
        </thead>
      )
    }
  }
  /**
   * 渲染表格主要数据
   */
  renderTableTbodys = (data: any[], columns: TColumn[]) => {
    if (data.length) {
      const { playIndex } = this.state;
      return (
        <table id="commonTableContainer" className={styles['common-table-container']} style={{ width: '100%' }}>
          <tbody>
            {
              data.map((item: any, index: number) => {
                // if (index < 6) {
                const cIndex = index;
                return (
                  <tr key={cIndex} className={[styles['common-table-tr'], playIndex == cIndex ? styles['active'] : null].join(' ')} onClick={() => {
                    this.handleItemClick(item.id, cIndex)
                  }}>
                    {
                      columns.map((column: TColumn, index: number) => {
                        const propName = column.dataIndex, defaultValue = item[propName];
                        const _style: React.CSSProperties = {
                          textAlign: column.align ? column.align as "left" | "-moz-initial" | "inherit" | "initial" | "revert" | "unset" | "center" | "end" | "justify" | "match-parent" | "right" | "start" | undefined : 'left',
                          width: column.width,
                          height: 45
                        };
                        let renderValue = '';
                        if (column.render) {
                          renderValue = column.render(defaultValue, item);
                        }
                        const value = renderValue ? renderValue : defaultValue || '';
                        const columnWidth = column.width ? (column.width as number - 20 + 'px') : 'auto';
                        return (
                          <td key={index} className={styles['common-table-td']} style={_style}>
                            {
                              propName === 'address' ? <div id={'tableTooltip' + index} style={{
                                width: columnWidth
                              }}>
                                {
                                  value ?
                                    <Tooltip placement="top" title={value}>
                                      {value}
                                    </Tooltip>
                                    :
                                    <Button type="link" onClick={(e: any) => {
                                      e.stopPropagation();
                                      this.getAddress(item, cIndex)
                                    }}>点击获取位置信息</Button>
                                }
                              </div>
                                : <div style={{
                                  width: columnWidth
                                }}>{!propName ? cIndex + 1 : value}</div>
                            }
                          </td>
                        )
                      })
                    }
                  </tr>
                )
                // }
              })
            }
          </tbody>
        </table>
      )
    }
  }
  getAddress = async (data: any, index: number) => {
    const { latitude, longitude } = data;
    if (latitude && longitude) {
      const result = await requestAddressData({ latitude, longitude })
      if (result) {
        data.address = result;
        const { tableData } = this.state;
        const _tableData: any = JSON.parse(JSON.stringify(tableData));
        if (_tableData[index]) {
          _tableData[index] = data;
          this.setState({
            tableData: _tableData,
            addressIndex: index
          })
        }
      }
    }
  }
  /**
   * 监听滚动事件
   */
  onScrollHandle = () => {
    // const scrollEle = this.scrollRef.current;
  }
  /**
   * 表格行点击事件
   */
  handleItemClick = (id: string | number, index: number) => {
    const { playIndex } = this.state;
    if (index != playIndex) {
      this.setState({
        playIndex: index
      }, () => {
        this.props.itemClick && this.props.itemClick(index)
      })
    }
  }
  componentWillUnmount = () => {
    window.removeEventListener('scroll', this.onScrollHandle);
  };

  render() {
    const { columns } = this.props;
    const { tableData } = this.state;
    const height = this.defaultLine;
    return (
      <div className={styles['commonTable-container']}>
        <div className={styles['commonTable-thead']}>
          <table className={styles['common-table-container']} style={{
            lineHeight: height + 'px',
            width: '100%'
          }}>
            {this.renderTableTheader(columns)}
          </table>
        </div>
        <div className={styles['commonTable-tbody']} onScroll={() => this.onScrollHandle()} ref={this.scrollRef}>
          <div className={styles['commonTable-tbody-container']} style={{
            lineHeight: height + 'px'
          }}>
            {
              tableData && tableData.length ?
                this.renderTableTbodys(tableData, columns) :
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
          </div>
        </div>
      </div>
    )
  }
}
export default connect(null, null)(injectIntl(CommonTable))