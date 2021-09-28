/* eslint-disable @typescript-eslint/no-this-alias */
import SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import Config from "@/framework/config";

interface ICustomDescriptor extends PropertyDescriptor {
    key: string;
}

interface StompHeader {
    access_token?: string;
    login?: string;
    passcode?: string;
    host?: string;
    id?: string;
}

type StompCallback = (message: any) => any

export class WebSocketClass {

    url: string;
    socket: WebSocket;
    stompClient: Stomp.Client;
    conFlag: boolean;
    subscribeArr: Array<string>
    unsubscribeMap: { [key: string]: Stomp.Subscription };

    successCallbacks: Array<Function>;
    closeCallbacks: Array<Function>;

    constructor() {
        // this.socket = null;
        this.subscribeArr = [];
        this.url = "";
        this.conFlag = false;
        this.unsubscribeMap = {};
        this.successCallbacks = [];
        this.closeCallbacks = []
        /*this.stompClient=null;*/
        // this.stompClient = null;
    }

    init(url: string, headers: StompHeader, success: Function, close: Function,) {
        this.url = url;
        this.successCallbacks.push(success);
        this.closeCallbacks.push(close);
        this.socket = new SockJS(this.url, null, {
            'transports': ['websocket']
        });
        this.stompClient = Stomp.over(this.socket);
        // this.stompClient.debug = null;
        const that = this;
        that.stompClient.connect(headers, function () {
            that.conFlag = true;
            for (let i = 0; i < that.successCallbacks.length; i++) {
                const success = that.successCallbacks[i];
                if (typeof success === 'function') {
                    success();
                }
            }

            if (typeof close === 'function') {
                that.socket.onclose = () => {
                    for (let i = 0; i < that.closeCallbacks.length; i++) {
                        const close = that.closeCallbacks[i];
                        if (typeof close === 'function') {
                            close();
                        }
                    }
                };
            }
        });
    }

    waitForSuccess(success: Function, close: Function) {
        this.successCallbacks.push(success);
        this.closeCallbacks.push(close);
    }

    send(url: string, headers: StompHeader, requestStr: object) {
        this.stompClient.send(url, headers, JSON.stringify(requestStr));
    }

    subscribeAndSend(subUrl: string, callBack: StompCallback, sendUrl: string, headers: StompHeader, requestStr: object, state?: boolean) {
        if (this.subscribeArr.indexOf(subUrl) === -1 || state) {
            if (this.subscribeArr.indexOf(subUrl) === -1) {
                this.subscribeArr.push(subUrl);
            }
            this.unsubscribeMap[subUrl] = this.stompClient.subscribe(subUrl, callBack, headers);
            delete headers.id;
        }
        this.send(sendUrl, headers, requestStr);
    }

    subscribe(headers: StompHeader, subUrl: string, callBack: StompCallback, sendUrl: string, requestStr: object, state?: boolean) {
        if (this.stompClient.connected) {
            this.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr, state);
            return;
        }
        const that = this;
        that.stompClient.connect(headers, function () {
            that.conFlag = true;
            that.subscribeAndSend(subUrl, callBack, sendUrl, headers, requestStr);
        });
    }

    unsubscribealarm(headers: StompHeader, url: string, requestStr: object) {
        this.stompClient.send(url, headers, JSON.stringify(requestStr));
    }

    abort(headers: StompHeader, url: (() => any)) {
        this.stompClient.disconnect(url, headers);
    }

    unsubscribe(url: string) {
        const unsubscribe = this.unsubscribeMap[url];
        if (unsubscribe) {
            unsubscribe.unsubscribe();
        }
        const index = this.subscribeArr.indexOf(url);
        if (index > -1) {
            this.subscribeArr.splice(index, 1);
        }
    }

    close() {
        if (this.socket == null) {
        } else {
            this.socket.close();
        }
    }
}

let webSocket: WebSocketClass;

function getWebsocket(headers: StompHeader, success: Function, close: Function): WebSocketClass {
    if (webSocket) {
        if (webSocket.conFlag === false) {
            webSocket.waitForSuccess(success, close);
        }
        return webSocket;
    }
    webSocket = new WebSocketClass();

    if (headers) {
        webSocket.init(Config.remote.socketUrl + '/api/ws', headers, success, close);
    }
    return webSocket;
}

export default getWebsocket;

