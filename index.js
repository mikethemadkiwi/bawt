// Calls and requires
let MKAuth = require('./mk_twitchauth.js');
const Madkiwi = new MKAuth;
let MKDB = require('./mk_database.js');
const Database = new MKDB;
// Heartbeat
let KeyStore;
let BotStore;
const KSFunction = async function(){
    KeyStore = await Database.CurrentKey();
}
const KSBFunction = async function(){
    BotStore = await Database.CurrentBotKey();
}
// Listeners
Madkiwi.on('ScopeToken', async function(data){
    let dbscopestore = await Database.StoreAuth(data);
    KSFunction();
})
Madkiwi.on('ScopeTokenRefresh', async function(newTokens){
    let dbscopestore = await Database.StoreAuth(newTokens);
    KSFunction();
})
Madkiwi.on('BotToken', async function(data){
    let dbbotstore = await Database.StoreBotAuth(data);
    KSBFunction();
})
Madkiwi.on('BotTokenRefresh', async function(newTokens){
    let dbbotstore = await Database.StoreBotAuth(newTokens);
    KSBFunction();
})
// Init
let startNow = setTimeout(async () => {
    let dbsanity = await Database.SanityCheck();
    Madkiwi.LoadAuthServer(8081);      
}, 10);
