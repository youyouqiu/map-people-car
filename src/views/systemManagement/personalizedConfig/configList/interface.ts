
export interface IProps {
  orgId: string,
  orgName: string
}

export interface componentIProps {
  visible: boolean;
  onClose: Function;
  getContainer?: 'body';
  queryParam: { pageId: string, orgId: string }
  dataSource: any
}

// visible: boolean;
// onClose: Function;
// getContainer?: 'body';
// id: string;
// orgId: string;
// previewData: any;

export interface PreviewIProps {
  visible: boolean;
  onClose: Function;
  dataSource: any;
}

export const listData = [
  {
    title: '登录页个性化设置',
    description: '设置登录页面地图和登录框LOGO',
    picture: '登录页面底图：图片建议大小1920x1080左右 格式为PNG、JPG、JPEG、SVG、GIF',
    logo: '登录框LOGO：图片大小建议689x123左右，格式为PNG、JPG、JPEG、SVG、GIF',
    time: '',
    UpdateDataUsername: '',
    key: 1
  },
  {
    title: '平台首页',
    key: 0
  },
  {
    title: '平台ICO',
    description: '设置纯图的正方形LOGO',
    picture: '1、图片格式要求ICO格式',
    logo: '2、图片大小建议正方形如(32x32、64x64、128x128)左右',
    time: '',
    UpdateDataUsername: '',
    key: 2
  },
  {
    title: '平台Logo',
    description: '设置带文字的距形LOGO',
    picture: '图片建议大小38x38左右',
    time: '',
    UpdateDataUsername: '',
    key: 3
  },
  {
    title: '平台标题',
    description: '设置所有页面顶部导航栏左侧露出的平台名称',
    picture: '目前设置的平台标题为：F3环卫云平台',
    time: '',
    UpdateDataUsername: '',
    key: 4
  },
  {
    title: '平台首页置底信息',
    description: '设置平台首页底部的版权信息说明',
    picture: '目前设置的平台首页置底信息为：@2015-2017中位(北京)科技有限公司，京ICP备15041746号-1',
    time: '',
    UpdateDataUsername: '',
    key: 5
  },
  {
    title: '平台登录后首页',
    description: '设置平台登录平台后展示的首页页面',
    picture: '目前设置的平台登录后首页为：个人中心',
    time: '',
    UpdateDataUsername: '',
    key: 6
  },
];
