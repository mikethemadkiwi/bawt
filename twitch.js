// let MKAuth = require('./mk_twitchauth.js');
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
const tmi = require('tmi.js');
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
const cookieParser = require('cookie-parser'); //COOOKIES!! NOM
const bodyParser = require('body-parser');
const server = http.createServer(socketapp);
const { Server } = require("socket.io");
const path = require('path')
const colors = require('colors');
const mysql = require('mysql');
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
let mStream;
let mAds;
let lastAds;
const weathertimeout = [];
let DBConn_Server = null;
let DBConn_ads = null;
let tDate = Date.now();
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
            // resolve(currentTokens)
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
}
//
class MKGame {
    checkPlayer = (twitchUser) => {
        return new Promise((resolve, reject) => {
            console.log(twitchUser[0].id)
            let isin = playerBase.map(function(user) { return user.id; }).indexOf(twitchUser[0].id)
            if(isin!=-1){
                io.emit('playerUpdate', playerBase[isin].player)
                resolve(isin)
            }
            else{
                let player = new PlayerObj(twitchUser[0])
                let position = playerBase.push(player)
                io.emit('playerUpdate', player.player)  
                resolve((position-1))              
            }
        })
    }
}
class MKUtils {
        CreateChat = function(TAUTH, TCONF){            
                MKClient['twitchchat'] = new tmi.client({
                        identity: {
                        username: TCONF.username,
                        password: TAUTH.access_token
                        },
                        channels: ['mikethemadkiwi']
                })
                // Listeners
                MKClient['twitchchat'].connect().catch(err => {console.error("Chatbot Connection Error", (err.body ? err.body : err))});
                MKClient['twitchchat'].on('connected', (addr, port)=>{
                        console.log(`${TCONF.username} Connected to ${addr}:${port}`);
                });
                MKClient['twitchchat'].on('join', async (channel, username, self)=>{
                        if(!self){
                            if(channel == '#mikethemadkiwi'){
                                let _mk = new MKUtils;
                                let apiuser = await _mk.fetchUserByName(username)
                                // let temptchan = `#${username}`;
                                // if(ChansToJoin[temptchan]==null){
                                //     ChansToJoin.push(temptchan)
                                //     MKClient['twitchchat'].join(temptchan).then((data) => {
                                //         // data returns [channel]
                                //         // console.log(temptchan, data)
                                //     }).catch((err) => {
                                //         //
                                //     });
                                // }
                                io.emit('userJoin', apiuser)
                                console.log(new Date(Date.now()), colors.green('[JOIN]'), channel, username, apiuser[0].created_at)
                                localJoinCount++;
                            }
                            else{   

                                if(otherJoinShow){ // i should make this a function that stil.lconsole.logs to DB
                                    console.log(new Date(Date.now()), colors.grey('[JOIN]'), channel, username)
                                }
                                otherJoinCount++;
                            }
                           
                        }
                        // console.log('channel to join ',temptchan)
                });
                MKClient['twitchchat'].on('part', async (channel, username, self)=>{           
                        if(!self){
                            if(channel == '#mikethemadkiwi'){
                                console.log(new Date(Date.now()), colors.green('[PART]'), channel, username)
                                localPartCount++;
                            }
                            else{                                
                                if(otherPartShow){
                                    console.log(new Date(Date.now()), colors.grey('[PART]'), channel, username)
                                }
                                otherPartCount++;
                            }
                        }
                });        
                MKClient['twitchchat'].on('clearchat', (channel, username)=>{
                        // console.log('Chat Cleared:', channel, username)
                });
                MKClient['twitchchat'].on('clearmsg', (chan, msg, msgid)=>{
                        // console.log(`msg [${msgid}] cleared in:`, chan, msg)
                });
                MKClient['twitchchat'].on('notice', (channel, data)=>{
                        // console.log(`notice ${channel}`, data)
                });
                MKClient['twitchchat'].on('reconnect', ()=>{ console.log('reconnect') })
                MKClient['twitchchat'].on('roomstate', (chan, state)=>{
                    if(chan=='#mikethemadkiwi'){
                        console.log(colors.green('[RoomState]'), chan) 
                    }
                    else{
                        console.log(colors.grey('[RoomState]'), chan) 
                    }
                })
                MKClient['twitchchat'].on('usernotice', (chan, data)=>{ 
                    // console.log('usernotice', chan, data) 
                })
                MKClient['twitchchat'].on('userstate', (chan, data)=>{ 
                    // console.log('userstate') 
                })
                MKClient['twitchchat'].on('message', async (target, context, msg, self)=>{
                    // if (self) { return; } // Ignore messages from the yuse4r if it is self   
                    // console.log('target', target, context)
                    if(target=='#mikethemadkiwi'){
                        localChatCount++;
                                    if(msg.substr(0, 1) == "`"){
                                        let stringsplit = msg.split(" ");
                                        switch (stringsplit[0]) {
                                            case'`weather':
                                                    if(stringsplit[1]){
                                                        let isnum = /^\d+$/.test(stringsplit[1]);
                                                        if (isnum){

                                                            let weatherurl =`http://api.openweathermap.org/data/2.5/weather?id=${stringsplit[1]}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`                                                    
                                                            fetchUrl(weatherurl, function(error, meta, body){
                                                                if(error){console.log('error', error)}
                                                                let wNetwork = JSON.parse(body);
                                                                // console.log(wNetwork)
                                                                if(wNetwork.cod!=404){
                                                                    console.log('city found')
                                                                    let currentweather;
                                                                    if (wNetwork.Code == 'ServiceUnavailable'){
                                                                        wNetwork.WeatherText = json.Message;
                                                                    }
                                                                    if (wNetwork.weather) {
                                                                        currentweather = `Hey @${context.username}, Weather for ${wNetwork.name}, ${wNetwork.sys.country}}: `                                                            
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
                                                                    MKClient['twitchchat'].say('#mikethemadkiwi', currentweather).catch(function(err){
                                                                        console.log(err)
                                                                    });
                                                                    MKClient['twitchchat'].say('#mikethemadkiwi', 'Find your weather code at https://openweathermap.org/city/ and use it  like this || `weather CITYID').catch(function(err){
                                                                        console.log(err)
                                                                    });
                                                                }
                                                                else{
                                                                    MKClient['twitchchat'].say('#mikethemadkiwi', 'That CITYID did not return information please confirm your cityID @ https://openweathermap.org/city/').catch(function(err){
                                                                        console.log(err)
                                                                    });
                                                                }                                                                                      
                                                            })

                                                        }
                                                        else {
                                                            // do name check instead of digit check

                                                            // instead of below.
                                                            MKClient['twitchchat'].say('#mikethemadkiwi', 'That CITYID is NOT a Number. please confirm your cityID @ https://openweathermap.org/city/').catch(function(err){
                                                                console.log(err)
                                                            });

                                                        }
                                                    }
                                                    else{
                                                        
                                                    let weatherurl = `http://api.openweathermap.org/data/2.5/weather?id=${weatherConf.wCityId}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`
                                                        fetchUrl(weatherurl, function(error, meta, body){
                                                            if(error){console.log('error', error)}
                                                            let wNetwork = JSON.parse(body);
                                                            // console.log(wNetwork)
                                                            let currentweather;
                                                            if (wNetwork.Code == 'ServiceUnavailable'){
                                                                wNetwork.WeatherText = json.Message;
                                                            }
                                                            else{
                                                                // console.log(wNetwork)
                                                            };
                                                            if (wNetwork.weather) {
                                                                    currentweather = `Hey @${context.username}, Weather for ${wNetwork.name}, ${wNetwork.sys.country}: `                                                            
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
                                                            MKClient['twitchchat'].say('#mikethemadkiwi', currentweather).catch(function(err){
                                                                console.log(err)
                                                            });
                                                            MKClient['twitchchat'].say('#mikethemadkiwi', 'Find your weather code at https://openweathermap.org/city/ and use it  like this || `weather CITYID').catch(function(err){
                                                                console.log(err)
                                                            });                              
                                                        })
                                                    }
                                            break;
                                            case '`ts3':
                                                MKClient['twitchchat'].say('#mikethemadkiwi', `We Use Teamspeak for voice Chat! Join us by downloading teamspeak at https://www.teamspeak3.com/teamspeak-download.php and use server address: mad.kiwi`).catch(function(err){
                                                    console.log(err)
                                                }); 
                                            break;
                                            default:
                                                // do nothing if the default fires  
                                        }         
                                }
                                else {
                                    console.log(colors.green('[CHAT]'), context.username, msg)
                                }
                    }
                    else{
                        if(otherChatShow){
                            console.log(colors.grey('[CHAT]'), context.username, msg)
                        }
                        otherChatCount++;
                    }
                })
        }
        CreatePubsubTopics = function(user_id){
            let templatetopics = [
                // 'whispers.',
                // 'chat_moderator_actions.',
                // 'channel-bits-events-v1.',
                'channel-bits-events-v2.',
                'channel-bits-badge-unlocks.',
                'channel-points-channel-v1.',
                'channel-subscribe-events-v1.'
            ];
            let listentopics = [];
            templatetopics.forEach(topic => {
                let tstr = `${topic}${user_id}`;
                listentopics.push(tstr)
            });
            return listentopics
        }
        RestartPub = function(topics){                
            let pBot = new PubLib;
            pBot.startPub(topics);                
        }
        ListentoPubsubTopics = function (topics){
            let pck = {}
            pck.type = 'LISTEN';
            pck.nonce = TwitchConf.username + '-' + new Date().getTime();
            pck.data = {};
            pck.data.topics = topics;
            pck.data.auth_token = currentTokens.access_token;
            MKClient['pubsub'].send(JSON.stringify(pck));
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
                    // console.log('fetchuser:', body)
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
                    // console.log('fetchuser:', body)
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
                    // console.log('fetchuser:', body)
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
                        // console.log(bs)
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
                        // console.log(bs)
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
                        console.error('Error body:', err.response.body);
                    });
                }
                else {
                    let diff = (tDate-checkDT)
                    let diffm = Math.floor((diff/1000)/60)
                    resolve(['NextRun', checkDT, diffm])
                }
            })    
        }
        spawnHook(type, version, condition) {
            fetch(
                'https://api.twitch.tv/helix/eventsub/subscriptions',
                {
                    "method": "POST",
                    "headers": {
                        "Client-ID": TwitchConf.client_id,
                        "Authorization": "Bearer " + tmpAuth,
                        'Content-Type': 'application/json'
                    },
                    "body": JSON.stringify({
                        type,
                        version,
                        condition,
                        transport: {
                            method: "websocket",
                            session_id
                        }
                    })
                }
            )
                .then(resp => resp.json())
                .then(resp => {
                    if (resp.error) {
                        console.log(`Error with eventsub Call ${type} Call: ${resp.message ? resp.message : ''}`);
                    } else {
                       console.log(`Created ${type}`);
                    }
                })
                .catch(err => {
                    console.log(err);
                   console.log(`Error with eventsub Call ${type} Call: ${err.message ? err.message : ''}`);
                });
        }
        requestHooks(user_id, my_id) {
            let eventSubTypes = {
                'channel.update': { version: "1", condition: { broadcaster_user_id: user_id } },
                'channel.follow': { version: "2", condition: { broadcaster_user_id: user_id, moderator_user_id: my_id } },
                //inbound raid
                'channel.raid': { version: "1", condition: { to_broadcaster_user_id: user_id } },
        
                'stream.online': { version: "1", condition: { broadcaster_user_id: user_id } },
                'stream.offline': { version: "1", condition: { broadcaster_user_id: user_id } },
        
                'user.update': { version: "1", condition: { user_id: user_id } }
            }
            
        console.log(`Spawn Topics for ${user_id}`);
        
            for (let type in eventSubTypes) {
            console.log(`Attempt create ${type} - ${user_id}`);
                let { version, condition } = eventSubTypes[type];
        
                this.spawnHook(type, version, condition);
            }
        }
}
///////////////////////////////////////
// PingLib
///////////////////////////////////////
let ping = {};
ping.pinger = false;
ping.start = function() {
    if (ping.pinger) {
        clearInterval(ping.pinger);
    }
    ping.sendPing();
    ping.pinger = setInterval(function() {
        setTimeout(function() {
            ping.sendPing();
            //jitter
        }, Math.floor((Math.random() * 1000) + 1));
    }, (4 * 60 * 1000));
}// at least ever 5 minutes
ping.sendPing = function() {
    try {
        MKClient['pubsub'].send(JSON.stringify({
            type: 'PING'
        }));
        ping.awaitPong();
    } catch (e) {
        console.log('pubsub error:',e);
        MKClient['pubsub'].close();
        ping.start();
    }
}
ping.awaitPong = function() {
    ping.pingtimeout = setTimeout(function() {
        console.log('Pubsub Ping','WS Pong Timeout');
        MKClient['pubsub'].close();
        ping.start();
    }, 10000)
}
ping.gotPong = function() {
    clearTimeout(ping.pingtimeout);
}
///////////////////////////////////////
// PUBSUB
///////////////////////////////////////
class PubLib {
        async startPub(Ptopics){
            MKClient['pubsub'] = new ws('wss://pubsub-edge.twitch.tv');
            MKClient['pubsub'].on('close', function() {
                console.log('PUBSUB','disconnected. Restarting Services');
                let _mk = new MKUtils;
                _mk.RestartPub(Ptopics);
            }).on('open', function() {
                ping.start();
                let _mk = new MKUtils;
                _mk.ListentoPubsubTopics(Ptopics);
            });
            MKClient['pubsub'].on('message', async function(raw_data, flags) {
                // fs.appendFileSync(__dirname + '/pubsub_messages.log', raw_data);    
                var data = JSON.parse(raw_data);
                if (data.type == 'RECONNECT') {
                    console.log('PUBSUB','WS Got Reconnect');
                    // restart
                    MKClient['pubsub'].close();
                } else if (data.type == 'PONG') {
                    ping.gotPong();
        
                } else if (data.type == 'RESPONSE') {
                    console.log('PUBSUB','RESPONSE: ' + (data.error ? data.error : 'OK'));
                } else if (data.type == 'MESSAGE') {
                    var msg = JSON.parse(data.data.message);
                    let pTopic = data.data.topic;
                    // send toconsole.logger/socket
                    io.emit('ircd', {pTopic, msg})
                    //
                    switch(pTopic){
                        case 'channel-bits-events-v2.22703261': // BITTIES
                            console.log(colors.green('[BITS]'), msg)
                            MKClient['twitchchat'].say('#mikethemadkiwi', `[${msg.data.user_name}] cheered ${msg.data.bits_used} bitties! Total[${msg.data.total_bits_used}]`)
                        break;
                        case 'channel-bits-badge-unlocks.22703261': // BITS BADGE UNLOCK
                            console.log('Bits Badge Unlock Event', msg)
                        break;
                        case 'channel-points-channel-v1.22703261': // CHANNEL POINTS
                            let _mk = new MKUtils;
                            let redeemer = msg.data.redemption.user;
                            let reward = msg.data.redemption.reward;
                            let tUser = await _mk.fetchUserByName(redeemer.login)
                            let rewardData = {redeemer: redeemer, reward: reward, user: tUser}
                            console.log(colors.green('[POINTS]'), reward.title, redeemer.display_name) 
                            switch(reward.title){
                                case 'kiwisdebugbutton':
                                    let d = {                                        
                                        userinput: msg.data.redemption.user_input,
                                        rewardData: rewardData
                                    }
                                    console.log('debug', d)
                                    io.emit('kiwisdebug', d)                              
                                break;
                                case 'TwitchAge':
                                    let _mk = new MKUtils;
                                    let apiuser = await _mk.fetchUserByName(redeemer.display_name)
                                    // console.log(apiuser[0].created_at)                                                
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Account Creation Date for ${apiuser[0].display_name}: ${apiuser[0].created_at}`).catch(function(err){
                                        console.log(err)
                                    }); 
                                break;
                                case 'FollowAge':
                                    let _mk2 = new MKUtils;
                                    let apiuser2 = await _mk2.isUserFollower(redeemer.id)
                                    // console.log(apiuser2)
                                    if (apiuser2[0]!=null) {                                                
                                        MKClient['twitchchat'].say('#mikethemadkiwi', `Account Follow Date for ${apiuser2[0].user_name}: ${apiuser2[0].followed_at}`).catch(function(err){
                                            console.log(err)
                                        }); 
                                    }
                                break;
                                case 'ProveSub':
                                    let _mk3 = new MKUtils;
                                    let apiuser3 = await _mk3.isUserSubscribed(redeemer.id)
                                    console.log(apiuser3)
                                    // {
                                    //     "broadcaster_id": "141981764",
                                    //     "broadcaster_login": "twitchdev",
                                    //     "broadcaster_name": "TwitchDev",
                                        // "gifter_id": "12826",
                                        // "gifter_login": "twitch",
                                        // "gifter_name": "Twitch",
                                    //     "is_gift": true,
                                    //     "tier": "1000",
                                    //     "plan_name": "Channel Subscription (twitchdev)",
                                        // "user_id": "527115020",
                                        // "user_name": "twitchgaming",
                                        // "user_login": "twitchgaming"
                                    //   }                        
                                    if (apiuser3[0]!=null) { 
                                        let gifter = null
                                        let subbed = {
                                            "user_id": apiuser3[0].user_id,
                                            "user_name": apiuser3[0].user_name,
                                            "user_login": apiuser3[0].user_login
                                        }
                                        let tier = apiuser3[0].tier
                                        if (apiuser3[0].is_gift==true) {
                                            gifter = {
                                                "gifter_id": apiuser3[0].gifter_id,
                                                "gifter_login": apiuser3[0].gifter_login,
                                                "gifter_name": apiuser3[0].gifter_name,
                                            }
                                        }

                                        MKClient['twitchchat'].say('#mikethemadkiwi', `Sub Levelfor : ${subbed.user_name} = ${tier}`).catch(function(err){
                                            console.log(err)
                                        }); 
                                    }
                                    else {
                                        MKClient['twitchchat'].say('#mikethemadkiwi', `Scrublord! ${redeemer.display_name}`).catch(function(err){
                                            console.log(err)
                                        }); 
                                    }
                                break;
                                case 'LookMa':
                                    io.emit('LookMa', rewardData)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Look @${redeemer.display_name} I'm a Dragon!!`)  
                                break;
                                case 'Teamspeak':
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Teamspeak Deets: ts3://mad.kiwi:9987`)  
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
                                case 'Honk':                                
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Honking for @${redeemer.display_name}`)
                                    io.emit('Honk', rewardData)
                                break;
                                case 'BunnySays':                
                                    let fs = require('fs');
                                    let files = fs.readdirSync('public/sounds/host/');
                                    let rFile = Math.floor(Math.random() * files.length);
                                    let fileSTR = `${files[rFile]}`;
                                    io.emit('BunnySays', fileSTR)
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Playing [${fileSTR.substring(0, fileSTR.length-4)}] for @${redeemer.display_name}`)
                                break;
                                case 'Guildwars2':
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `|| mikethemadkiwi.6058 || plays on || Henge of Denravi - US ||`)
                                break;   
                                case 'ShoutOut':
                                    io.emit('ShoutOut', rewardData)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `You should all go follow ${redeemer.display_name} @ twitch.tv/${redeemer.display_name} because i fuggin said so. They are amazing. I'm a bot, i'm totally capable of making that observation.`)
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
                                        // else{console.log(wNetwork)};
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
                                        MKClient['twitchchat'].say('#mikethemadkiwi', currentweather).catch(function(err){
                                            console.log(err)
                                        });
                                        MKClient['twitchchat'].say('#mikethemadkiwi', 'Find your weather code at https://openweathermap.org/city/ and use it  like this || `weather CITYID').catch(function(err){
                                            console.log(err)
                                        });                              
                                    })
                                break;
                                default:
                                    console.log('UNREGISTERED CHANNEL POINT REDEEM', `${reward.title} [${redeemer.display_name}]`, reward)                
                            }
                        break;
                        case 'channel-subscribe-events-v1.22703261': // CHANNEL SUB
                            console.log(colors.green('[SUBSCRIPTION]'), msg)
                            switch(msg.context){
                                case'sub':
                                    console.log('sub', msg)
                                    let sUser = msg.display_name;
                                    let sPlan = msg.sub_plan;
                                    if(sPlan!='Prime'){
                                        sPlan = (sPlan/1000)
                                    }
                                    let sCumMonths = msg.cumulative_months;
                                    let subscriberStr = `[${sUser}] has subbed for [${sCumMonths}] months! Thanks [${sUser}] for the tier [${sPlan}] Subscription!`
                                    MKClient['twitchchat'].say('#mikethemadkiwi', subscriberStr).catch(function(err){
                                        console.log(err)
                                    });                        
                                break;
                                case'resub':
                                    console.log('resub', msg)
                                    let sUser2 = msg.display_name;
                                    let sPlan2 = msg.sub_plan;
                                    if(sPlan2!='Prime'){
                                        sPlan2 = (sPlan2/1000)
                                    }
                                    let sCumMonths2 = msg.cumulative_months;
                                    let subscriberStr2 = `[${sUser2}] has subbed for [${sCumMonths2}] months! Thanks [${sUser2}] for the tier [${sPlan2}] Subscription!`
                                    MKClient['twitchchat'].say('#mikethemadkiwi', subscriberStr2).catch(function(err){
                                        console.log(err)
                                    });                        
                                break;
                                case'subgift':
                                    console.log('gift sub', msg)
                                    let sUser3 = msg.display_name;
                                    let sPlan3 = msg.sub_plan;
                                    if(sPlan3!='Prime'){
                                        sPlan3 = (sPlan3/1000)
                                    }
                                    let sRecipName3 = msg.recipient_display_name;
                                    let subscriberStr3 = `[${sUser3}] has given [${sRecipName3}] a Gift Sub! Thanks [${sUser3}] for the tier [${sPlan3}] Subscription!`
                                    MKClient['twitchchat'].say('#mikethemadkiwi', subscriberStr3).catch(function(err){
                                        console.log(err)
                                    });                        
                                break;
                                case'anonsubgift':
                                    console.log('anon gift sub', msg)
                                    let sPlan4 = msg.sub_plan;
                                    if(sPlan4!='Prime'){
                                        sPlan4 = (sPlan4/1000)
                                    }
                                    let sRecipName4 = msg.recipient_display_name;
                                    let subscriberStr4 = `[ANONYMOUS] has given [${sRecipName4}] a Gift Sub! Thanks [ANONYMOUS] for the tier [${sPlan4}] Subscription!`
                                    MKClient['twitchchat'].say('#mikethemadkiwi', subscriberStr4).catch(function(err){
                                        console.log(err)
                                    });                        
                                break;
                                default:
                                    console.log(`unhandled msg.context pubsub`, msg.context, msg);
                            }
                        break;
                        default:
                            // console.log('unhandled topic', pTopic, msg)
                    }
                } else {
                    console.log('bottomofpubsubmsgneverfired', data);
                }
            });
        }
}
// class EventSocket {
//     counter = 0;
//     closeCodes = {
//         4000: "Internal Server Error",
//         4001: "Client sent inbound traffic",
//         4002: "Client failed ping-pong",
//         4003: "Connection unused",
//         4004: "Reconnect grace time expired",
//         4005: "Network Timeout",
//         4006: "Network error",
//         4007: "Invalid Reconnect",
//     };

//     constructor({
//         url = "wss://eventsub.wss.twitch.tv/ws",
//         connect = false,
//         silenceReconnect = true,
//         disableAutoReconnect = false,
//     }) {
//         // super();

//         this.silenceReconnect = silenceReconnect;
//         this.disableAutoReconnect = disableAutoReconnect;
//         this.mainUrl = url;

//         if (connect) {
//             this.connect();
//         }
//     }

//     mainUrl = "wss://eventsub.wss.twitch.tv/ws";
//     //mainUrl = "ws://127.0.0.1:8080/ws";
//     backoff = 0;
//     backoffStack = 100;

//     connect(url, is_reconnect) {
//         this.eventsub = {};
//         this.counter++;

//         url = url ? url : this.mainUrl;
//         is_reconnect = is_reconnect ? is_reconnect : false;

//         console.debug(`Connecting to ${url}`);
//         // this overrites and kills the old reference
//         this.eventsub = new WebSocket(url);
//         this.eventsub.counter = this.counter;

//         this.eventsub.addEventListener("open", () => {
//             this.backoff = 0;
//             console.debug(`Opened Connection to Twitch`);
//         });

//         // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event
//         // https://github.com/Luka967/websocket-close-codes
//         this.eventsub.addEventListener("close", (close) => {
//             // forward the close event
//             this.emit("close", close);

//             console.debug(
//                 `${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Connection Closed: ${close.code} Reason - ${this.closeCodes[close.code]}`,
//             );

//             // 4000 well damn
//             // 4001 we should never get...
//             // 4002 make a new socket
//             if (close.code == 4003) {
//                 console.debug(
//                     "Did not subscribe to anything, the client should decide to reconnect (when it is ready)",
//                 );
//                 return;
//             }
//             if (close.code == 4004) {
//                 // this is the old connection dying
//                 // we should of made a new connection to the new socket
//                 console.debug("Old Connection is 4004-ing");
//                 return;
//             }
//             // 4005 make a new socket
//             // 4006 make a new socket
//             // 4007 make a new socket as we screwed up the reconnect?

//             // anything else we should auto reconnect
//             // but only if the user wants
//             if (this.disableAutoReconnect) {
//                 return;
//             }

//             //console.debug(`for ${this.eventsub.counter} making new`);
//             this.backoff++;
//             console.debug("retry in", this.backoff * this.backoffStack);
//             setTimeout(() => {
//                 this.connect();
//             }, this.backoff * this.backoffStack);
//         });
//         // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/error_event
//         this.eventsub.addEventListener("error", (err) => {
//             //console.debug(err);
//             console.debug(
//                 `${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Connection Error`,
//             );
//         });
//         // https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/message_event
//         this.eventsub.addEventListener("message", (message) => {
//             //console.debug('Message');
//             //console.debug(this.eventsub.counter, message);
//             let { data } = message;
//             data = JSON.parse(data);

//             let { metadata, payload } = data;
//             let { message_id, message_type, message_timestamp } = metadata;
//             //console.debug(`Recv ${message_id} - ${message_type}`);

//             switch (message_type) {
//                 case "session_welcome":
//                     let { session } = payload;
//                     let { id, keepalive_timeout_seconds } = session;

//                     console.debug(`${this.eventsub.counter} This is Socket ID ${id}`);
//                     this.eventsub.twitch_websocket_id = id;

//                     console.debug(
//                         `${this.eventsub.counter} This socket declared silence as ${keepalive_timeout_seconds} seconds`,
//                     );

//                     // is this a reconnect?
//                     if (is_reconnect) {
//                         // we carried subscriptions over
//                         this.emit("reconnected", id);
//                     } else {
//                         // now you would spawn your topics
//                         this.emit("connected", id);
//                     }

//                     this.silence(keepalive_timeout_seconds);

//                     break;
//                 case "session_keepalive":
//                     //console.debug(`Recv KeepAlive - ${message_type}`);
//                     this.emit("session_keepalive");
//                     this.silence();
//                     break;

//                 case "notification":
//                     //console.debug('notification', metadata, payload);
//                     let { subscription } = payload;
//                     let { type } = subscription;

//                     // chat.message is NOISY
//                     if (type != "channel.chat.message") {
//                         console.debug(
//                             `${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Recv notification ${type}`,
//                         );
//                     }

//                     this.emit("notification", { metadata, payload });
//                     this.emit(type, { metadata, payload });
//                     this.silence();

//                     break;

//                 case "session_reconnect":
//                     this.eventsub.is_reconnecting = true;

//                     let { reconnect_url } = payload.session;

//                     console.debug(
//                         `${this.eventsub.twitch_websocket_id}/${this.eventsub.counter} Reconnect request ${reconnect_url}`,
//                     );

//                     this.emit("session_reconnect", reconnect_url);
//                     // stash old socket?
//                     //this.eventsub_dying = this.eventsub;
//                     //this.eventsub_dying.dying = true;
//                     // make new socket
//                     this.connect(reconnect_url, true);

//                     break;
//                 case "websocket_disconnect":
//                     console.debug(`${this.eventsub.counter} Recv Disconnect`);
//                     console.debug("websocket_disconnect", payload);

//                     break;

//                 case "revocation":
//                     console.debug(`${this.eventsub.counter} Recv Topic Revocation`);
//                     console.debug("revocation", payload);
//                     this.emit("revocation", { metadata, payload });
//                     break;

//                 default:
//                     console.debug(`${this.eventsub.counter} unexpected`, metadata, payload);
//                     break;
//             }
//         });
//     }

//     trigger() {
//         // this function lets you test the disconnect on send method
//         this.eventsub.send("cat");
//     }
//     close() {
//         this.eventsub.close();
//     }

//     silenceHandler = false;
//     silenceTime = 10; // default per docs is 10 so set that as a good default
//     silence(keepalive_timeout_seconds) {
//         if (keepalive_timeout_seconds) {
//             this.silenceTime = keepalive_timeout_seconds;
//             this.silenceTime++; // add a little window as it's too anal
//         }
//         clearTimeout(this.silenceHandler);
//         this.silenceHandler = setTimeout(() => {
//             this.emit("session_silenced"); // -> self reconnecting
//             if (this.silenceReconnect) {
//                 this.close(); // close it and let it self loop
//             }
//         }, this.silenceTime * 1000);
//     }
// }
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
    _mk.CreateChat(auth[1], kiwibotConf)
    //
    mKiwi = await _mk.fetchUserByName(TwitchConf.username)
    mStream = await _mk.fetchStreamById(TwitchConf.username)
    let topics = _mk.CreatePubsubTopics(mKiwi[0].id)    
    mAds = await _mk.fetchAdsSchedule(mKiwi[0].id)
    _mk.RestartPub(topics, mKiwi[0].id)
    //
    // sockets["eventsub"] = new EventSocket(true);
    // sockets["eventsub"].on('connected', (id) => {
    //    console.log(`Connected to WebSocket with ${id}`);
    //     session_id = id;
    //     my_user_id = mKiwi[0].id;

    //     _mk.requestHooks(mKiwi[0].id, my_user_id);
    // });

    // sockets["eventsub"].on('session_keepalive', () => {
    //     console.log('ES Keepalive')
    // });
    //
    keyupdate = setInterval(async () => {
        let auth = await _db.FetchAuth();
        mKiwi = await _mk.fetchUserByName(TwitchConf.username)
        mStream = await _mk.fetchStreamById(TwitchConf.username)
        mAds = await _mk.fetchAdsSchedule(mKiwi[0].id)

        if(mStream[0]!=null){
            if(mStream[0].type=='live'){
                if (mAds.preroll_free_time<=600){
                    let ac = await _mk.RunAds(mKiwi)   
                    if (ac[0] == 'Ads'){ 
                        console.log(`Viewercount: ${mStream[0].viewer_count}`, ac)            
                        _db.StoreAdData([mAds, ac])
                        io.emit('Ads', 120)
                        let adsStr = `Ads are Playing! Kiwisbot Runs between 1-2 minutes worth of ads every 20 mins to scare away Prerolls! I dont trigger them just to annoy you!! Thanks for your Patience!`
                        MKClient['twitchchat'].say('#mikethemadkiwi', adsStr).catch(function(err){
                            console.log(err)
                        });
                        let nextRuntime = Date.now()+(ac[2][0].retry_after*1000) //date.now+480000 == future tiume
                        let adtimer = (ac[2][0].length*1000) //90000
                        let dd = new Date(nextRuntime)
                        console.log(`Viewercount: ${mStream[0].viewer_count}`, `Running Ads`, ac[2][0].length, `Safe Ad Reload: ${dd}`)
                        let notifyadend = setTimeout(() => {
                            let adsStr = `Ads should be over. (${ac[2][0].length}seconds). Welcome Back!`
                            MKClient['twitchchat'].say('#mikethemadkiwi', adsStr).catch(function(err){
                                console.log(err)
                            });
                        }, adtimer);
                    }
                    if (ac[0] == 'NextRun'){
                        if (ac[2] < 5){
                            console.log(`Viewercount: ${mStream[0].viewer_count}`, ac)
                        }              
                    }
                }
                else{
                    let prtimeclean = Math.floor((mAds.preroll_free_time/60))
                    console.log(`Viewercount: ${mStream[0].viewer_count} PreRoll Clear Time: ${prtimeclean}`)
                }
            }
        }
    }, 60000);
    //
}, 500); 

io.on('connection', (socket) => {
  socket.name = socket.id;
  console.log('SOCKETIO',`${socket.name} connected from : ${socket.handshake.address}`); 
  sockets[socket.id] = socket;
  socket.on('disconnect', function () {
    console.log('SOCKETIO',`${socket.name} disconnected`); 
  });
});