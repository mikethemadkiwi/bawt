//
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library")
const authfile = require('../auths/teamspeak/yggylogin.json')
let ts3 = TeamSpeak.connect({
        host: authfile.host,
        protocol: QueryProtocol.RAW, //optional
        queryport: authfile.queryport, //optional
        serverport: authfile.serverport,
        username: authfile.username,
        password: authfile.password,
        nickname: authfile.nickname
}).then(async teamspeak => {
        teamspeak.whoami().then(whoami => {
                // teamspeak.clientMove(whoami.clientId, 2, '', false)
        })        
        teamspeak.on("textmessage", ev => {
                console.log(`||TS|| Client [${ev.invoker.propcache.clientNickname}] ${ev.msg}`)
        })
        teamspeak.on("clientmoved", ev => {
                console.log(`||TS|| Client [${ev.client.propcache.clientNickname}] MOVED to [${ev.client.propcache.cid}]`)
        })
        teamspeak.on("cliententerview", ev => {
                console.log(ev)
        })
        teamspeak.on("clientleftview", ev => {
                console.log(ev)
        })
        
}).catch(e => {
        console.log(e)       
})