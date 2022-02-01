let MKAuth = require('./mk_twitchauth.js');
// let MKTeamSpeak = require('./mk_teamspeak.js');
const tmi = require('tmi.js');
const ws = require('ws');
const fetchUrl = require("fetch").fetchUrl
const TwitchConf = require('../auths/twitch/oauth2.json');
const weatherConf = require('../auths/weather/londonontario.json');
const express = require('express');
const socketapp = express();
const http = require('http');
const cookieParser = require('cookie-parser'); //COOOKIES!! NOM
const bodyParser = require('body-parser');
const server = http.createServer(socketapp);
const { Server } = require("socket.io");
const path = require('path')
const io = new Server(server);
socketapp.use(bodyParser.json());
socketapp.use(bodyParser.urlencoded({ extended: false }));
socketapp.use(cookieParser());
socketapp.use(express.static(path.join(__dirname, 'socket-www')))
const port = process.env.PORT || 12345;
const sockets = [];
const MKClient = [];
const weathertimeout = [];
//
let gameTick;
let frameTick;
let currentweather;
const playerBase = [];
const bSpaceObjs = [];
class PlayerObj {
    constructor(twitchuser) {
        this.id = twitchuser.id;
        this.player = {
            exp: 0,
            user: twitchuser,
            stats: {
                att:0, //scissors
                def:0, //rock
                agi:0, //paper
                special: 0
            },
            actpos: {
                x:0,
                y:0,
                z:0,
                bubble:0
            },
            tarpos: {
                x:0,
                y:0,
                z:0,
                bubble:0
            },
            ship: {},
            planet: {},
            inventory: []
        }        
        this.UpdateTick = async function() {
            // this.player.actpos.y++;
        } 
        this.EmitUser = async function() {
            io.emit('playerUpdate', this.player)
            // console.log(this.id, this.player.exp, this.player.actpos, this.player.tarpos)
        }
    }
}
class UniverseObj {
    constructor(ObjName, type, imgsrc, size, x, y, z, bub, resources) {
        this.id = ObjName
        this.uObj = {
            id: ObjName,
            name: ObjName,
            type: type,
            imgsrc: imgsrc,
            size: size,
            actpos: {
                x:x,
                y:y,
                z:z,
                bubble: bub
            },
            tarpos: {
                x:x,
                y:y,
                z:z,
                bubble: bub
            },
            resources: resources,
            availableResources: []
        }
        this.emitObject = async function() {
            io.emit('uObjUpdate', this.uObj)
            // console.log('Object:', this.id,)
            // this.uObj.resources.forEach(Rtype => {
                // console.log(Rtype, this.uObj.availableResources[Rtype])
            // })
            // console.log('\n')
        }
        this.UpdateTick = function(){
            // movement logic
            
            // resource updates
            this.uObj.resources.forEach(Rtype => {
               if(this.uObj.availableResources[Rtype]!=null){
                this.uObj.availableResources[Rtype]++;
               }
               else(
                this.uObj.availableResources[Rtype] = 1  
               )
            });
        } 
    }
}
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
        CreateChat = function(){                
                MKClient['twitchchat'] = new tmi.client({
                        identity: {
                        username: Madkiwi.Auth.username,
                        password: Madkiwi.ScopeToken.access_token
                        },
                        channels: ['mikethemadkiwi']
                })
                // Listeners
                MKClient['twitchchat'].connect().catch(err => {console.error("Chatbot Connection Error", (err.body ? err.body : err))});
                MKClient['twitchchat'].on('connected', (addr, port)=>{
                        console.log(`${Madkiwi.Auth.username} Connected to ${addr}:${port}`);
                });
                MKClient['twitchchat'].on('join', async (channel, username, self)=>{
                        if(!self){console.log('JOIN', channel, username)}
                        let _mk = new MKUtils;
                        let apiuser = await _mk.fetchUserByName(username)
                        io.emit('userJoin', apiuser)
                });
                MKClient['twitchchat'].on('part', async (channel, username, self)=>{           
                        if(!self){console.log('PART', channel, username)}
                        let _mk = new MKUtils;
                        let apiuser = await _mk.fetchUserByName(username)
                        io.emit('userJoin', apiuser)
                });        
                MKClient['twitchchat'].on('clearchat', (channel, username)=>{
                        console.log('Chat Cleared:', channel, username)
                });
                MKClient['twitchchat'].on('clearmsg', (chan, msg, msgid)=>{
                        console.log(`msg [${msgid}] cleared in:`, chan, msg)
                });
                MKClient['twitchchat'].on('notice', (channel, data)=>{
                        console.log(`notice ${channel}`, data)
                });
                MKClient['twitchchat'].on('reconnect', ()=>{ console.log('reconnect') })
                MKClient['twitchchat'].on('roomstate', (chan, state)=>{ console.log('reconnect') })
                MKClient['twitchchat'].on('usernotice', (chan, data)=>{ console.log('usernotice') })
                MKClient['twitchchat'].on('userstate', (chan, data)=>{ console.log('userstate') })
                MKClient['twitchchat'].on('hosted', async (channel, username, viewers, autohost)=>{ 
                        console.log('hosted')
                        if(autohost){console.log('Autohost','Autohost')}
                        console.log('HOST',`onHosted: ${username} for ${viewers}`)
                })
                MKClient['twitchchat'].on('message', async (target, context, msg, self)=>{
                        // if (self) { return; } // Ignore messages from the yuse4r if it is self                    
                        if(msg.substr(0, 1) == "`"){
                                let stringsplit = msg.split(" ");
                                switch (stringsplit[0]) {
                                    case'`gw2':
                                        MKClient['twitchchat'].say('#mikethemadkiwi', `|| mikethemadkiwi.6058 || plays on || Henge of Denravi - US ||`)
                                    break;
                                    case'`lookma':
                                        console.log('look ma i am a dragon')
                                        io.emit('LookMa', context.username)  
                                        MKClient['twitchchat'].say('#mikethemadkiwi', `Look @${context.username} I'm a Dragon!!`)  
                                    break;
                                    case'`weather':
                                        console.log('weather')
                                            let weatherurl = `http://api.openweathermap.org/data/2.5/weather?id=${weatherConf.wCityId}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`
                                   
                                            if(stringsplit[1]){
                                                let isnum = /^\d+$/.test(stringsplit[1]);
                                                if (isnum){
                                                    console.log('isnum', stringsplit[1])
                                                }
                                                else {
                                                    console.log('isnotnum', stringsplit[1])
                                                }
                                                // let citycode = typeof stringsplit[1]
                                                // if(citycode != Number){
                                                //     MKClient['twitchchat'].say('#mikethemadkiwi', 'That is not a CITYID from https://openweathermap.org/city/').catch(function(err){
                                                //         console.log(err)
                                                //     });
                                                //     return; 
                                                // }
                                                // else{
                                                        weatherurl =`http://api.openweathermap.org/data/2.5/weather?id=${stringsplit[1]}&units=${weatherConf.wDegreeKey}&APPID=${weatherConf.wAppKey}`
                                                        
                                                // }
                                            }

                                            fetchUrl(weatherurl, function(error, meta, body){
                                                if(error){console.log('error', error)}
                                                let wNetwork = JSON.parse(body);
                                                let currentweather;
                                                if (wNetwork.Code == 'ServiceUnavailable'){
                                                    wNetwork.WeatherText = json.Message;
                                                }
                                                if (wNetwork.weather) {
                                                    if(stringsplit[1]){
                                                        currentweather = `Hey @${context.username}, Weather for ${stringsplit[1]}: `
                                                    }else{
                                                        currentweather = `Hey @${context.username}, Weather for London, On: `
                                                    }
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
                                                else{console.log(wNetwork)}
                                                MKClient['twitchchat'].say('#mikethemadkiwi', currentweather).catch(function(err){
                                                    console.log(err)
                                                });
                                                MKClient['twitchchat'].say('#mikethemadkiwi', 'Find your weather code at https://openweathermap.org/city/ and use it  like this || `weather CITYID').catch(function(err){
                                                    console.log(err)
                                                });                              
                                            })
                                    break;
                                    default:
                                        // do nothing if the default fires  
                                }         
                        }
                        else {
                            console.log(context.username, msg)
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
            pck.nonce = Madkiwi.Auth.username + '-' + new Date().getTime();
            pck.data = {};
            pck.data.topics = topics;
            pck.data.auth_token = Madkiwi.ScopeToken.access_token;
            MKClient['pubsub'].send(JSON.stringify(pck));
        }        
        fetchUserByName(name){
            return new Promise((resolve, reject) => {
                let tmpAuth = Madkiwi.ScopeToken.access_token;
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?login=${name}`,
                {"headers": {
                        "Client-ID": Madkiwi.Auth.client_id,
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
                let tmpAuth = Madkiwi.ScopeToken.access_token;
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/users?id=${uId}`,
                {"headers": {
                        "Client-ID": Madkiwi.Auth.client_id,
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
        start();
    }
}
ping.awaitPong = function() {
    ping.pingtimeout = setTimeout(function() {
        console.log('Pubsub Ping','WS Pong Timeout');
        MKClient['pubsub'].close();
        start();
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
                    // console.log(data);
                    console.log('PUBSUB','RESPONSE: ' + (data.error ? data.error : 'OK'));
                } else if (data.type == 'MESSAGE') {
                    var msg = JSON.parse(data.data.message);
                    ///
                    if(msg.hasOwnProperty('message_type')){
                        // console.log('pubsub event', msg.message_type)
                       switch(msg.message_type){
                            case'bits_event':
                                console.log('BITS EVENT', `[${msg.data.user_name}] cheered ${msg.data.bits_used} bitties! Total[${msg.data.total_bits_used}]`)
                            break;
                            default:
                                console.log('pubsub message_type', msg.message_type, msg.data)
                       }
                    }                
                    else if(msg.hasOwnProperty('type')){
                        switch(msg.type){
                            case'reward-redeemed':
                            let _mk = new MKUtils;
                            let redeemer = msg.data.redemption.user;
                            let reward = msg.data.redemption.reward;
                            let tUser = await _mk.fetchUserByName(redeemer.login)
                            let rewardData = {redeemer: redeemer, reward: reward, user: tUser}  
                            //
                            let _mg = new MKGame;
                            switch(reward.title){
                                case 'kiwisdebugbutton':
                                    // 
                                break;
                                case'LookMa':
                                    io.emit('LookMa', rewardData)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Look @${redeemer.display_name} I'm a Dragon!!`)  
                                break;
                                case'ShoutOut':
                                    io.emit('ShoutOut', rewardData)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `You should all go follow ${redeemer.display_name} @ twitch.tv/${redeemer.display_name} because i fuggin said so. They are amazing. I'm a bot, i'm totally capable of making that observation.`)

                                break;
                                case'Destination: Sol':
                                    let npl2 = await _mg.checkPlayer(tUser)
                                    let newpos2 = {x:0, y:0, z:0, bubble: 0}
                                    playerBase[npl2].player.tarpos = newpos2
                                    let moveto2 = [playerBase[npl2], newpos2]
                                    io.emit('Dest-Sol', moveto2)
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Moving @${redeemer.display_name} to ${reward.title}`)       
                                break;
                                case'Destination: Earth':
                                    let npl3 = await _mg.checkPlayer(tUser)
                                    let newpos3 = {x:75, y:0, z:0, bubble: 0}
                                    playerBase[npl3].player.tarpos = newpos3
                                    let moveto3 = [playerBase[npl3], newpos3]
                                    io.emit('Dest-Earth', moveto3)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Moving @${redeemer.display_name} to ${reward.title}`)          
                                break;
                                case'Destination: Luna':
                                    let npl4 = await _mg.checkPlayer(tUser)
                                    let newpos4 = {x:100, y:-25, z:0, bubble: 0}
                                    playerBase[npl4].player.tarpos = newpos4
                                    let moveto4 = [playerBase[npl4], newpos4]
                                    io.emit('Dest-Luna', moveto4)   
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Moving @${redeemer.display_name} to ${reward.title}`)       
                                break;
                                default:
                                    console.log('UNREGISTERED CHANNEL POINT REDEEM', `${reward.title} [${redeemer.display_name}]`, reward)                
                            }
                            //
                            break;
                            default:
                                // console.log('pubsub type', msg.data)
                       }
                    }
                    else {
                        console.log(`unhandled pubsub`, msg);
                    };
      
                    ///
                } else {
                    console.log('wotpubsub', data);
                }
            });
        }
}
///////////////////////////////////////
// START ENGINE
///////////////////////////////////////
let Madkiwi = new MKAuth(TwitchConf);
// Load the server
Madkiwi.LoadAuthServer(8080);// MUST MATCH CALLBACK PORT
// Will Fire on Scoped Token Return from AuthServer
Madkiwi.on('ScopeToken', async function(data){
        let _mk = new MKUtils;
        let _user = await _mk.fetchUserByName(Madkiwi.Auth.username)
        _mk.CreateChat()
        let topics = _mk.CreatePubsubTopics(_user[0].id)
        _mk.RestartPub(topics)
        //// It's only a few lines of code.....        
        server.listen(port, () => {
            console.log(`listening on *:${port}`);
            // bSpaceObjs.push(new UniverseObj('Sol', 0, './img/sun2.png', 200, 0, 0, 0, 0 , [1,2]))
            // bSpaceObjs.push(new UniverseObj('Earth', 1, './img/planet.png', 50, 75, 0, 0, 0 , [6,8]))
            // bSpaceObjs.push(new UniverseObj('Luna', 2, './img/gray_planet.png', 20, 100, -25, 0, 0 , [1,2]))
        });
})
//// It's only a few lines of code.....
io.on('connection', (socket) => {
  socket.name = socket.id;
  console.log('SOCKETIO',`${socket.name} connected from : ${socket.handshake.address}`); 
  sockets[socket.id] = socket;
  ///
//   gameTick = setInterval(() => {
//         bSpaceObjs.forEach(bObj => {
//             bObj.UpdateTick();
//         });
//         playerBase.forEach(pObj => {
//             pObj.UpdateTick();
//         });
//   }, 10);
// //   ///
//   frameTick = setInterval(() => {
//     // console.clear()
//     // console.log('Universe Entities: \n')
//     bSpaceObjs.forEach(bObj => {
//         bObj.emitObject();
//     });    
//     // console.log('\nPlayer Entities:', playerBase.length, '\n')    
//     playerBase.forEach(pObj => {
//         pObj.EmitUser();
//     });    
//   }, 1000);
  //make a planet for each id in chat or that logs in via socket.  
  //
  socket.on('disconnect', function () {
    console.log('SOCKETIO',`${socket.name} disconnected`); 
  });
});
