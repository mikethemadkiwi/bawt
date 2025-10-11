const dbdeets = require('../configs/database.json');
const BCeventsub = require('./barrycarlyon.js');
const gEngine = require('./gameengine.js');
const colors = require('colors');
const mysql = require('mysql');
const io = require("socket.io-client")
//
let KiwiGE = new gEngine;
let DBConn_Server = null;
let Creds = null
let OwnerBot = {
    owner:null,
    bot:null
}
let OwnerChannel = null
let OwnerAds = null
let Chatters = null
let updateTick = null
let PlayerStorageObject = []
///
let universeObj =  [
    {name: 'home', type: 0, size: 50, x:150, y:150, imgsrc:'./img/townhall.png',  resources: [], meta:{}},
    {name: 'mines', type: 0, size: 50, x:250, y:-250, imgsrc:'./img/mines.png',  resources: [{name:'Sulphur', amount: 0},{name:'Iron', amount: 0},{name:'Soil', amount: 0}], meta:{}},
    {name: 'training', type: 0, size: 50, x:-250, y:250, imgsrc:'./img/arena.png',  resources: [{name:'Blood', amount: 0},{name:'Sweat', amount: 0},{name:'Tears', amount: 0}], meta:{}},
    {name: 'fort', type: 0, size: 50, x:0, y:250, imgsrc:'./img/fort.png', resources: [{name:'ArrowHead', amount: 0},{name:'Coins', amount: 0},{name:'Documents', amount: 0}],  meta:{}},
    {name: 'forest', type: 0, size: 50, x:-250, y:0, imgsrc:'./img/forest.png', resources: [{name:'Wood', amount: 0},{name:'Berries', amount: 0},{name:'FreshWater', amount: 0}],  meta:{}},
    {name: 'farm', type: 0, size: 50, x:-250, y:-250, imgsrc:'./img/farm.png', resources: [{name:'Leather', amount: 0},{name:'Milk', amount: 0},{name:'Grain', amount: 0}],  meta:{}}
]
//
IsInArray = function (array, ID){
    return new Promise((resolve, reject) => {
        let isin = array.map(function(obj) { return obj.twitchid; }).indexOf(ID)
        resolve(isin)
    })
}
//
playerInfo = async function(redeemer){
    let tUser = await KiwiGE.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, redeemer.login)     
    let tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
    if (tgresults[0]==null){
        await AddGamePlayer(tUser)
        tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
        console.log(tgresults[0])
    }
    let tPlayer = tgresults[0];
    let isinpi = KiwiGE.PlayerObjects.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
    if(isinpi == -1) {
        KiwiGE.PlayerObjects.push(tPlayer)
        let pcurr = tPlayer.currency.toFixed(2)
        let pxp = tPlayer.xp.toFixed(2)
        await KiwiGE.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Stats for ${redeemer.display_name}: [Att:${tPlayer.attack} Agi:${tPlayer.agility} Def:${tPlayer.defense}] Wearing: ${tPlayer.armour} Weilding: ${tPlayer.weapon} Currency:${pcurr}  XP:${pxp} miketh101Heart`)                 
    }else{
        let pcurr = KiwiGE.PlayerObjects[isinpi].currency.toFixed(2)
        let pxp = KiwiGE.PlayerObjects[isinpi].xp.toFixed(2)
        await KiwiGE.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Stats for ${redeemer.display_name}: [Att:${KiwiGE.PlayerObjects[isinpi].attack} Agi:${KiwiGE.PlayerObjects[isinpi].agility} Def:${KiwiGE.PlayerObjects[isinpi].defense}] Wearing: ${KiwiGE.PlayerObjects[isinpi].armour} Weilding: ${KiwiGE.PlayerObjects[isinpi].weapon} Currency:${pcurr}  XP:${pxp}  miketh101Heart`) 
    }
}
//
travelLocation = async function(redeemer, location){
    let tUser = await KiwiGE.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, redeemer.login) 
    let tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
    if (tgresults[0]==null){
        await AddGamePlayer(tUser)
        tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
        console.log(tgresults[0])
    }
    let tPlayer = tgresults[0];
    let isinpi = KiwiGE.PlayerObjects.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id)
    if(isinpi == -1) {
        KiwiGE.PlayerObjects.push(tPlayer)
        isinpi = KiwiGE.PlayerObjects.map(function(obj) { return obj.twitchid; }).indexOf(redeemer.id) 
    }
    let findlocation = KiwiGE.UniverseObjects.map(function(obj) { return obj.name; }).indexOf(location)
    KiwiGE.PlayerObjects[isinpi].task = 1; //travelling
    KiwiGE.PlayerObjects[isinpi].tarposx = KiwiGE.UniverseObjects[findlocation].x;
    KiwiGE.PlayerObjects[isinpi].tarposy = KiwiGE.UniverseObjects[findlocation].y;
    console.log(`Travelling: ${redeemer.display_name} to ${location} {${KiwiGE.UniverseObjects[findlocation].x}:${KiwiGE.UniverseObjects[findlocation].y}}`)
    let updateStr = `UPDATE twitchgame SET task = ${KiwiGE.PlayerObjects[isinpi].task}, tarposx = ${KiwiGE.PlayerObjects[isinpi].tarposx}, tarposy = ${KiwiGE.PlayerObjects[isinpi].tarposy} WHERE twitchid = ${tUser.id}`
    let updateplayer = await execQuery(updateStr);
}

//
IsDBPresent = function(){
    return new Promise((resolve, reject)=>{
        if(DBConn_Server==null){ 
            DBConn_Server = new mysql.createConnection(dbdeets);
            DBConn_Server.connect(function(err) {
                if (err) throw err;  
                resolve() 
            });        
            DBConn_Server.on('error', function(err) {
                console.log('DB CONNECTION  ERROR', err.code); // 'ER_BAD_DB_ERROR'
                DBConn_Server.end();
                let reconn = setTimeout(() => {
                    DBConn_Server.connect();
                }, 5000);              
            });
        }
        else{
            resolve() 
        }
    });
}
//
execQuery = function(querystr, parameters){
    return new Promise((resolve, reject)=>{
        DBConn_Server.query(querystr, function (error, results, fields) {
            if (error) {
                console.log(error)
                reject();
            };
            if (results) {
                // console.log('mysql results',results)
                resolve(results);
            };
            if (fields) {
                // console.log('feilds', fields)
                // reject();
            };
        });
    });
}
//
function AddGamePlayer(tuser){
    return new Promise((resolve, reject)=>{
        let existsuuid = execQuery(`INSERT INTO twitchgame(twitchid, name, profile) VALUES ('${tuser.id}', '${tuser.display_name}', '${tuser.profile_image_url}')`)
        console.log('added player', tuser.display_name)
        resolve(true)
    })
}
//
function updateChatters(chatlist){
    return new Promise((resolve, reject)=>{
        chatlist.forEach(async chatterObj => {
            let tUser = await KiwiGE.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, chatterObj.user_login)
            let tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
            if (tgresults[0]==null){
                await AddGamePlayer(tUser)
                tgresults = await execQuery(`SELECT * FROM twitchgame WHERE twitchid = ${tUser.id}`);
            }
            let Uexists = await IsInArray(KiwiGE.PlayerObjects, tUser.id)
            if (Uexists==-1){
                KiwiGE.PlayerObjects.push(tgresults[0])
            }
            else{
                KiwiGE.PlayerObjects[Uexists] = tgresults[0]
            }
        });
        resolve(KiwiGE.PlayerObjects)
    })
}
///
const socket = io("http://localhost:8081");
socket.on("connect", () => {
    console.log('Autheticated to Socket as:', socket.id);
    socket.emit("Identifier", "GameEngine");
});
let startGameEngine = setTimeout(async () => {
    //
    Creds = await KiwiGE.initData(dbdeets);
    await IsDBPresent()
    OwnerBot.owner = await KiwiGE.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.auth.username)
    OwnerBot.bot = await KiwiGE.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.botauth.username)
    OwnerChannel = await KiwiGE.fetchStreamById(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
    OwnerAds = await KiwiGE.fetchAdsSchedule(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
    // 
    Chatters = await KiwiGE.getChatters(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)       
    KiwiGE.PlayerObjects = await updateChatters(Chatters)
    socket.emit('GameEngine', ['player:update', KiwiGE.PlayerObjects])
    //
    KiwiGE.UniverseObjects = await KiwiGE.GenerateUniverse(universeObj);
    socket.emit('GameEngine', ['universe:update', KiwiGE.UniverseObjects])
    //
    let eventSub = new BCeventsub(true);
    eventSub.on('session_keepalive', () => {
        let lastKeepAlive = new Date();
    });
    //
    eventSub.on('connected', (id) => {
        // socket.emit('GameEngine', ['eventsub', id])
        console.log(colors.green(`Enabling GameEngine Event Listeners`));
        KiwiGE.SubscribeToTopic(id, 'user.update', '1', { user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'stream.online', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'stream.offline', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.update', '2', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.follow', '2', { broadcaster_user_id: OwnerBot.owner.id, moderator_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.raid', '1', { to_broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.bits.use', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.chat.message', '1', { broadcaster_user_id: OwnerBot.owner.id, user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.chat.notification', '1', { broadcaster_user_id: OwnerBot.owner.id, user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.channel_points_custom_reward_redemption.add', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.channel_points_automatic_reward_redemption.add', '2', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.subscribe', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.subscription.gift', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        KiwiGE.SubscribeToTopic(id, 'channel.subscription.message', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
    });
    eventSub.on('session_silenced', () => {
        console.log('Session mystery died due to silence detected')
    });
    // MAIN LISTENED EVENTS
    eventSub.on('channel.update', function({ payload }){
        console.log('channel.update', payload)
        // socket.emit('GameEngine', ['channel.update', payload])
    });
    eventSub.on('stream.online', function({ payload }){
        console.log('stream.online', payload)
        socket.emit('GameEngine', ['stream.online', payload])
    });
    eventSub.on('stream.offline', function({ payload }){
        console.log('stream.offline', payload)
        socket.emit('GameEngine', ['stream.offline', payload])
    });
    eventSub.on('user.update', function({ payload }){
        // console.log('user.update', payload)
        // socket.emit('GameEngine', ['user.update', payload])
    });
    eventSub.on('channel.follow', function({ payload }){
        // console.log('channel.follow', payload.event.user_name)
        // socket.emit('GameEngine', ['channel.follow', payload])
    });
    eventSub.on('channel.raid', async function({ payload }){
        // console.log('channel.raid',payload.event.from_broadcaster_user_name, payload.event.viewers)
        // socket.emit('GameEngine', ['channel.raid', payload])
    });
    eventSub.on('channel.chat.notification', function({ payload }){
        // console.log('channel.chat.notification',payload)
        // socket.emit('GameEngine', ['channel.chat.notification', payload])
    });
    eventSub.on('channel.bits.use', function({ payload }){
        // console.log('channel.bits.use',payload)
        // socket.emit('GameEngine', ['channel.bits.use', payload])
    });
    eventSub.on('channel.chat.message', async function({ payload }){
        socket.emit('GameEngine', ['channel.chat.message', payload])
        ///// INSERT CHAT CONTROL FUNCTIONS
        let splitArray = payload.event.message.text.split(" ")
        let redeemer = {
            display_name: payload.event.chatter_user_name,
            login: payload.event.chatter_user_login,
            id: payload.event.chatter_user_id,
            user_input: splitArray[0]
        }
        let lowercaseStr = redeemer.user_input.toLowerCase();
        // console.log(redeemer, lowercaseStr)
        switch(lowercaseStr){
            case '!playerinfo':                
                playerInfo(redeemer)
            break;
            case '!travelhome':
               travelLocation(redeemer, 'home')
            break;
            case '!traveltraining':
               travelLocation(redeemer, 'training')
            break;
            case '!travelfort':
               travelLocation(redeemer, 'fort')
            break;
            case '!travelmines':
               travelLocation(redeemer, 'mines')
            break;
            case '!travelforest':
               travelLocation(redeemer, 'forest')
            break;
            case '!travelfarm':
               travelLocation(redeemer, 'farm')
            break;
            default:
        }
        /////
        // console.log('chatpayload', payload.event.message.text)
        // console.log(colors.blue("[Chat]"), colors.yellow(`<${payload.event.chatter_user_name}>`), payload.event.message.text)
    });    
    eventSub.on('channel.channel_points_custom_reward_redemption.add', async function({ payload }){
        let reward = payload.event.reward
        let redeemer = {
            display_name: payload.event.user_name,
            login: payload.event.user_login,
            id: payload.event.user_id,
            user_input: payload.event.user_input
        }
        switch(reward.title){
            case 'PlayerInfo':
               playerInfo(redeemer)
            break;
            case 'Travel-Home':
               travelLocation(redeemer, 'home')
            break;
            case 'Travel-Training':
               travelLocation(redeemer, 'training')
            break;
            case 'Travel-Fort':
               travelLocation(redeemer, 'fort')
            break;
            case 'Travel-Mines':
               travelLocation(redeemer, 'mines')
            break;
            case 'Travel-Forest':
               travelLocation(redeemer, 'forest')
            break;
            case 'Travel-Farm':
               travelLocation(redeemer, 'farm')
            break;
            default:
        }
    });
    eventSub.on('channel.channel_points_automatic_reward_redemption.add', function({ payload }){
        console.log(colors.green('[Points]'), `<${payload.event.reward.type}> Cost:(${payload.event.reward.channel_points})`, payload.event.user_name)
        // socket.emit('GameEngine', ['channel.channel_points_automatic_reward_redemption.add', payload])
        // ChannelPointAutoRedemption(payload)
    });
    updateTick = setInterval(async () => {
        await IsDBPresent()
        Chatters = await KiwiGE.getChatters(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)    
        KiwiGE.PlayerObjects = await updateChatters(Chatters)
        socket.emit('GameEngine', ['player:update', KiwiGE.PlayerObjects])
        socket.emit('GameEngine', ['universe:update', KiwiGE.UniverseObjects])
    }, 1000);
}, 1000);