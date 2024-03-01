// Calls and requires
let MKAuth = require('./mk_twitchauth.js');
const Madkiwi = new MKAuth;
let MKDB = require('./mk_database.js');
const Database = new MKDB;
// Heartbeat
let KeyStore;
const KSFunction = async function(){
    KeyStore = await Database.CurrentKey();
}
// Listeners
Madkiwi.on('ScopeToken', async function(data){
    let dbscopestore = await Database.StoreAuth(data);
    KSFunction();
})
Madkiwi.on('TokenRefresh', async function(newTokens){
    let dbscopestore = await Database.StoreAuth(newTokens);
    KSFunction();
})
// Init
let startNow = setTimeout(async () => {
    let dbsanity = await Database.SanityCheck();
    Madkiwi.LoadAuthServer(8081);      
}, 10);
