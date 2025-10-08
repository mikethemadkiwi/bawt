const { EventEmitter } = require("events");
const ws = require('ws');  
const colors = require('colors');
  // INITSOCKET COURTESY OF BARRYCARLYON /////////////////////////////////////
 //    https://github.com/BarryCarlyon/twitch_misc/tree/main/eventsub      //
////////////////////////////////////////////////////////////////////////////
class initSocket extends EventEmitter {
    counter = 0
    closeCodes = {
        4000: 'Internal Server Error',
        4001: 'Client sent inbound traffic',
        4002: 'Client failed ping-pong',
        4003: 'Connection unused',
        4004: 'Reconnect grace time expired',
        4005: 'Network Timeout',
        4006: 'Network error',
        4007: 'Invalid Reconnect'
    }
    constructor(connect) {
        super()
        this._events = {};
        if (connect) {
            this.connect();
        }
    }
    connect(url, is_reconnect) {
        this.eventsub = {};
        this.counter++;
        url = url ? url : 'wss://eventsub.wss.twitch.tv/ws';
        is_reconnect = is_reconnect ? is_reconnect : false;
        console.log(`Connecting to ${url}|${is_reconnect}`);
        this.eventsub = new ws(url);
        this.eventsub.is_reconnecting = is_reconnect;
        this.eventsub.counter = this.counter;
        this.eventsub.addEventListener('open', () => {
            console.log(`Opened Connection to Twitch`);
        });
        this.eventsub.addEventListener('close', (close) => {
            if (!this.eventsub.is_reconnecting) {
                this.connect();
            }
            if (close.code == 1006) {
                this.eventsub.is_reconnecting = true;
            }
        });
        this.eventsub.addEventListener('error', (err) => {
            console.log(err);
            console.log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Connection Error`);
            this.connect(reconnect_url, true);
        });
        this.eventsub.addEventListener('message', (message) => {
            let { data } = message;
            data = JSON.parse(data);
            let { metadata, payload } = data;
            let { message_id, message_type, message_timestamp } = metadata;
            switch (message_type) {
                case 'session_welcome':
                    let { session } = payload;
                    let { id, keepalive_timeout_seconds } = session;
                    this.eventsub.twitch_websocket_id = id;
                    if (!this.eventsub.is_reconnecting) {
                        this.emit('connected', id);
                    } else {
                        this.emit('reconnected', id);
                    }
                    this.silence(keepalive_timeout_seconds);
                    break;
                case 'session_keepalive':
                    this.emit('session_keepalive');
                    this.silence();
                    break;
                case 'notification':
                    let { subscription, event } = payload;
                    let { type } = subscription;
                    this.emit('notification', { metadata, payload });
                    this.emit(type, { metadata, payload });
                    this.silence();
                    break;
                case 'session_reconnect':
                    this.eventsub.is_reconnecting = true;
                    let reconnect_url = payload.session.reconnect_url;
                    console.log('Connect to new url', reconnect_url);
                    console.log(`${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Reconnect request ${reconnect_url}`)
                    this.connect(reconnect_url, true);
                    break;
                case 'websocket_disconnect':
                    console.log(`${this.eventsub.counter} Recv Disconnect`);
                    console.log('websocket_disconnect', payload);
                    break;
                case 'revocation':
                    console.log(`${this.eventsub.counter} Recv Topic Revocation`);
                    console.log('revocation', payload);
                    this.emit('revocation', { metadata, payload });
                    break;
                default:
                    console.log(`${this.eventsub.counter} unexpected`, metadata, payload);
                    break;
            }
        });
    }
    trigger() {
        this.eventsub.send('cat');
    }
    close() {
        this.eventsub.close();
    }
    silenceHandler = false;
    silenceTime = 10;
    silence(keepalive_timeout_seconds) {
        if (keepalive_timeout_seconds) {
            this.silenceTime = keepalive_timeout_seconds;
            this.silenceTime++;
        }
        clearTimeout(this.silenceHandler);
        this.silenceHandler = setTimeout(() => {
            this.emit('session_silenced');
            this.close();
        }, (this.silenceTime * 1000));
    }
    on(name, listener) {
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(listener);
    }
    emit(name, data) {
        if (!this._events[name]) {
            return;
        }
        const fireCallbacks = (callback) => {
            callback(data);
        };
        this._events[name].forEach(fireCallbacks);
    }
}
module.exports = initSocket;