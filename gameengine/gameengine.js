//
const { EventEmitter } = require("events");
const mysql = require('mysql');
const colors = require('colors');
const got = require('got');
const fetchUrl = require("fetch").fetchUrl
//
class kiwigameengine extends EventEmitter {
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
        this.UniverseObjects = [];
        this.PlayerObjects = [];
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
                    let streetCreds = {
                        tokens: JSON.parse(results[0].Auth),
                        auth: JSON.parse(results[0].Oauth_owner),
                        bottokens: JSON.parse(results[0].BotAuth),
                        botauth: JSON.parse(results[0].Oauth_bot)
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
        this.GenerateUniverse = (universeObj) => {
            return new Promise((resolve, reject) => {
                //
                // console.log(universeObj)
                
                //
                resolve(universeObj)
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
    }
}
module.exports = kiwigameengine;