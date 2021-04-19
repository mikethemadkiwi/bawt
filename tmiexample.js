let MKAuth = require('./mk_twitchauth.js');
const tmi = require('tmi.js');
const TwitchConf = require('./auth.json');

// Configure options
let Madkiwi = new MKAuth(TwitchConf);

// Load the server
Madkiwi.LoadAuthServer(
        8080, // MUST MATCH CALLBACK PORT
        false, //show bot token in console
        false // show scoped token in console
);


// Will Fire on Scoped Token Return from AuthServer
Madkiwi.on('ScopeToken', async function(data){
        // Create Chat Client
        let m2m = new tmi.client({
                identity: {
                    username: Madkiwi.Auth.username,
                    password: Madkiwi.ScopeToken.access_token
                },
                channels: ['mike_the_madkiwi']
        })
        // Listeners
        m2m.connect().catch(err => {console.error("Chatbot Connection Error", (err.body ? err.body : err))});
        m2m.on('connected', (addr, port)=>{
                console.log(`${Madkiwi.Auth.username} Connected to ${addr}:${port}`);
        });
        m2m.on('join',(channel, username, self)=>{
                if(!self){console.log('JOIN', channel, username)}
        });
        m2m.on('part', (channel, username, self)=>{           
                if(!self){console.log('PART', channel, username)}
        });        
        m2m.on('clearchat', (channel, username)=>{
                console.log('Chat Cleared:', channel, username)
        });
        m2m.on('clearmsg', (chan, msg, msgid)=>{
                console.log(`msg [${msgid}] cleared in:`, chan, msg)
        });
        m2m.on('notice', (channel, data)=>{
                console.log(`notice ${channel}`, data)
        });
        m2m.on('reconnect', ()=>{ console.log('reconnect') })
        m2m.on('roomstate', (chan, state)=>{ console.log('reconnect') })
        m2m.on('usernotice', (chan, data)=>{ console.log('usernotice') })
        m2m.on('userstate', (chan, data)=>{ console.log('userstate') })
        m2m.on('hosted', (channel, username, viewers, autohost)=>{ 
                console.log('hosted')
                if(autohost){console.log('Autohost','Autohost')}
                console.log('HOST',`onHosted: ${username} for ${viewers}`)
        })
        
        
        //msg handling.
        m2m.on('message', (target, context, msg, self)=>{
                // if (self) { return; } // Ignore messages from the yuse4r if it is self
                console.log(target, msg, context)
                if(msg.substr(0, 1) == "`"){
                        console.log(msg)
                }
        });     

        // chat.ChatChannels[TargetChannel].on('hosting', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('anongiftpaidupgrade', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('giftpaidupgrade', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('raided', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('cheer', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('resub', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('subgift', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('submysterygift', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('subscription', chat.ondebugEvent)
        // chat.ChatChannels[TargetChannel].on('timeout', chat.ondebugEvent)
})