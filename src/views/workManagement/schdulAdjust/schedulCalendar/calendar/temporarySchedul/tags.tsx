/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-deprecated */
import React from 'react';
import { Tag, Input, TimePicker, Button, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { Moment } from 'moment';
import randomString from '@/framework/utils/randomString';
const { RangePicker } = TimePicker;
interface IState {
  inputVisible: boolean;
  inputValue: string;
  editInputIndex: number;
  newTimeRange: string;
  editInputValue: string;
  clickTagInnerHtml: string;
  count: number;
}

interface IProps {
  tags: { id: string; data: any }[];
  setTags: (tags: { id: string; data: any }[]) => void;
  length: number;
  setSelectedShiftId: (value: string) => void;
  hasChildrenArr: boolean[];
  setSelectedShiftTime: (value: string) => void;
  selectedShiftId: string;
}
class EditableTagGroup extends React.Component<IProps, IState> {
  editInput: React.RefObject<Input> = React.createRef();

  state = {
    inputVisible: false,
    newTimeRange: '',
    inputValue: '',
    editInputIndex: -1,
    editInputValue: '',
    clickTagInnerHtml: '',
    count: 0,
  };

  componentWillReceiveProps(nextProps: IProps) {
    const { tags } = nextProps;
    if (tags != this.props.tags && tags.length > 0) {
      this.props.setSelectedShiftId(tags[0].id);
    }
  }

  showInput = () => {
    this.setState({ inputVisible: true });
  };
  handleClick = (e: any) => {
    const innerHtml = e.target.lastChild.nodeValue;
    this.setState({
      clickTagInnerHtml: innerHtml,
    });
    this.props.setSelectedShiftTime(innerHtml);
    this.props.setSelectedShiftId(e.target.id);
  };
  saveTime = () => {
    const { tags, setTags } = this.props;
    const randomId = randomString(8);
    const checkTags = tags.some((tags: any) => {
      return tags.id == this.state.newTimeRange;
    });
    if (!this.state.newTimeRange) {
      this.setState({ inputVisible: false });
      return;
    }
    if (checkTags) {
      message.warn('班次已存在！');
      // this.setState({ inputVisible: false });
      return;
    }
    setTags([
      ...tags,
      {
        id: this.state.newTimeRange,
        data: {
          shiftName: '临班',
          shiftTime: this.state.newTimeRange,
          shiftId: randomId,
        },
      },
    ]);

    this.setState({ inputVisible: false, newTimeRange: '' });
  };

  timePickerChange = (d: [Moment, Moment]) => {
    const start = d[0]?.format('HH:mm');
    const end = d[1]?.format('HH:mm');
    this.setState({
      newTimeRange: start + '-' + end,
    });
  };
  render() {
    const { inputVisible } = this.state;
    const { tags, selectedShiftId, hasChildrenArr } = this.props;
    return (
      <div style={{ marginBottom: '10px' }}>
        {tags.map((tag, index) => {
          return (
            <Tag
              onClick={this.handleClick}
              className="edit-tag"
              key={tag.id}
              closable={index >= this.props.length + this.state.count}
              style={
                // selectedShiftId == tag.id
                selectedShiftId == tag.data.shiftTime
                  ? {
                    background: '#a0d7ff',
                    color: '#575757',
                  }
                  : {}
              }
            >
              <span
                style={{
                  fontSize: '14px',
                  margin: '5px',
                  display: 'inline-block',
                }}
                data-id={tag?.data?.shiftId}
                id={tag?.data?.shiftTime}
              >
                {hasChildrenArr[index] ? <CheckOutlined style={{ color: '#2fbd00' }} /> : null}
                {tag?.data?.shiftName + tag?.data?.shiftTime}
              </span>
            </Tag>
          );
        })}
        {inputVisible && (
          <div style={{ display: 'inline-flex', width: '260px' }}>
            <RangePicker size="middle" format="HH:mm" onChange={this.timePickerChange} style={{ marginRight: '8px' }} />
            <Button type="primary" size="middle" onClick={this.saveTime}>
              保存
                        </Button>
          </div>
        )}
        {!inputVisible && (
          <Tag onClick={this.showInput} color="#108ee9" id="noChange">
            <span
              style={{
                fontSize: '14px',
                margin: '5px',
                display: 'inline-block',
              }}
            >
              新增班次
                        </span>
          </Tag>
        )}
      </div>
    );
  }
}

export default EditableTagGroup;
