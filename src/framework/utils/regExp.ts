// 手机号码
export const phoneReg = new RegExp(/^(\d{3,4}-?)?\d{7,9}$/, 'g');
// 数字/字母
export const NumCharReg = new RegExp(/^[A-Za-z0-9]+$/, 'g');
//数字/短横杠
export const NumBarReg = new RegExp(/^[0-9-]{1,20}$/, 'g');
// 经度验证 验证规则 小数点前两位取值范围（0,180]，小数点后7位
export const longitudeReg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,7})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,7}|180)$/;
// 纬度验证 验证规则 小数点前两位取值范围（0,90]，小数点后7位
export const latitudeReg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,7}|90\.0{0,7}|[0-8]?\d{1}|90)$/;
// 数字 字母 横杆
export const characterReg = /^[_A-Za-z0-9-]+$/;
// 汉字 数字 字母 横杆
export const chineseReg = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
// 8位数字或大写字母 + “-” + 1位数字或大写字母(组织机构代码格式)
export const orgCodeReg = /^[\dA-Z]{8}-[\dA-Z]$/;
// 汉字 数字 字母 短杠 下划线
export const mixReg = /^[_\u4e00-\u9fa5a-zA-Z0-9-]+$/;
// 中文/字母/原点/非首尾的空格
export const realNameReg = /^[\u4e00-\u9fa5a-zA-Z·\s]*$/;
//邮箱
export const email = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
