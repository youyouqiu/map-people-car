import axios, { AxiosResponse } from 'axios';
import { message } from 'antd';
import { getStore } from './localStorage';

/**
 * 请求拦截器
 */
axios.interceptors.request.use(
    (config) => {
        const token = getStore('token');
        const newConfig = config;
        newConfig.headers['Accept-Language'] = 'q=0.9,zh-CN;q=0.8,zh;q=0.7';
        if (token) {
            newConfig.headers.Authorization = `Bearer ${token}`;
        }
        return newConfig;
    },
    (error) => {
        return error;
    },
);

axios.interceptors.response.use(
    (response: AxiosResponse<any>) => {
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.data && error.response.data.msg) {
                message.error(error.response.data.msg);
            }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
        }
        console.error(error.config);

        return Promise.reject(error);
    }
)

/**
 * 平台通用返回格式
 */
export interface IPlatformCommonResponse {
    code: number;
    msg: string;
    data: any;
    total?: number;
}

/**
 * 对 axios 的简单封装
 */
export default class Ajax {
    /**
     * GET 请求
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static get(url: string, param: any): Promise<AxiosResponse> {
        return axios.get(url, {
            params: param
        })
    }

    /**
     * POST 请求
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static post(url: string, param: any): Promise<AxiosResponse> {
        return axios.post(url, param)
    }

    /**
    * 带错误处理的GET 请求
    * 请求成功则返回 T 类型的实例
    * 失败则返回 undefined
    * @param url 路径，形如 /a/b 不包含域名和端口部分
    * @param param 参数
    */
    public static async safeGet<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.get(url, {
                params: param
            });
            return Ajax.handleError(result);
        } catch (error) {
            return undefined;
        }
    }

    /**
    * 带错误处理的GET 请求
    * 请求成功则返回 T 类型的实例
    * 失败则返回 undefined
    * @param url 路径，形如 /a/b 不包含域名和端口部分
    * @param param 参数
    */
    public static async safeGetPage<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.get(url, {
                params: param
            });
            return Ajax.handlePageError(result);
        } catch (error) {
            return undefined;
        }

    }

    /**
     * 带错误处理的 POST 请求
     * 请求成功则返回 T 类型的实例
     * 失败则返回 undefined
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数, 如果要application/json 就传json对象，如果要 application/formData 就传 formData对象
     */
    public static async safePost<T>(url: string, param: any): Promise<T | undefined> {
        try {
            // if (!param || param instanceof URLSearchParams) {
            const result = await axios.post(url, param,);
            return Ajax.handleError(result);
            // } else {
            //     const result = await axios.post(url, param, {
            //         headers: { 'Resubmit-Token': getHashCode(JSON.stringify(param || '')) }
            //     });
            //     return Ajax.handleError(result);
            // }
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 阻止表单重复提交问题
     * @param url 
     * @param param 
     */
    public static async safeRepeatPost<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.post(url, param, {
                headers: { 'Resubmit-Token': getHashCode(JSON.stringify(param || '')) }
            });
            return Ajax.handleError(result);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 带错误处理的 POST 请求
     * 请求成功则返回 T 类型的实例
     * 失败则返回 undefined
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数, 如果要application/json 就传json对象，如果要 application/formData 就传 formData对象
     */
    public static async safePostPage<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.post(url, param);
            return Ajax.handlePageError(result);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 登录 POST 请求
     * 登录没有返回通用结果，所以单独写一个
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param data 参数 UrlSearchParam 对象
     */
    public static async safeLoginPost<T>(url: string, data: any): Promise<T | undefined> {
        try {
            const result = await axios.post(url, data);
            if (result.status === 200) {
                return result.data;
            } else {
                return undefined;
            }
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 带错误处理的delete 请求
     * 请求成功则返回 T 类型的实例
     * 失败则返回 undefined
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static async safeDelete<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.delete(url, {
                data: param
            });
            return Ajax.handleError(result);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * 带错误处理的put 请求
     * 请求成功则返回 T 类型的实例
     * 失败则返回 undefined
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static async safePut<T>(url: string, param: any): Promise<T | undefined> {
        try {
            const result = await axios.put(url, param,);
            return Ajax.handleError(result);
        } catch (error) {
            return undefined;
        }
    }


    static async handleError<T>(result: AxiosResponse<any>): Promise<T | undefined> {
        if (result.status === 200) {
            const data = result.data as IPlatformCommonResponse;
            if (data.code === 200) {
                return (data.data === undefined ? true : data.data) as T;
            } else {
                console.error(data);
                message.error(data.msg);
                return undefined;
            }
        } else {
            return undefined;
        }

    }

    static async handlePageError<T>(result: AxiosResponse<any>): Promise<T | undefined> {
        if (result.status === 200) {
            const data = result.data as IPlatformCommonResponse;
            if (data.code === 200) {
                return data as any as T;
            } else {
                console.error(data);
                message.error(data.msg);
                return undefined;
            }
        } else {
            return undefined;
        }

    }

    /**
     * delete 请求
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static delete(url: string, param: any): Promise<AxiosResponse> {
        return axios.delete(url, {
            params: param
        })
    }

    /**
     * put 请求
     * @param url 路径，形如 /a/b 不包含域名和端口部分
     * @param param 参数
     */
    public static put(url: string, param: any): Promise<AxiosResponse> {
        return axios.put(url, param)
    }
}


/**
 * 根据字符串生成hash值
 * @param param 
 */
function getHashCode(param: string) {
    return param.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}