const fs = require('fs');
const path = require('path');
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library")
const { EventEmitter } = require("events");
//
class mkTeamspeak extends EventEmitter {
    constructor(authfile){
        super();
        
////
const { TeamSpeak, QueryProtocol } = require("ts3-nodejs-library")
TeamSpeak.connect({
        host: "localhost",
        protocol: QueryProtocol.RAW, //optional
        queryport: 10011, //optional
        serverport: 9987,
        username: "YggY",
        password: "o6o20Idt",
        nickname: "YggY"
}).then(async teamspeak => {
        teamspeak.whoami().then(whoami => {
                teamspeak.clientMove(whoami.clientId, 2, '', false)
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

// const clients = await teamspeak.clientList({ clientType: 0 })
// clients.forEach(client => {
//         console.log(client.nickname)
//         // client.message(`hello there ${client.nickname}... i SEEEE YOUUUUU`)
// })
    }
};
//
module.exports = mkTeamspeak;