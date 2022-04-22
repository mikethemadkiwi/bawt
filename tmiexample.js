let MKAuth = require('./mk_twitchauth.js');
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
let mKiwi;
const weathertimeout = [];
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
                        io.emit('userPart', apiuser)
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
                        if(autohost){console.log('Autohost','Autohost')} 
                        var fs = require('fs');
                        var files = fs.readdirSync('socket-www/sounds/host/');
                        var rFile = Math.floor(Math.random() * files.length);
                        let fileSTR = `${files[rFile]}`;
                        console.log('HOST',`onHosted: ${username} for ${viewers} | ${fileSTR} |`);
                        MKClient['twitchchat'].say('#mikethemadkiwi', `Hosted: ${username} | ${fileSTR} |`).catch(function(err){
                            console.log(err)
                        });
                        io.emit('hosted', [channel, username, viewers, autohost, fileSTR]);
                })
                MKClient['twitchchat'].on('message', async (target, context, msg, self)=>{
                        // if (self) { return; } // Ignore messages from the yuse4r if it is self                    
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
                                                    else{console.log(wNetwork)};
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
        isUserSubscribed(userid){
            return new Promise((resolve, reject) => {
                let tmpAuth = Madkiwi.ScopeToken.access_token;
                let fetchu = fetchUrl(`https://api.twitch.tv/helix/subscriptions/user?broadcaster_id=${mKiwi[0].id}&user_id=${userid}`,
                {"headers": {
                        "Client-ID": Madkiwi.Auth.client_id,
                        "Authorization": "Bearer " + tmpAuth
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
                    console.log('PUBSUB','RESPONSE: ' + (data.error ? data.error : 'OK'));
                } else if (data.type == 'MESSAGE') {
                    var msg = JSON.parse(data.data.message);
                    let pTopic = data.data.topic;
                    switch(pTopic){
                        case 'channel-bits-events-v2.22703261': // BITTIES
                            console.log('Bits Event', msg)
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
                            console.log('Channel Points Event', reward.title, redeemer.display_name) 
                            switch(reward.title){
                                case 'kiwisdebugbutton':
                                    let issubbed = await _mk.isUserSubscribed(redeemer.id);
                                    console.log('issubbed?', issubbed)
                                break;
                                case'LookMa':
                                    io.emit('LookMa', rewardData)  
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `Look @${redeemer.display_name} I'm a Dragon!!`)  
                                break;
                                case'effyou':
                                    io.emit('effyou', rewardData)
                                    // MKClient['twitchchat'].say('#mikethemadkiwi', `Look @${redeemer.display_name} I'm a Dragon!!`)  
                                break;
                                case'Guildwars2':
                                    MKClient['twitchchat'].say('#mikethemadkiwi', `|| mikethemadkiwi.6058 || plays on || Henge of Denravi - US ||`)
                                break;   
                                case'ShoutOut':
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
                                        else{console.log(wNetwork)};
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
                            console.log('Channel Subscription Event', msg)
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
///////////////////////////////////////
// START ENGINE
///////////////////////////////////////
let Madkiwi = new MKAuth(TwitchConf);
Madkiwi.LoadAuthServer(8080);
Madkiwi.on('ScopeToken', async function(data){
        let _mk = new MKUtils;
        mKiwi = await _mk.fetchUserByName(Madkiwi.Auth.username)
        _mk.CreateChat()
        let topics = _mk.CreatePubsubTopics(mKiwi[0].id)
        _mk.RestartPub(topics, mKiwi[0].id)     
        server.listen(port, () => {
            console.log(`listening on *:${port}`);
        });
})
io.on('connection', (socket) => {
  socket.name = socket.id;
  console.log('SOCKETIO',`${socket.name} connected from : ${socket.handshake.address}`); 
  sockets[socket.id] = socket;
  socket.on('disconnect', function () {
    console.log('SOCKETIO',`${socket.name} disconnected`); 
  });
});