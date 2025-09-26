//
let weatherConf = require('../configs/weather.json');
//
const { EventEmitter } = require("events");
const mysql = require('mysql');
const colors = require('colors');
const got = require('got');
const fetchUrl = require("fetch").fetchUrl
//
class kiwitwitchbot extends EventEmitter {
    constructor() {
        super();
        this.DBConn_Server = null
        this.DBConn_ads = null
        this.currentTokens = null
        this.currentAuth = null
        this.botTokens = null
        this.botAuth = null
        this.mkOwner = null
        this.mkBot = null
        this.mkStream = null
        this.AdDate = null
        this.lastAds = null
        this.initData = (DBAUTH) => {
            return new Promise((resolve, reject)=>{
                if(this.DBConn_Server!=null){                
                    this.DBConn_Server.end();
                    this.DBConn_Server = null;
                }
                this.DBConn_Server = new mysql.createConnection(DBAUTH);
                this.DBConn_Server.connect(function(err) {
                    if (err) throw err;    
                });
                let qStr = `SELECT * from twitch`
                this.DBConn_Server.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };
                    this.currentTokens = JSON.parse(results[0].Auth);
                    this.currentAuth = JSON.parse(results[0].Oauth_owner);
                    this.botTokens = JSON.parse(results[0].BotAuth);
                    this.botAuth = JSON.parse(results[0].Oauth_bot);
                    let streetCreds = {
                        tokens: this.currentTokens,
                        auth: this.currentAuth,
                        bottokens: this.botTokens,
                        botauth: this.botAuth
                    }
                    resolve(streetCreds)
                });
                this.DBConn_Server.on('error', function(err) {
                    console.log('DB CONNECTION ERROR', err.code); // 'ER_BAD_DB_ERROR'
                    this.DBConn_Server.end();
                    let reconn = setTimeout(() => {
                        this.DBConn_Server.connect();
                    }, 2500);              
                });
            })
        }
        this.StoreAdData = (dbdeets, addata) => {
            return new Promise((resolve, reject)=>{            
                if(this.DBConn_ads!=null){                
                    this.DBConn_ads.end();
                    this.DBConn_ads = null;
                }
                this.DBConn_ads = new mysql.createConnection(dbdeets);
                this.DBConn_ads.connect(function(err) {
                    if (err) throw err;    
                });            
                this.DBConn_ads.on('error', function(err) {
                    console.log('DB ads connect ERROR', err.code); // 'ER_BAD_DB_ERROR'
                    this.DBConn_ads.end();
                    let reconn = setTimeout(() => {
                        this.DBConn_ads.connect();
                    }, 5000);              
                });            
                let prepadData = JSON.stringify(addata)
                let qStr = `UPDATE twitch SET Ads='${prepadData}' WHERE id='1'`;
                this.DBConn_ads.query(qStr, function (error, results, fields) {
                    if (error) {
                        reject(error)
                        return;
                    };               
                    console.log(`[Storing Ad Data]`, results.message)
                    resolve(results)
                });
            })
        }
        this.InitTwitchStream = (ownerId, ownerToken, twitchid) => {
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?user_login=${twitchid}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                        let bs = JSON.parse(body);
                        resolve(bs.data[0])
                })
            })
        }
        this.fetchUserByName = (ownerId, ownerToken, twitchusername) => {
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?login=${twitchusername}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                        let bs = JSON.parse(body);
                        resolve(bs.data[0])
                })
            })
        }
        this.fetchUserById = (ownerId, ownerToken, uId) => {
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?id=${uId}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                        let bs = JSON.parse(body);
                        resolve(bs.data[0])
                })
            })
        }
        this.fetchStreamById = (ownerId, ownerToken, uId) => {
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?user_login=${uId}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                        let bs = JSON.parse(body);
                        resolve(bs.data[0])
                })
            })
        }        
        this.fetchAdsSchedule = (ownerId, ownerToken, uId) => {            
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/channels/ads?broadcaster_id=${uId}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                    let bs = JSON.parse(body);
                    resolve(bs.data[0])
                })
            })
        }        
        this.RunAds = (ownerId, ownerToken, uId)=>{
            return new Promise((resolve, reject) => {
                let checkDT = Date.now()
                if (checkDT >= this.AdDate){
                    this.AdDate = (Date.now()+1200000)
                    got({
                        "url": "https://api.twitch.tv/helix/channels/commercial",
                        "method": 'POST',
                        "headers": {                            
                            "Client-ID": ownerId,
                            "Authorization": "Bearer " + ownerToken
                        },
                        "form": {
                            "broadcaster_id": uId,
                            "length": 90
                        },
                        "responseType": 'json'
                    })
                    .then(resp => {
                        this.lastAds = resp.body.data
                        resolve(['Ads', checkDT, resp.body.data])                    
                    })
                    .catch(err => {
                        console.error('Error body:', err);
                    });
                }
                else {
                    let diff = (this.AdDate-checkDT)
                    let diffm = Math.floor((diff/1000)/60)
                    resolve(['NextRun', checkDT, diffm])
                }
            })    
        }
        this.SayInChat = function(botId, botToken, ownerTwitchId, botTwitchid, chatMessage){
            return new Promise((resolve, reject) => {
                got({
                    "url": "https://api.twitch.tv/helix/chat/messages",
                    "method": 'POST',
                    "headers": {                            
                        "Client-ID": botId,
                        "Authorization": "Bearer " + botToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "broadcaster_id": ownerTwitchId,
                        "sender_id": botTwitchid,
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
        this.SubscribeToTopic = (session_id, type, version, condition, ownerId, ownerToken)=>{
            return new Promise((resolve, reject) => {
                got({
                    "url": "https://api.twitch.tv/helix/eventsub/subscriptions",
                    "method": 'POST',
                    "headers": {                            
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken,
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
        this.ShoutoutUser = (ownerId, ownerToken, uId, targetID)=>{
            return new Promise((resolve, reject) => {
                got({
                    "url": "https://api.twitch.tv/helix/chat/shoutouts",
                    "method": 'POST',
                    "headers": {                            
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from_broadcaster_id: uId,
                        to_broadcaster_id: targetID,
                        moderator_id: uId
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
        this.getChatters = (ownerId, ownerToken, uId)=>{
            return new Promise((resolve, reject)=> {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${uId}&moderator_id=${uId}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
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
        this.isUserFollower = (ownerId, ownerToken, uId, userid) => {
            return new Promise((resolve, reject)=> {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${uId}&user_id=${userid}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                        let bs = JSON.parse(body);
                        if(bs.data){
                            resolve(bs.data[0])
                        }
                        else{
                            resolve({})
                        }
                })
            })
        }
        this.isUserSubscribed = (ownerId, ownerToken, uId, userid)=>{
            return new Promise((resolve, reject) => {
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${uId}&user_id=${userid}`,
                {"headers": {
                        "Client-ID": ownerId,
                        "Authorization": "Bearer " + ownerToken
                        }
                },
                function(error, meta, body){
                    if(error){reject(error);}
                    let bs = JSON.parse(body);
                    if(bs.data){
                        resolve(bs.data[0])
                    }
                    else{
                        resolve(null)
                    }
                })
            })
        }
        this.GetWeather = () => {
            return new Promise((resolve, reject) => {
                let weatherurl = `http://api.openweathermap.org/data/2.5/weather?id=${weatherConf.wCityId}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`
                fetchUrl(weatherurl, function(error, meta, body){
                    if(error){reject(error);}
                    let wNetwork = JSON.parse(body);
                    let currentweather;
                    if (wNetwork.Code == 'ServiceUnavailable'){
                        wNetwork.WeatherText = json.Message;
                        reject()
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
                    resolve(currentweather)
                })
            })
        }
    }
}
module.exports = kiwitwitchbot;