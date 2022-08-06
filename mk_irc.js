var irc = require("irc");
var config = {
	channels: ["#","#madhaus"],
	server: "127.0.0.1",
	botName: "YggY",
    syschan: [
        {pass: '8008135',topic:'-=|| Unimatrix 0 ||=-'},
        {pass: '',topic:'-=|| Welcome to the Madhaus! ||=-'}
    ]
};
// Create the bot name
var bot = new irc.Client(config.server, config.botName, {
	channels: config.channels,
    userName: 'kiwisbot',
    realName: 'Madkiwis NodeJS Bot',
});
////////////////////////////////////////////////////////////////////////////////////
const ProtectedNick = ['phi', 'kiwisbot', 'madkiwi'];
const RegisteredNick = [];
////////////////////////////////////////////////////////////////////////////////////
bot.addListener("join", function(channel, who) {
    if(who!=config.botName){
        bot.say(config.channels[0], `[${Date.now()}] ${who} Joined: ${channel}`);
        console.log(`[${Date.now()}] ${who} Joined { ${channel} }`)
    }
    else{
        if(channel == config.channels[0]){
            bot.send('MODE', channel, '+p')
            bot.send('MODE', channel, '+k', config.syschan[0].pass)
            bot.send('TOPIC', channel, config.syschan[0].topic)
        }
        else if(channel == config.channels[1]){
            bot.send('MODE', channel, '-k', config.syschan[1].pass)
            bot.send('TOPIC', channel, config.syschan[1].topic)
        }
        else{
            console.log(`[${Date.now()}] You Joined { ${channel} }`)
        }
    }
});
bot.addListener("message", async function(from, to, text, message) {	
    if(to==config.botName){
            let stringsplit = text.split(" ");
            switch (stringsplit[0]) {
                case'help':
                bot.say(from, `You expect help?!? Jesus wept... next you'll want me to respect your feelings.`)
                break;
                case'login':
                    console.log(stringsplit)
                break;
                case'register':
                    console.log(stringsplit)
                break;
                default:
                    console.log(`[${Date.now()}] PRIVMSG || ${from}: ${text}`)
                    bot.say(from, 'I dont know what you mean.')
            }; 
    }
    else{  
        
        if(text.substr(0, 1) == "`"){
            let stringsplit = text.split(" ");
            switch (stringsplit[0]) {
                case'`op':
                        bot.send('MODE', to, '+o', from)
                break;
                case'`deop':
                        bot.send('MODE', to, '-o', from)
                break;
                case'`voice':
                        bot.send('MODE', to, '+v', from)
                break;
                case'`devoice':
                        bot.send('MODE', to, '-v', from)
                break;
                case'`topic':
                    let strConstruct = ``;
                    for (let index = 1; index < stringsplit.length; index++) {
                        const element = stringsplit[index];
                        strConstruct += ` ${element}`
                    }
                    bot.send('TOPIC', to, strConstruct)
                break;
                default:
            };
        }
        else{            
            console.log(`[${Date.now()}] ${to} || ${from}: ${text}`)
        }
        
    }
});
// bot.addListener('pm', function (from, message) {
//     console.log(from + ' => ME: ' + message);
// });
bot.addListener('error', function(message) {
    console.log('error: ', message);
});
bot.addListener('registered', function (rmsg) { });
bot.addListener('motd', function (motd) { });
bot.addListener('topic', function (channel, topic, nick, message) { });
bot.addListener('names', function (channel, nicks) { });
bot.addListener('part', function (channel, nick, reason, message) { });
bot.addListener('quit', function (nick, reason, channels, message) { });
bot.addListener('kick', function (channel, nick, by, reason, message) { });
bot.addListener('selfMessage', function (to, text) { });
bot.addListener('notice', function (nick, to, text, message) { });
bot.addListener('ping', function (server) { });
bot.addListener('ctcp', function (from, to, text, type, message) { });
bot.addListener('ctcp-notice', function (from, to, text, message) { });
bot.addListener('ctcp-privmsg', function (from, to, text, message) { });
bot.addListener('ctcp-version', function (from, to, message) { });
bot.addListener('nick', function (oldnick, newnick, channels, message) { });
bot.addListener('invite', function (channel, from, message) { });
bot.addListener('+mode', function (channel, by, mode, argument, message) {
    // console.log(channel, by, mode, message.args[2], message)
    if(mode==='o'){
        console.log(`${by} set mode +${mode} on {${argument}} in channel [${channel}]`)
    }
    if(mode==='v'){
        console.log(`${by} set mode +${mode} on {${argument}} in channel [${channel}]`)
    }
    if(mode==='k'){
        console.log(`${by} set mode +${mode} to {${argument}} in channel [${channel}]`)
    }
    if(mode==='b'){
        console.log(`${by} set mode +${mode} to {${argument}} in channel [${channel}]`)
    }
});
bot.addListener('-mode', function (channel, by, mode, argument, message) { 
    // console.log(channel, by, mode, message.args[2], message)
    if(mode==='o'){
        console.log(`${by} set mode -${mode} on {${argument}} in channel [${channel}]`)
    }
    if(mode==='v'){
        console.log(`${by} set mode -${mode} on {${argument}} in channel [${channel}]`)
    }
    if(mode==='k'){
        console.log(`${by} set mode -${mode} to {${argument}} in channel [${channel}]`)
    }
    if(mode==='b'){
        console.log(`${by} set mode -${mode} to {${argument}} in channel [${channel}]`)
    }
    
});
bot.addListener('whois', function (info) { });
bot.addListener('action', function (info) { });
bot.addListener('channellist', function (from, to, text, message) { });