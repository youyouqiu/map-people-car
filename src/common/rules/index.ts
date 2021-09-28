import { message } from "antd"

/**
 * 常规字符
 * 特殊字符“空格、换行和英文格式的`^*;'\"|, /<>?”除外
 */
export const regularText = {
    pattern: /^[^`\s\^\*;'"\\|,/<>\?]*$/,
    message: '请不要输入空格、换行和`^*;\'\\\"|, /<>?'
}

/**
 * 组织机构代码
 * 8位数字或大写字母”+“-”+“1位数字或大写字母
 */
export const orgCode = {
    pattern: /^[`\^\*;'"\|,/<>\?]/,
    message: '请不要输入空格、换行和`^*;\'\\\"|, /<>?'
}

/**
 * 数字
 * 8位数字或大写字母”+“-”+“1位数字或大写字母
 */
export const onlyNumber = {
    pattern: /^\d+$/,
    message: '请输入数字'
}
/*
格式为“0x01-0xFF”，超过4字符限制输入
*/
export const str0x__ = {//str0x__,str0x01_0xFF
    pattern: /^0x[A-F0-9]{2}/,
    message: '请输入格式为“0x01-0xFF”的4位字符'
}
/*
格式为“0xF000-0x F0FF”，超过6字符限制输入 
*/
export const str0xF0__ = {//str0xF0__,str0xF000_0xF0FF
    pattern: /^0xF0[A-F0-9]{2}/,
    message: '请输入格式为“0xF000-0xF0FF”的6位字符'
}

/**
 * 邮箱
 */
export const email = {
    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
    message: '邮箱格式不正确'
}
