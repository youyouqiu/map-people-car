/**
 * 人员头像显示控制
 */
import React, { Component } from 'react';
import { Upload, Row, Col, Input, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getStore } from '@/framework/utils/localStorage';
import styles from '../../../index.module.less';
import { message } from 'antd';
import moment from 'moment';

interface IProps {
  /**
   * 设施照片数据
   */
  fileImgList: Array<IImgItem>;
  /**
   * 存放删除的图片
   */
  deleteImgArr: Array<string>;

  /**
   * 改变图片
   */
  changeImg: Function,
}

interface IState {
  uploadImgLoading: null | number;
  // fileImgList: Array<IImgItem>;
  // deleteImgArr: Array<string>;
}

interface IImgItem {
  name: string;
  time: string;
  username: string;
  url: string;
  newUpload?: boolean;
  photoId: string,
}

class Index extends Component<IProps, IState, any> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      uploadImgLoading: null,// 上传图片按钮loading状态
      // fileImgList: [],// 图片集合
      // deleteImgArr: [],// 需要删除的图片集合
    };
  }

  /**
   * 图片上传限制
   * @curType 上传照片类型(1:车辆照片,2:行驶证,3:运输证)
   */
  beforeUpload = (file: any) => {
    const { fileImgList } = this.props;
    const curLen = fileImgList.length;
    if (curLen >= 8) {
      message.warning('最多上传8张设施照片');
      return false;
    }

    const isJpgOrPng = file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('必须上传JPG/PNG格式!');
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('图片大小不超过1MB!');
    }

    return isJpgOrPng && isLt1M;
  }

  /**
   * 上传车辆照片
   */
  handleChange = (list: any, type: number) => {
    const { fileList } = list;
    const len = fileList.length - 1;
    this.setState({
      uploadImgLoading: type
    })

    if (fileList && fileList[len]) {
      const { response, status } = fileList[len];
      if (response) {
        if (response.code === 200) {
          const { fileImgList, changeImg } = this.props;
          const data = JSON.parse(response.data);
          const newImgObj: any = {
            url: data.webUrl,
            name: data.filename.substring(data.filename.length - 30),
            type: type,
            newUpload: true,
            order: fileImgList.length,
            username: getStore('userName') || '',
            // time: getNowDate()
          };
          fileImgList.push(newImgObj);
          changeImg({ fileImgList });
        } else if (response.msg) {
          message.error(response.msg);
        }

      }
      if (status !== "uploading") {
        this.setState({
          uploadImgLoading: null
        })
      }
    }
  };


  /**
   * 删除图片
   */
  deleteImgFun = async (item: IImgItem, index: number) => {
    const { deleteImgArr, fileImgList, changeImg } = this.props;
    deleteImgArr.push(item.photoId);
    fileImgList.splice(index, 1);
    changeImg({
      deleteImgArr,
    });

    // const { deleteImgArr, fileImgList, changeImg } = this.props;
    // if (item.newUpload) {// 新上传的图片,可直接调接口删除
    //     fileImgList.splice(index, 1);
    //     changeImg({
    //         fileImgList
    //     });
    // } else {// 原有的图片,前端手动删除,在点击确定按钮后再调取接口确认删除
    //     deleteImgArr.push(item.url);
    //     fileImgList.splice(index, 1);
    //     changeImg({
    //         deleteImgArr,
    //         fileImgList: [...fileImgList]
    //     });
    // }
  }

  /**
   * 修改车辆图片名称
   */
  changeImgName = (value: string, index: number) => {
    const { fileImgList, changeImg } = this.props;
    fileImgList[index].name = value;
    fileImgList[index].username = getStore('userName') || '';
    changeImg({ fileImgList });
  }

  /**
  * 渲染设施照片片
  */
  renderImg = () => {
    const { fileImgList } = this.props;

    return (
      <div>
        {fileImgList.map((colItem: IImgItem, index) => {
          return <Row className={styles.vehicleImgItem} key={`${colItem.url}_${index}`} gutter={12}>
            <Col span={4}>
              <div className={styles.imgBox}>
                <img alt='照片' src={colItem.url} />
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.imgName}>图片名称</div>
              <Input
                type="text"
                onChange={(e) => { this.changeImgName(e.target.value, index) }}
                value={colItem.name}
                allowClear
                maxLength={30}
              />
            </Col>
            <Col span={7}>
              <div className={styles.imgUser}>{colItem.username}</div>
              <div className={styles.imgTime}>{moment(colItem.time).format('YYYY-MM-DD HH:mm:ss')}</div>
            </Col>
            <Col span={4}>
              <Button className={styles.deleteImgBtn} type='link' onClick={() => { this.deleteImgFun(colItem, index) }}>删除</Button>
            </Col>
          </Row>
        })}
      </div>
    )
  }

  render() {
    const { uploadImgLoading } = this.state;

    return <table className={[styles.itemTable, styles.imgTable].join(' ')}>
      <tbody>
        <tr><th className={styles.tableHeader}>设施照片</th></tr>
        <tr>
          <td>
            <div className={styles.vehicleImgBox}>
              {this.renderImg()}
              <div className={styles.uploadBox}>
                <Upload
                  accept='image/jpg,image/jpeg,image/png'
                  beforeUpload={this.beforeUpload}
                  onChange={(fileList) => { this.handleChange(fileList, 1) }}
                  headers={{
                    'Authorization': `Bearer ${getStore('token')}`
                  }}
                  action='/api/mb/facility/photo'
                  showUploadList={false}
                >
                  <Button type='link' disabled={uploadImgLoading === 1} loading={uploadImgLoading === 1}>
                    {uploadImgLoading !== 1 && <UploadOutlined />}上传图片
                                                    </Button>
                </Upload>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  }
}
export default Index;
