import { getStore } from './localStorage';


// 单例模式xmlHttpRequest
var Singleton = (function () {
    var instance;

    function createInstance() {
        var object = new XMLHttpRequest();
        return object;
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

export const ajax = function (url, method, body, requestType, callback, errCallback) {
    var xmlHttpRequest = Singleton.getInstance();
    xmlHttpRequest.onload = function (event) {
        if (xmlHttpRequest.readyState === 4 && xmlHttpRequest.status === 200) {
            callback(JSON.parse(xmlHttpRequest.responseText));
        } else {
            errCallback(xmlHttpRequest.response);
        }

    }

    xmlHttpRequest.open(method, url);
    addHeader(xmlHttpRequest, requestType);
    console.log('请求参数', body);

    xmlHttpRequest.send(body);
}

function addHeader(xmlHttpRequest, type) {
    // formData 什么头也不用添加
    if (!type) {
        type = 'json';
    }
    const token = getStore('token');
    if (type === 'json') {
        xmlHttpRequest.setRequestHeader('Accept', 'application/json, text/plain, */*');
        xmlHttpRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xmlHttpRequest.setRequestHeader('Accept-Language', 'q=0.9,zh-CN;q=0.8,zh;q=0.7');
        xmlHttpRequest.setRequestHeader('Authorization', `Bearer ${token}`);
    }
}