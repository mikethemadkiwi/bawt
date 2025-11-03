// Json Configs
let ownerDeets = require('../configs/auth_owner.json');
let botDeets = require('../configs/auth_bot.json');
let dbDeets = require('../configs/database.json');
let kickownerDeets = require('../configs/auth_kick.json');
//
// Twitch Auth Stuff
let MKDB = require('./mk_database.js');
let MKAuth = require('./mk_twitchauth.js');
const Database = new MKDB(dbDeets);
const Madkiwi = new MKAuth({auth: ownerDeets, botauth: botDeets, kickauth: kickownerDeets});
// Heartbeat
let KeyStore;
let BotStore;
let KickStore;
const KSFunction = async function(){
    KeyStore = await Database.CurrentKey();
}
const KSBFunction = async function(){
    BotStore = await Database.CurrentBotKey();
}
const KSKFunction = async function(){
    KickStore = await Database.CurrentKickKey();
}
// Listeners
Madkiwi.on('ScopeRefresh', async function(data){
    let dbscopestore = await Database.StoreClient(data);
})
Madkiwi.on('ScopeToken', async function(data){
    let dbscopestore = await Database.StoreAuth(data);
    KSFunction();
})
Madkiwi.on('ScopeTokenRefresh', async function(newTokens){
    let dbscopestore = await Database.StoreAuth(newTokens);
    KSFunction();
})
Madkiwi.on('BotRefresh', async function(data){
    let dbscopestore = await Database.StoreBotClient(data);
})
Madkiwi.on('BotToken', async function(data){
    let dbbotstore = await Database.StoreBotAuth(data);
    KSBFunction();
})
Madkiwi.on('BotTokenRefresh', async function(newTokens){
    let dbbotstore = await Database.StoreBotAuth(newTokens);
    KSBFunction();
})
Madkiwi.on('KickRefresh', async function(data){
    let dbKickstore = await Database.StoreKickClient(data);
})
Madkiwi.on('KickToken', async function(data){
    let dbkickclientstore = await Database.StoreKickAuth(data);
    KSKFunction();
})
Madkiwi.on('KickTokenRefresh', async function(newTokens){
    let dbkickclientstore = await Database.StoreKickAuth(newTokens);
    KSKFunction();
})

//
// Init
let startNow = setTimeout(async () => {
    let dbsanity = await Database.SanityCheck();
    Madkiwi.LoadAuthServer(8081);
}, 10);