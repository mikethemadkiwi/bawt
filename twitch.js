let currentTokens = {};
let botTokens = {};
let currentMeta = {};
let keyupdate;
/////////////////////////
let otherJoinShow = false;
let otherPartShow = false;
let otherChatShow = false;
let authKeyShow = false;
let localJoinCount = 0;
let localPartCount = 0;
let localChatCount = 0;
let otherJoinCount = 0;
let otherPartCount = 0;
let otherChatCount = 0;
const currentCounts = function(){
    return {
        local:{join:localJoinCount,part:localPartCount,chat:localChatCount},
        other:{join:otherJoinCount,part:otherPartCount,chat:otherChatCount}
    }
}
/////////////////////////
const ws = require('ws');
const got = require('got');
const fetchUrl = require("fetch").fetchUrl
const TwitchConf = require('../kiwiauth/twitch/oauth2.json');
const kiwibotConf = require('../kiwiauth/twitch/kiwisbot2.json');
const weatherConf = require('../kiwiauth/weather/londonontario.json');
const DBAUTH = require('../kiwiauth/sql/dbconfig.json');
const express = require('express');
const socketapp = express();
const http = require('http');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const server = http.createServer(socketapp);
const { Server } = require("socket.io");
const path = require('path')
const colors = require('colors');
const mysql = require('mysql');
const fs = require('fs');
////
const io = new Server(server);
socketapp.use(bodyParser.json());
socketapp.use(bodyParser.urlencoded({ extended: false }));
socketapp.use(cookieParser());
socketapp.use(express.static(path.join(__dirname, 'socket-www')))
const port = process.env.PORT || 12345;
const sockets = [];
const MKClient = [];
const ChansToJoin = [];
let mKiwi;
let mKbot;
let mStream;
let mAds;
let chatters
let lastKeepAlive;
let lastAds;
let viewer_count = 0;
let TwitchUsers;
let tGamePlayer = [];
const weathertimeout = [];
const subscribedtopics = [];
let DBConn_Server = null;
let DBConn_ads = null;
let tDate = Date.now();


class PlayerObj {
    constructor(tuser) {
        this.id = tuser.id;
        this.twitchid = tuser.id;
        this.profile = tuser.profile_image_url;
        this.name = tuser.display_name;
        this.loc = 0;
        this.xp = 0.0;
        this.level = 0;
        this.att = 1;
        this.def = 1;
        this.agi = 1;
        this.arm = 0;
        this.wea = 0;
        this.currency = 0.0;
    }
}

execQuery = async function(querystr, parameters){
    if(DBConn_Server==null){ 
        DBConn_Server = new mysql.createConnection(DBAUTH);
        DBConn_Server.connect(function(err) {
            if (err) throw err;    
        });        
        DBConn_Server.on('error', function(err) {
            console.log('DB CONNECTION ERROR', err.code); // 'ER_BAD_DB_ERROR'
            DBConn_Server.end();
            let reconn = setTimeout(() => {
                DBConn_Server.connect();
            }, 5000);              
        });
    }
    DBConn_Server.query(querystr, function (error, results, fields) {
        if (error) {
            console.log(error)
            return;
        };
        if (results) {
            // console.log('mysql results',results)
            return results;
        };
        if (fields) {
            console.log('feilds', fields)
            return;
        };
    });
}
// ---

        //
                
        // let isGamePlayer = tGamePlayer.map(function(obj) { return obj[0].id; }).indexOf(element.user_id)
        // if(isGamePlayer == -1) {
        //     let yesindbpi = [new PlayerObj(tUser[0]), tUser[0]];
        //     tGamePlayer.push(prepuser)
        //     io.emit('twitchgameusers', prepuser)
        // }else{
        //     io.emit('twitchgameusers', tGamePlayer[isGamePlayer])
        // }



 
function CheckPlayerExists(tuser){
    return new Promise((resolve, reject)=>{
        if(DBConn_Server==null){ 
            DBConn_Server = new mysql.createConnection(DBAUTH);
            DBConn_Server.connect(function(err) {
                if (err) throw err;    
            });        
            DBConn_Server.on('error', function(err) {
                console.log('DB CONNECTION ERROR', err.code); // 'ER_BAD_DB_ERROR'
                DBConn_Server.end();
                let reconn = setTimeout(() => {
                    DBConn_Server.connect();
                }, 5000);              
            });
        }
        let msqlstr = `SELECT * FROM twitchgame WHERE twitchid = ${tuser.id}`;
        DBConn_Server.query(msqlstr, function (error, results, fields) {
            if (error) {
                console.log(error)
                reject()
            };
            if (results) {
                // console.log('mysql results',results)
                resolve(results)
            };
            if (fields) {
                // console.log('feilds', fields)
                reject()
            };
        });
        // let existsuuid = execQuery(msqlstr)
        // resolve(existsuuid)
    })
}
function AddGamePlayer(tuser){
    return new Promise((resolve, reject)=>{
        let existsuuid = execQuery(`INSERT INTO twitchgame(twitchid, name, profile) VALUES ('${tuser.id}', '${tuser.display_name}', '${tuser.profile_image_url}')`)
        resolve(true)
    })
}
// Database
class DBObject {
    FetchAuth(){
        return new Promise((resolve, reject)=>{
            if(DBConn_Server!=null){                
                DBConn_Server.end();
                DBConn_Server = null;
            }
            DBConn_Server = new mysql.createConnection(DBAUTH);
            DBConn_Server.connect(function(err) {
                if (err) throw err;    
            });

            let qStr = `SELECT * from twitch`
            DBConn_Server.query(qStr, function (error, results, fields) {
                if (error) {
                    reject(error)
                    return;
                };
                //
                let ta = JSON.parse(results[0].Auth);
                let tba = JSON.parse(results[0].BotAuth);
                currentTokens = ta
                botTokens = tba
                currentMeta = JSON.parse(results[0].Meta);
                resolve([ta,tba])
            });
            DBConn_Server.on('error', function(err) {
                console.log('DB CONNECTION ERROR', err.code); // 'ER_BAD_DB_ERROR'
                DBConn_Server.end();
                let reconn = setTimeout(() => {
                    DBConn_Server.connect();
                }, 5000);              
            });
        })
    }    
    StoreAdData(addata){
        return new Promise((resolve, reject)=>{            
            if(DBConn_ads!=null){                
                DBConn_ads.end();
                DBConn_ads = null;
            }
            DBConn_ads = new mysql.createConnection(DBAUTH);
            DBConn_ads.connect(function(err) {
                if (err) throw err;    
            });            
            DBConn_ads.on('error', function(err) {
                console.log('DB ads connect ERROR', err.code); // 'ER_BAD_DB_ERROR'
                DBConn_ads.end();
                let reconn = setTimeout(() => {
                    DBConn_ads.connect();
                }, 5000);              
            });            
            let prepadData = JSON.stringify(addata)
            let qStr = `UPDATE twitch SET Ads='${prepadData}' WHERE id='1'`;
            DBConn_ads.query(qStr, function (error, results, fields) {
                if (error) {
                    reject(error)
                    return;
                };               
                console.log(`[Storing Ad Data]`, results.message)
                resolve(results)
            });
        })
    }
    StorePlayerData(addata){
        return new Promise((resolve, reject)=>{            
            if(DBConn_ads!=null){                
                DBConn_ads.end();
                DBConn_ads = null;
            }
            DBConn_ads = new mysql.createConnection(DBAUTH);
            DBConn_ads.connect(function(err) {
                if (err) throw err;    
            });  
            //         
            // let prepadData = JSON.stringify(addata)
            // 
            let qStr = `UPDATE twitchgame SET name = '${addata.name}', profile = '${addata.profile}', tuser = null, task = '${addata.task}', bubble = '${addata.bubble}', actposx = '${addata.actposx}', actposy = '${addata.actposy}', tarposx = '${addata.tarposx}', tarposy = '${addata.tarposy}', xp = '${addata.xp}', level = '${addata.level}', attack = '${addata.attack}', defense = '${addata.defense}', agility = '${addata.agility}', armour = '${addata.armour}', weapon = '${addata.weapon}', currency = '${addata.currency}' WHERE twitchid='${addata.twitchid}'`;
            DBConn_ads.query(qStr, function (error, results, fields) {
                if (error) {
                    reject(error)
                    return;
                };                         
                resolve(results)
            });
        })
    }
}
  // INITSOCKET COURTESY OF BARRYCARLYON /////////////////////////////////////
 //    https://github.com/BarryCarlyon/twitch_misc/tree/main/eventsub      //
////////////////////////////////////////////////////////////////////////////
class initSocket {
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
// Mkutils ////////////////////////////////////////////////////////////////////
class MKUtils {
    SayInChat = function(chatMessage){
        return new Promise((resolve, reject) => {
            let tmpAuth = botTokens.access_token;
            got({
                "url": "https://api.twitch.tv/helix/chat/messages",
                "method": 'POST',
                "headers": {                            
                    "Client-ID": kiwibotConf.client_id,
                    "Authorization": "Bearer " + tmpAuth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "broadcaster_id": mKiwi[0].id,
                    "sender_id": mKbot[0].id,
                    "message": chatMessage
                }),
                "responseType": 'json'
            })
            .then(resp => {
                resolve(resp.body.data)               
            })
            .catch(err => {
                console.error('Error body:', err);
                reject(false)
            }); 
        })          
    }
    fetchUserByName(name){
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?login=${name}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    resolve(bs.data)
            })
        })
    }
    fetchUserById(uId){
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?id=${uId}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    resolve(bs.data)
            })
        })
    }
    fetchStreamById(uId){
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/streams?user_login=${uId}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    resolve(bs.data)
            })
        })
    }
    fetchAdsSchedule(uId){            
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/channels/ads?broadcaster_id=${mKiwi[0].id}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                let bs = JSON.parse(body);
                resolve(bs.data[0])
            })
        })
    }
    isUserSubscribed(userid){
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${mKiwi[0].id}&user_id=${userid}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    if(bs.data){
                        resolve(bs.data)
                    }
                    else{
                        resolve({})
                    }
            })
        })
    }
    isUserFollower(userid){
        return new Promise((resolve, reject)=> {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${mKiwi[0].id}&user_id=${userid}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    if(bs.data){
                        resolve(bs.data)
                    }
                    else{
                        resolve({})
                    }
            }) 
        })
    }
    RunAds(account){
        return new Promise((resolve, reject) => {
            let checkDT = Date.now()
            if (checkDT >= tDate){
                //
                tDate = (Date.now()+1200000)
                //
                let tmpAuth = currentTokens.access_token;
                got({
                    "url": "https://api.twitch.tv/helix/channels/commercial",
                    "method": 'POST',
                    "headers": {                            
                        "Client-ID": TwitchConf.client_id,
                        "Authorization": "Bearer " + tmpAuth
                    },
                    "form": {
                        "broadcaster_id": mKiwi[0].id,
                        "length": 90
                    },
                    "responseType": 'json'
                })
                .then(resp => {
                    lastAds = resp.body.data
                    // console.log('ad data', lastAds)
                    resolve(['Ads', checkDT, resp.body.data])                    
                })
                .catch(err => {
                    console.error('Error body:', err);
                });
            }
            else {
                let diff = (tDate-checkDT)
                let diffm = Math.floor((diff/1000)/60)
                resolve(['NextRun', checkDT, diffm])
            }
        })    
    }            
    SubscribeToTopic(session_id, type, version, condition){
        return new Promise((resolve, reject) => {
            console.log("Eventsocket Topic:", session_id, type)
            let tmpAuth = currentTokens.access_token;
            got({
                "url": "https://api.twitch.tv/helix/eventsub/subscriptions",
                "method": 'POST',
                "headers": {                            
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    version,
                    condition,
                    transport: {
                        method: "websocket",
                        session_id
                    }
                }),
                "responseType": 'json'
            })
            .then(resp => {
                let msgData = resp.body.data;
                console.log(msgData[0].type, msgData[0].status)
                resolve(resp.body.data)               
            })
            .catch(err => {
                console.error('Error body:', err);
                reject(false)
            });

        })
    }
    ShoutoutUser(targetID){
        return new Promise((resolve, reject) => {
            let tmpAuth = currentTokens.access_token;
            got({
                "url": "https://api.twitch.tv/helix/chat/shoutouts",
                "method": 'POST',
                "headers": {                            
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from_broadcaster_id: mKiwi[0].id,
                    to_broadcaster_id: targetID,
                    moderator_id: mKiwi[0].id
                })
            })
            .then(resp => {
                resolve(resp.body.data)               
            })
            .catch(err => {
                console.error('Error body:', err);
                reject(false)
            });      
        })
    }
    getChatters(){
        return new Promise((resolve, reject)=> {
            let tmpAuth = currentTokens.access_token;
            let fetchu = fetchUrl(`https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${mKiwi[0].id}&moderator_id=${mKiwi[0].id}`,
            {"headers": {
                    "Client-ID": TwitchConf.client_id,
                    "Authorization": "Bearer " + tmpAuth
                    }
            },
            function(error, meta, body){
                    let bs = JSON.parse(body);
                    if(bs.data){
                        resolve(bs.data)
                    }
                    else{
                        resolve({})
                    }
            }) 
        })
    }
    ResetGamePlayers(){
        return new Promise((resolve, reject)=> {
            // tGamePlayer
            let participants = [];
            tGamePlayer.forEach(gPlayer => {
                // console.log('endround', gPlayer.name)
                if (gPlayer.bubble != 0){
                    switch(gPlayer.bubble){
                        case(0): // home

                        break;
                        case(1): // mines attack strength
                            switch(gPlayer.task){
                                case(0): // idle / wander
                                    gPlayer.attack = (gPlayer.attack + 1);
                                    let pstr1 = `${gPlayer.name} Gained 1 Attack! Now: ${gPlayer.attack}`
                                    io.emit('round1rewards', {str:pstr1, gPlayer:gPlayer});
                                break;
                                case(1): // work

                                break;
                                default:
                                    //
                            }
                        break;
                        case(2): // training agi
                            switch(gPlayer.task){
                                case(0): // idle / wander
                                    gPlayer.agility = (gPlayer.agility + 1);
                                    let pstr1 = `${gPlayer.name} Gained 1 Agility! Now: ${gPlayer.agility}`
                                    io.emit('round1rewards', {str:pstr1, gPlayer:gPlayer});
                                break;
                                case(1): // work

                                break;
                                default:
                                    //
                            }
                        break;
                        case(3): // fort def
                            switch(gPlayer.task){
                                case(0): // idle / wander
                                    gPlayer.defense = (gPlayer.defense + 1);
                                    let pstr1 = `${gPlayer.name} Gained 1 Defense! Now: ${gPlayer.defense}`
                                    io.emit('round1rewards', {str:pstr1, gPlayer:gPlayer});
                                break;
                                case(1): // work

                                break;
                                default:
                                    //
                            }
                        break;
                        case(4): // forest
                            switch(gPlayer.task){
                                case(0): // idle / wander

                                break;
                                case(1): // work

                                break;
                                default:
                                    //
                            }
                        break;
                        default:
                            //
                    }
                    gPlayer.bubble = 0; // wander
                    gPlayer.tarposx = 150;
                    gPlayer.tarposy = 150;                    
                    let pXp = ((1 + gPlayer.level) * Math.random(0,2));
                    let pReward = ((5 + gPlayer.level) * Math.random(0,5));
                    gPlayer.currency = (gPlayer.currency + pReward)
                    gPlayer.xp = (gPlayer.xp + pXp)
                }
                // save player to db
                let db = new DBObject;
                let saveplayer = db.StorePlayerData(gPlayer)
                io.emit('newplayertarget', gPlayer);
            });
            resolve(true);
        }) 
    }
    BeginBossBattle(){
        return new Promise((resolve, reject)=> {
            console.log('bbb')
            resolve(true)
        })
    }
}
///////////////////////////////////////
// START ENGINE
///////////////////////////////////////
let _db = new DBObject;
let _mk = new MKUtils;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
let startNow = setTimeout(async () => {
    let auth = await _db.FetchAuth();
    //
    mKiwi = await _mk.fetchUserByName(TwitchConf.username)
    mKbot = await _mk.fetchUserByName(kiwibotConf.username)
    mStream = await _mk.fetchStreamById(TwitchConf.username)
    mAds = await _mk.fetchAdsSchedule(mKiwi[0].id)    
    //
    let eventSub = new initSocket(true);
    eventSub.on('session_keepalive', () => {
        lastKeepAlive = new Date();
    });
    eventSub.on('connected', (id) => {
        let twitchsocketID = id;
        console.log(`Connected to WebSocket with ${id}`, mKiwi[0].id);       
        /////////////////////////////////////////////////
        /////////////////////////////////////////////////        
        _mk.SubscribeToTopic(id, 'user.update', '1', { user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'stream.online', '1', { broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'stream.offline', '1', { broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.update', '2', { broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.follow', '2', { broadcaster_user_id: mKiwi[0].id, moderator_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.raid', '1', { to_broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.bits.use', '1', { broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.chat.message', '1', { broadcaster_user_id: mKiwi[0].id, user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.chat.notification', '1', { broadcaster_user_id: mKiwi[0].id, user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.channel_points_custom_reward_redemption.add', '1', { broadcaster_user_id: mKiwi[0].id })
        _mk.SubscribeToTopic(id, 'channel.channel_points_automatic_reward_redemption.add', '2', { broadcaster_user_id: mKiwi[0].id })
        /////////////////////////////////////////////////
        /////////////////////////////////////////////////
    });
    //
    chatters = await _mk.getChatters()
    for (let index = 0; index < chatters.length; index++) {
        const element = chatters[index];
        let tUser = await _mk.fetchUserById(element.user_id)
        let yesindb = await CheckPlayerExists(tUser[0])
        if (yesindb[0] == null){
            let newPlayer = await AddGamePlayer(tUser[0]);
            yesindb = await CheckPlayerExists(tUser[0])
        }
        let isGamePlayer = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(tUser[0].id)
        if(isGamePlayer == -1) {
            io.emit('twitchgameusers', yesindb[0])
            tGamePlayer.push(yesindb[0])
        }else{
            io.emit('twitchgameusers', tGamePlayer[isGamePlayer])
        }
    }
    //
    keyupdate = setInterval(async () => {
        let auth = await _db.FetchAuth();
        mKiwi = await _mk.fetchUserByName(TwitchConf.username)
        mKbot = await _mk.fetchUserByName(kiwibotConf.username)
        mStream = await _mk.fetchStreamById(TwitchConf.username)
        mAds = await _mk.fetchAdsSchedule(mKiwi[0].id) 
        //       
        chatters = await _mk.getChatters()
        for (let index = 0; index < chatters.length; index++) {
            const element = chatters[index];
            let tUser = await _mk.fetchUserById(element.user_id)
            let yesindb = await CheckPlayerExists(tUser[0])
            if (yesindb[0] == null){
                let newPlayer = await AddGamePlayer(tUser[0]);
                yesindb = await CheckPlayerExists(tUser[0])
            }
            let isGamePlayer = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(tUser[0].id)
            if(isGamePlayer == -1) {
                io.emit('twitchgameusers', yesindb[0])
                tGamePlayer.push(yesindb[0])
            }else{
                io.emit('twitchgameusers', tGamePlayer[isGamePlayer])
            }
        }
        if(mStream[0]!=null){
            if(mStream[0].type=='live'){                
                if (mStream[0].viewer_count != viewer_count){
                    let deb = new MKUtils;
                    TwitchUsers = {
                        stream: mStream[0].viewer_count,
                        chat: chatters.length,
                        chatArray: chatters
                    }
                    let stringusers = ''
                    for (let index = 0; index < TwitchUsers.chatArray.length; index++) {
                        const element = TwitchUsers.chatArray[index];
                        stringusers += `${element.user_name} `;
                    }                    
                    console.log(colors.gray('[Users]'), `${stringusers}` )
                    console.log(colors.gray('[Users]'), `Stream: ${TwitchUsers.stream} Chat: ${TwitchUsers.chat} `)
                    //
                }
                if (mAds.preroll_free_time<=900){
                    let ac = await _mk.RunAds(mKiwi)   
                    if (ac[0] == 'Ads'){
                        _db.StoreAdData([mAds, ac])
                        io.emit('Ads', ac[2][0].length)
                        let adsStr = `Ads are Playing! Kiwisbot Runs between 1-2 minutes worth of ads every 20 mins to scare away Prerolls! I dont trigger them just to annoy you!!  miketh101Heart Thanks for your Patience!  miketh101Heart`
                        _mk.SayInChat(adsStr)
                        let nextRuntime = Date.now()+(ac[2][0].retry_after*1000) //date.now+480000 == future tiume
                        let adtimer = (ac[2][0].length*1000) //90000
                        let dd = new Date(nextRuntime)
                        console.log(colors.gray('[Ads]'),`Running Ads`, ac[2][0].length, `Safe Ad Reload: ${dd}`)
                        // begin gameplay
                        io.emit('showfield', {show:true});
                        let notifyadend = setTimeout(async () => {
                            let adsStr = `Ads should be over. (${ac[2][0].length}seconds). Welcome Back!`;
                            await _mk.SayInChat(adsStr);
                            await _mk.ResetGamePlayers();
                            io.emit('showfield', {show:false})
                        }, adtimer);
                        //
                    }
                    if (ac[0] == 'NextRun'){
                        if (ac[2] < 5){
                            console.log(colors.cyan('[Ad Incoming]'), ac)
                        }              
                    }
                }
                else{
                    if (mAds.preroll_free_time <= 1080){
                        console.log(colors.cyan('[Ad Incoming]'), (mAds.preroll_free_time-900))
                    }
                    let prtimeclean = Math.floor((mAds.preroll_free_time/60))
                    let unixtsdate = mAds.next_ad_at*1000;
                    let nextad = new Date(unixtsdate);
                    let nextaddiff = (((unixtsdate - Date.now())/1000)/60)
                    let ndr = Math.round(nextaddiff)
                    console.log(colors.gray('[Ads]'),`PreRoll Clear Time: ${prtimeclean} Mins || MidRoll Clear Time: ${ndr} Mins (${nextad})`)
                    let adObj = [unixtsdate,nextaddiff]
                    io.emit('AdObj', adObj)
                }
            }
        }
    }, 60000);
    //
    eventSub.on('session_silenced', () => {
        let msg = 'Session mystery died due to silence detected';
        console.log(msg)
    });
    eventSub.on('channel.update', function({ payload }){
        // console.log('channel.update',payload)
        _mk.SayInChat(`Updated: Category[ ${payload.event.category_name} ] Title[ ${payload.event.title} ]`)
    });
    eventSub.on('stream.online', function({ payload }){
        console.log('stream.online',payload)
    });
    eventSub.on('stream.offline', function({ payload }){
        console.log('stream.offline',payload)
    });
    eventSub.on('user.update', function({ payload }){
        console.log('user.update',payload)
    });
    eventSub.on('channel.follow', function({ payload }){
        console.log('channel.follow', payload.event.user_name)
        _mk.SayInChat(`Thanks for the Follow: ${payload.event.user_name}! miketh101Heart Please do not chew on the furniture.  miketh101Heart`)
    });
    eventSub.on('channel.raid', function({ payload }){
        console.log('channel.raid',payload.event.from_broadcaster_user_name, payload.event.viewers)
        let shoutthresh = Number(payload.event.viewers)
        if (shoutthresh>5) {
            _mk.ShoutoutUser(payload.event.from_broadcaster_user_id)
            _mk.SayInChat(`Thanks for the Raid: ${payload.event.from_broadcaster_user_name}! miketh101Heart What did your <${payload.event.viewers}> Viewers do to deserve this?!`)
        }
        else {
            _mk.SayInChat(`Thanks for the Raid: ${payload.event.from_broadcaster_user_name}! miketh101Heart What did your <${payload.event.viewers}> Viewers do to deserve this?!`)
        }        
    });
    eventSub.on('channel.chat.notification', function({ payload }){
        console.log('channel.chat.notification',payload)
        console.log(colors.cyan("[Notification]"), `${payload.event.notice_type} || ${payload.event.system_message} ||`)
    });
    eventSub.on('channel.bits.use', function({ payload }){
        console.log('channel.bits.use',payload)
    });
    eventSub.on('channel.chat.message', function({ payload }){
        // console.log("chatmessage", payload)
        let currentDT = new Date();
        if (payload.event.reply != null){
            console.log(currentDT, colors.blue("[Chat]"), colors.yellow(`reply to <${payload.event.reply.parent_user_name}>`))
        }
        console.log(currentDT, colors.blue("[Chat]"), colors.yellow(`<${payload.event.chatter_user_name}>`), payload.event.message.text)
    });    
    eventSub.on('channel.channel_points_custom_reward_redemption.add', async function({ payload }){
        let reward = payload.event.reward
        let redeemer = {
            display_name: payload.event.user_name,
            login: payload.event.user_login,
            id: payload.event.user_id,
            user_input: payload.event.user_input
        }
        console.log(colors.green('[Points]'), `<${reward.title}> Cost:(${reward.cost})`, redeemer.display_name)
        if (redeemer.user_input != ''){
            console.log(colors.green('[Input]'), `${redeemer.display_name} || ${redeemer.user_input}`)
        }
        let tUser = await _mk.fetchUserByName(redeemer.login)
        let rewardData = {redeemer: redeemer, reward: reward, user: tUser}
        switch(reward.title){
            case 'kiwisdebugbutton':
                if (redeemer.login == 'mikethemadkiwi'){                    
                    // let isin = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id) 
                    // io.emit('Notification', {str:'Travelling to Mines', gPlayer:tGamePlayer[isin]});
                    io.emit('showfield', {show:true})
                    setTimeout(async () => {
                        let deb = new MKUtils;
                        await deb.ResetGamePlayers();
                        await deb.BeginBossBattle();
                        io.emit('showfield', {show:false})
                    }, 90000);
                }
            break;            
            case 'Travel-Home':
                // let mkhome = new MKUtils;
                // let thUser = await mkhome.fetchUserById(redeemer.id)
                // let isinh = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
                // if(isinh == -1) {
                //     //refund points and tell them no.
                // }else{
                //     tGamePlayer[isinh].bubble = 0;
                //     tGamePlayer[isinh].tarposx = 150;
                //     tGamePlayer[isinh].tarposy = 150;
                //     // save player to db
                //     let homedb = new DBObject;
                //     let saveplayer = homedb.StorePlayerData(tGamePlayer[isinh])
                //     // console.log('Saved Player', tGamePlayer[isinh])
                //     io.emit('newplayertarget', tGamePlayer[isinh]);
                // }
            break;            
            case 'Travel-Mines':
                let mkmines = new MKUtils;
                let tUser = await mkmines.fetchUserById(redeemer.id)
                let yesindb = await CheckPlayerExists(tUser[0])
                if (yesindb[0] == null){
                    let newPlayer = await AddGamePlayer(tUser[0]);
                    yesindb = await CheckPlayerExists(tUser[0])
                }
                let isin = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
                if(isin == -1) {                    
                    yesindb[0].bubble = 1;
                    yesindb[0].tarposx = 850;
                    yesindb[0].tarposy = 250;
                    tGamePlayer.push(yesindb[0])
                }else{
                    tGamePlayer[isin].bubble = 1;
                    tGamePlayer[isin].tarposx = 850;
                    tGamePlayer[isin].tarposy = 250;
                }
                // save player to db
                let minesdb = new DBObject;
                let saveplayer = minesdb.StorePlayerData(tGamePlayer[isin])
                io.emit('Notification', {str:'Travelling to Mines', gPlayer:tGamePlayer[isin]});
                // console.log('Saved Player', tGamePlayer[isin])
                io.emit('newplayertarget', tGamePlayer[isin]);
            break;
            case 'Travel-Training':
                let mktt = new MKUtils;
                let ttuser = await mktt.fetchUserById(redeemer.id)     
                let yesindbtt = await CheckPlayerExists(ttuser[0])
                if (yesindbtt[0] == null){
                    let newPlayer = await AddGamePlayer(ttuser[0]);
                    yesindbtt = await CheckPlayerExists(ttuser[0])
                }
                let isintt = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
                if(isintt == -1) {                    
                    yesindbtt[0].bubble = 2;
                    yesindbtt[0].tarposx = 550;
                    yesindbtt[0].tarposy = 400;
                    tGamePlayer.push(yesindbtt[0])
                }else{
                    tGamePlayer[isintt].bubble = 2;
                    tGamePlayer[isintt].tarposx = 550;
                    tGamePlayer[isintt].tarposy = 400;
                }
                let ttdb = new DBObject;
                let saveplayertt = ttdb.StorePlayerData(tGamePlayer[isintt])
                io.emit('Notification', {str:'Travelling to Training', gPlayer:tGamePlayer[isintt]});
                io.emit('newplayertarget', tGamePlayer[isintt]);
            break;
            case 'Travel-Fort':
                let mktf = new MKUtils;
                let tfuser = await mktf.fetchUserById(redeemer.id)          
                let yesindbtf = await CheckPlayerExists(tfuser[0])
                if (yesindbtf[0] == null){
                    let newPlayer = await AddGamePlayer(tfuser[0]);
                    yesindbtf = await CheckPlayerExists(tfuser[0])
                }
                let isintf = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
                if(isintf == -1) {                    
                    yesindbtf[0].bubble = 3;
                    yesindbtf[0].tarposx = 1024;
                    yesindbtf[0].tarposy = 600;
                    tGamePlayer.push(yesindbtf[0])
                }else{
                    tGamePlayer[isintf].bubble = 3;
                    tGamePlayer[isintf].tarposx = 1024;
                    tGamePlayer[isintf].tarposy = 600;
                }
                // save player to db
                let tfdb = new DBObject;
                let saveplayerfort = tfdb.StorePlayerData(tGamePlayer[isintf])
                io.emit('Notification', {str:'Travelling to Fort', gPlayer:tGamePlayer[isintf]});
                io.emit('newplayertarget', tGamePlayer[isintf]);
                
            break;
            case 'PlayerInfo':
                let mkplayerinfo = new MKUtils;
                let piuser = await mkplayerinfo.fetchUserById(redeemer.id)         
                let yesindbpi = await CheckPlayerExists(piuser[0])
                if (yesindbpi[0] == null){
                    let newPlayer = await AddGamePlayer(piuser[0]);
                    yesindbpi = await CheckPlayerExists(piuser[0])
                }
                let isinpi = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)                
                if(isinpi == -1) {
                    tGamePlayer.push(yesindbpi)
                    io.emit('twitchgameusers', yesindbpi)
                    let pcurr = yesindbpi.currency.toFixed(2)
                    let pxp = yesindbpi.xp.toFixed(2)
                    mkplayerinfo.SayInChat(`Stats for ${redeemer.display_name}: [Att:${yesindbpi.attack} Agi:${yesindbpi.agility} Def:${yesindbpi.defense}] Wearing: ${yesindbpi.armour} Weilding: ${yesindbpi.weapon} Currency:${pcurr}  XP:${pxp} miketh101Heart`)                 
                }else{
                    let pcurr = tGamePlayer[isinpi].currency.toFixed(2)
                    let pxp = tGamePlayer[isinpi].xp.toFixed(2)
                    mkplayerinfo.SayInChat(`Stats for ${redeemer.display_name}: [Att:${tGamePlayer[isinpi].attack} Agi:${tGamePlayer[isinpi].agility} Def:${tGamePlayer[isinpi].defense}] Wearing: ${tGamePlayer[isinpi].armour} Weilding: ${tGamePlayer[isinpi].weapon} Currency:${pcurr}  XP:${pxp}  miketh101Heart`) 
                }
            break;
            case 'TwitchAge':
                let _mk = new MKUtils;
                let apiuser = await _mk.fetchUserByName(redeemer.display_name)
                _mk.SayInChat(`Account Creation Date for ${apiuser[0].display_name}: ${apiuser[0].created_at}`)
            break;
            case 'LurkMode':
                let _mkl = new MKUtils;
                let apiuserl = await _mkl.fetchUserByName(redeemer.display_name)
                _mkl.SayInChat(`Lurk Mode Activated for ${apiuserl[0].display_name}. Enjoy your Lurk!  miketh101Heart`)
            break;
            case 'FollowAge':
                let _mk2 = new MKUtils;
                let apiuser2 = await _mk2.isUserFollower(redeemer.id)
                if (apiuser2[0]!=null) {                                                
                    _mk2.SayInChat(`Account Follow Date for ${apiuser2[0].user_name}: ${apiuser2[0].followed_at}`)
                }
            break;
            case 'ProveSub':
                let _mk3 = new MKUtils;
                let apiuser3 = await _mk3.isUserSubscribed(redeemer.id)
                if (apiuser3[0]!=null) { 
                    let tier = (apiuser3[0].tier/1000)
                    if (apiuser3[0].is_gift==true) {
                        _mk3.SayInChat(`${redeemer.display_name} = Gifted Tier: ${tier}! Thanks miketh101Heart`)
                    }
                    else {
                        _mk3.SayInChat(`${redeemer.display_name} = Tier: ${tier}. Thanks!! miketh101Heart`)
                    }                                     
                }
                else {
                    _mk3.SayInChat(`Scrublord! WTF ${redeemer.display_name}!! Someone get this person a Sub!!!`)
                }
            break;
            case 'LookMa':
                let _mk4 = new MKUtils;
                io.emit('LookMa', rewardData)  
                _mk4.SayInChat(`Look @${redeemer.display_name} I'm a Dragon!!`)  
            break;
            case 'Teamspeak':
                let _mk5 = new MKUtils;
                _mk5.SayInChat(`Teamspeak Deets: ts3://mad.kiwi:9987`)  
            break;
            case 'EffYou':
                io.emit('effyou', rewardData)
            break;
            case 'TotalCunt':
                io.emit('totalcunt', rewardData)
            break;
            case 'DumbAnswer':
                io.emit('dumbanswer', rewardData)
            break;
            case 'RoleplayCity':                
                let _mk75 = new MKUtils;
                _mk75.SayInChat(`|| mikethemadkiwi is currently playing on "THE CREW RP" You can connect by joining the discord Here: https://discord.gg/thecrewrp ||`)
            break;
            case 'Honk':
                let _mk6 = new MKUtils;
                _mk6.SayInChat(`Honking for @${redeemer.display_name}`)
                let files2 = fs.readdirSync('socket-www/sounds/honk/');
                let rFile2 = Math.floor(Math.random() * files2.length);
                let fileSTR2 = `${files2[rFile2]}`;
                rewardData.soundfile = fileSTR2
                io.emit('Honk', rewardData)
            break;
            case 'BunnySays':                
                let _mk7 = new MKUtils;
                let files = fs.readdirSync('socket-www/sounds/bunny/');
                let rFile = Math.floor(Math.random() * files.length);
                let fileSTR = `${files[rFile]}`;
                io.emit('BunnySays', fileSTR)
                _mk7.SayInChat(`Playing [${fileSTR.substring(0, fileSTR.length-4)}] for @${redeemer.display_name}`)
            break;
            case 'Guildwars2':
                let _mk8 = new MKUtils;
                _mk8.SayInChat(`|| mikethemadkiwi.6058 || plays on || Henge of Denravi - US ||`)
            break;   
            case 'ShoutOut':
                let _mk9 = new MKUtils;
                io.emit('ShoutOut', rewardData)  
                _mk9.SayInChat(`You should all go follow ${redeemer.display_name} @ twitch.tv/${redeemer.display_name} because i fuggin said so. They are amazing. I'm a bot, i'm totally capable of making that observation.`)
                _mk9.ShoutoutUser(redeemer.id)
            break;
            case 'KiwisWeather':
                let weatherurl = `http://api.openweathermap.org/data/2.5/weather?id=${weatherConf.wCityId}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`
                fetchUrl(weatherurl, function(error, meta, body){
                    if(error){console.log('error', error)}
                    let wNetwork = JSON.parse(body);
                    let currentweather;
                    if (wNetwork.Code == 'ServiceUnavailable'){
                        wNetwork.WeatherText = json.Message;
                    }
                    if (wNetwork.weather) {
                            currentweather = `Weather for ${wNetwork.name}, ${wNetwork.sys.country}: `                                                            
                        for (let i=0;i<wNetwork.weather.length;i++){
                            currentweather += `${wNetwork.weather[i].main} (${wNetwork.weather[i].description}) `
                        }
                    }
                    if (wNetwork.main){
                        currentweather += `Temp: ${wNetwork.main.temp}°c (High: ${wNetwork.main.temp_max} °c) Humidity: ${wNetwork.main.humidity}% `
                    }
                    if(wNetwork.wind){
                        currentweather += `Wind: ${wNetwork.wind.speed}m/s (dir: ${Math.floor(wNetwork.wind.deg)}°) `
                    }
                    let _mk10 = new MKUtils;
                    _mk10.SayInChat(currentweather)
                })
            break;
            default:
                console.log('UNREGISTERED CHANNEL POINT REDEEM', `${rewardData.title} [${redeemer.display_name}]`, rewardData)                
        }
    });
    eventSub.on('channel.channel_points_automatic_reward_redemption.add', function({ payload }){
        console.log(colors.green('[Points]'), `<${payload.event.reward.type}> Cost:(${payload.event.reward.channel_points})`, payload.event.user_name)
        switch(payload.event.reward.type){
            case 'send_highlighted_message':
                console.log(colors.green('Highlighted Text'), payload.event.message.text)
            break;
            default:
        }
    });
    //
}, 500);

// Database and OBS Socket. DO NOT FUGG WITH.
io.on('connection', (socket) => {
  socket.name = socket.id;
  console.log('SOCKETIO',`${socket.name} connected.`); 
  sockets[socket.id] = socket;
  socket.on("playerlist", async (arg, callback) => {
    let chatters = await _mk.getChatters()
    for (let index = 0; index < chatters.length; index++) {
        const element = chatters[index];
        let tUser = await _mk.fetchUserById(element.user_id)
        let yesindb = await CheckPlayerExists(tUser[0])
        if (yesindb[0] == null){
            let newPlayer = await AddGamePlayer(tUser[0]);
            yesindb = await CheckPlayerExists(tUser[0])
        }
        let isGamePlayer = tGamePlayer.map(function(obj) { return obj.twitchid; }).indexOf(tUser[0].id)
        if(isGamePlayer == -1) {
            io.emit('twitchgameusers', yesindb[0])
            tGamePlayer.push(yesindb[0])
        }else{
            io.emit('twitchgameusers', tGamePlayer[isGamePlayer])
        }
    }
    console.log(`[Game] Playerlist Requested by Socket`); // "world"
    callback("Sent Player List");
  });
//   socket.on('playerlist', async function () {
//     let chatters = await _mk.getChatters()

//   });
  socket.on('disconnect', function () {
    console.log('SOCKETIO',`${socket.name} disconnected`); 
  });
});