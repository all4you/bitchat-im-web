"use strict";

// 直接引入已经编译好的proto静态js文件
// import xxx from是ES6规范
// require是CommonJS规范
import protoRoot from '@/proto.js';
import FlakeId from 'flake-idgen';
import format from 'biguint-format';

/**
 * 定义一个 BitSocket 类
 */
class BitSocket {
    _config;
    /**
     * WebSocket对象实例
     */
    _ws;
    /**
     * WebSocket实例的连接状态
     */
    _active;
    _channelConnected;
    _channelClosed;
    _channelRead;
    _channelConnectedCallback;
    _channelClosedCallback;
    _channelReadCallback;
    /**
     * 心跳的间隔时间，单位：s
     */
    _heartBeatInterval;
    /**
     * 是否断线重连
     */
    _reconnect;
    /**
     * 重连的间隔时间，单位：s
     */
    _reconnectInterval;
    /**
     * 断线重连最大次数
     */
    _maxReConnectCnt;
    /**
     * 心跳定时器
     */
    _heartBeatTimer;
    /**
     * 断线重连定时器
     */
    _reConnectTimer;
    _TYPE;
    _flakeIdGen;
    /**
     * 正在执行的请求
     */
    _pendings;


    constructor(config) {
        this._config = config;
        this._TYPE = protoRoot.lookupType('pb.Frame').Type;
        this._flakeIdGen = new FlakeId();
        this._pendings = new Map();
        // 初始化
        this._init();
    }

    _init() {
        // 从对象中提取各个参数，如果参数中没有指定，则使用默认值
        let {
            host = '127.0.0.1',
            port = 8864,
            path = '/ws',
            heartBeatInterval = 30,
            reconnect = true,
            reconnectInterval = 15,
            maxReConnectCnt = 5
        } = this._config;

        // 清空所有对象
        this._clear();
        // 构造WebSocket连接url，并初始化WebSocket实例
        let url = 'ws://' + host + ':' + port + path;
        this._ws = new WebSocket(url);
        this._ws.binaryType = 'arraybuffer';
        // 设置其他参数
        this._heartBeatInterval = heartBeatInterval * 1000;
        this._reconnect = reconnect;
        this._reconnectInterval = reconnectInterval * 1000;
        this._maxReConnectCnt = maxReConnectCnt;

        this._ws.onopen = () => {
            // 设置状态为已连接
            this._active = true;
            this._channelConnected();
            this._reConnectTimer ? clearInterval(this._reConnectTimer) : false;
            // 发送心跳
            this._heartbeat();
        }

        this._ws.onclose = () => {
            // 设置状态为已断开
            this._active = false;
            this._channelClosed();
            this._heartBeatTimer ? clearInterval(this._heartBeatTimer) : false;
            // 断线重连
            this._reConnect();
        }

        this._ws.onmessage = (evt) => {
            let buffer = evt.data;
            let frameObj = this._frameDecoder(buffer);
            let id = frameObj.id;
            // 检查pendings中有没有该id请求对应的回调
            let callback = this._pendings.get(id);
            if (callback && typeof (callback) === 'function') {
                callback(frameObj);
                this._pendings.delete(id);
            } else {
                this._channelRead(frameObj);
            }
        }
    }

    _clear() {
        delete this._ws;
        this._heartBeatTimer ? clearInterval(this._heartBeatTimer) : false;
        this._reConnectTimer ? clearInterval(this._reConnectTimer) : false;
    }

    _heartbeat() {
        this._heartBeatTimer = setInterval(() => {
            this.request('heartBeat', {}, (frameObj) => {
                console.debug('heartBeat success', frameObj);
            });
        }, this._heartBeatInterval);
    }

    _reConnect() {
        if (!this._reconnect) {
            return;
        }
        this._reConnectTimer = setInterval(() => {
            // 重连次数
            if (this._maxReConnectCnt <= 0) {
                this._reConnectTimer ? clearInterval(this._reConnectTimer) : false;
                return;
            } else {
                this._maxReConnectCnt--;
            }
            // 进行重连
            this._init();
        }, this._reconnectInterval);
    }

    _channelConnected() {
        // 如果用户有设置连接成功的回调，则优先触发回调
        if (this._channelConnectedCallback && typeof (this._channelConnectedCallback) === 'function') {
            this._channelConnectedCallback();
        } else {
            console.log('_channelConnected');
        }
    }

    _channelClosed() {
        // 如果用户有设置连接断开的回调，则优先触发回调
        if (this._channelClosedCallback && typeof (this._channelClosedCallback) === 'function') {
            this._channelClosedCallback();
        } else {
            console.log('_channelClosed');
        }
    }

    _channelRead(frameObj) {
        // 触发回调
        if (this._channelReadCallback && typeof (this._channelReadCallback) === 'function') {
            this._channelReadCallback(frameObj);
        } else {
            console.log('_channelRead==>', frameObj);
        }
    }

    channelConnected(callback) {
        // 设置用户指定的回调函数
        this._channelConnectedCallback = callback;
    }

    channelClosed(callback) {
        // 设置用户指定的回调函数
        this._channelClosedCallback = callback;
    }

    channelRead(callback) {
        // 设置用户指定的回调函数
        this._channelReadCallback = callback;
    }

    active() {
        return this._active;
    }

    type() {
        return this._TYPE;
    }

    request(serviceName, params, callback) {
        if (!this._active) {
            throw Error('Channel not connected!');
        }
        if (!serviceName || serviceName == null || serviceName == '') {
            throw Error('serviceName cannot be null');
        }
        // _flakeIdGen.next() 生成的是一个Buffer，需要借助 intformat转换成decimal
        let id = format(this._flakeIdGen.next(), 'dec');
        let frameObj = {
            "magic": 0xBF,
            "id": id,
            "type": this._TYPE.REQUEST,
            "serviceName": serviceName,
            "methodName": null,
            "paramJson": JSON.stringify(params || {})
        };
        // 将回调保存到pendings中
        if (callback && typeof (callback) === 'function') {
            this._pendings.set(id, callback);
        }
        // frame
        let completeBuffer = this._frameEncoder(frameObj);
        this._ws.send(completeBuffer);
    }

    /**
     * 将frameObj对象编码成最终的ArrayBuffer
     * @param {*} frameObj 
     */
    _frameEncoder(frameObj) {
        let frameBuffer = this._encodeProto('pb.Frame', frameObj);
        // 创建一个二进制对象 length(6) = magic(1) + type(1) + frameLength(4)
        let headerBuffer = new ArrayBuffer(6);
        // 为二进制对象绑定一个视图用来操作数据
        let headerView = new DataView(headerBuffer);
        headerView.setInt8(0, frameObj.magic); // magic
        headerView.setInt8(1, frameObj.type); // type
        headerView.setInt32(2, frameBuffer.byteLength); // length
        // 将请求头和请求体合并
        let completeBuffer = this._mergeArrayBuffer(headerBuffer, frameBuffer);
        return completeBuffer;
    }

    /**
     * 将ArrayBuffer解码成frameObj对象
     * @param {*} dataBuffer 
     */
    _frameDecoder(dataBuffer) {
        let dataView = new DataView(dataBuffer);
        // 读取header部分
        let magic = dataView.getInt8(0);
        let type = dataView.getInt8(1);
        let lentgh = dataView.getInt32(2);
        // 从第6位开始，一直到结束，全部都是frame部分
        let frameBuffer = dataBuffer.slice(6);
        // 将ArrayBuffer转成Uint8Array类型，以便protobuf可以进行解码
        let frameArray = new Uint8Array(frameBuffer);
        let frameObj = this._decodeProto('pb.Frame', frameArray);
        return frameObj;
    }

    /**
     * 将obj编码成 buffer
     * @param {*} protoMessageName 
     * @param {*} obj 
     */
    _encodeProto(protoMessageName, obj) {
        // 寻找消息类型
        let ProtoMessage = protoRoot.lookupType(protoMessageName);
        // 检查消息是否合格
        let errMsg = ProtoMessage.verify(obj);
        if (errMsg)
            throw Error(errMsg);
        let buffer = ProtoMessage.encode(obj).finish();
        return buffer;
    }

    /**
     * 将buffer解码成 obj
     * @param {*} protoMessageName 
     * @param {*} buffer Uint8Array (browser) or Buffer (node)
     */
    _decodeProto(protoMessageName, buffer) {
        // 寻找消息类型
        let ProtoMessage = protoRoot.lookupType(protoMessageName);
        try {
            let message = ProtoMessage.decode(buffer);
            let obj = ProtoMessage.toObject(message);
            return obj;
        } catch (e) {
            throw Error(e);
        }
    }

    _mergeArrayBuffer(buf1, buf2) {
        let u81 = new Uint8Array(buf1);
        let u82 = new Uint8Array(buf2);
        let array = new Uint8Array(buf1.byteLength + buf2.byteLength);
        array.set(u81, 0);
        array.set(u82, buf1.byteLength);
        return array.buffer;
    }
};

// 通过CommonJS规范 module.exports=BitSocket，将类暴露出去
// 或者通过ES6规范 export default BitSocket，将类暴露出去
export default BitSocket;