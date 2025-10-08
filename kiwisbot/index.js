const dbdeets = require('../configs/database.json');
const kBot = require('./kiwisbot.js');
const BCeventsub = require('./barrycarlyon.js');
const colors = require('colors');
const io = require("socket.io-client")
const Kiwisbot = new kBot;
let Creds = null
let OwnerBot = {
    owner:null,
    bot:null
}
let OwnerChannel = null
let OwnerAds = null
let Chatters = null
//
async function ChannelPointCustomRedemption(rewardData){
    let apiuser = rewardData.user
    // console.log(apiuser)
    switch(rewardData.reward.title){
        case 'kiwisdebugbutton':
            if (rewardData.redeemer.login == 'mikethemadkiwi'){    

            }
        break;
        case 'TwitchAge':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Account Creation Date for ${apiuser.display_name}: ${apiuser.created_at}`)
        break;
        case 'LurkMode':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Lurk Mode Activated for ${apiuser.display_name}. Enjoy your Lurk!  miketh101Heart`)
        break;
        case 'LookMa':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id,`Look Ma, @${rewardData.redeemer.display_name} is going to be a Dragon!!`)
        break;
        case 'Teamspeak':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Teamspeak Deets: ts3://mad.kiwi:9987`)  
        break;
        case 'RoleplayCity':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `|| mikethemadkiwi is currently playing on "THE CREW RP" You can connect by joining the discord Here: https://discord.gg/thecrewrp ||`)
        break;
        case 'Loud':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Playing a Loud Noise for @${rewardData.redeemer.display_name}`)
        break;
        case 'Honk':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Honking for @${rewardData.redeemer.display_name}`)
        break;
        case 'YouWereKicked':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `TS Kicking for @${rewardData.redeemer.display_name}`)
        break;
        case 'Gong':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Gonging for @${rewardData.redeemer.display_name}`)
        break;
        case 'BunnySays':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Playing BunnySays for @${rewardData.redeemer.display_name}`)
        break;
        case 'Guildwars2':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `|| mikethemadkiwi.6058 || plays on || Henge of Denravi - US ||`)
        break;   
        case 'ShoutOut':
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `You should all go follow ${rewardData.redeemer.display_name} @ twitch.tv/${redeemer.display_name} because i fuggin said so. They are amazing. I'm a bot, i'm totally capable of making that observation.`)
            await Kiwisbot.ShoutoutUser(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id, redeemer.id)
        break;        
        case 'KiwisWeather':
            let currWeather = await Kiwisbot.GetWeather()
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, currWeather)
        break;
        case 'FollowAge':
            let followAge = await Kiwisbot.isUserFollower(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id, rewardData.redeemer.id)
            // console.log(followAge)
            await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Account Follow Date for ${followAge.user_name}: ${followAge.followed_at}`)
        break;
        case 'ProveSub':
            let proveSub = await Kiwisbot.isUserSubscribed(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id, rewardData.redeemer.id)
            // console.log('provesub', proveSub)
            if (proveSub!=null) { 
                let tier = (proveSub.tier/1000)
                if (proveSub.is_gift==true) {
                    Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `${rewardData.redeemer.display_name} was Gifted Tier: ${tier} by ${proveSub.gifter_name}! Thanks miketh101Heart`)
                }
                else {
                    Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `${rewardData.redeemer.display_name} is a ${proveSub.plan_name} (Tier: ${tier}). Thanks!! miketh101Heart`)
                }                                     
            }
            else {
                Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Scrublord! WTF ${rewardData.redeemer.display_name}!! Someone get this person a Sub!!!`)
            }
        break;
        default:
            // console.log('UNREGISTERED CHANNEL POINT REDEEM', `${rewardData.reward.title} [${rewardData.redeemer.display_name}]`, rewardData)                
    }
}
async function ChannelPointAutoRedemption(payload){    
    switch(payload.event.reward.type){
        case 'send_highlighted_message':
            console.log(colors.green('Highlighted Text'), payload.event.message.text)
        break;
        default:
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let startNow = setTimeout(async () => {
    console.log(colors.green('Loading Credentials'))
    Creds = await Kiwisbot.initData(dbdeets);
    // console.log(dbdeets)
    OwnerBot.owner = await Kiwisbot.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.auth.username)
    OwnerBot.bot = await Kiwisbot.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.botauth.username)
    OwnerChannel = await Kiwisbot.InitTwitchStream(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
    OwnerAds = await Kiwisbot.fetchAdsSchedule(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
    Chatters = await Kiwisbot.getChatters(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
    console.log(colors.green('Credentials Loaded'))
    console.log(colors.green('Loading Modules'))
    let socket = io("http://localhost:8081");
    socket.on("connect", () => {
        console.log('Autheticated to Socket as:', socket.id);
        socket.emit("Identifier", "Twitch");
    });
    socket.on("whoareyou", () => {
    });
    let eventSub = new BCeventsub(true);
    eventSub.on('session_keepalive', () => {
        let lastKeepAlive = new Date();
    });
    eventSub.on('connected', (id) => {
        socket.emit('Twitch', ['eventsub', id])
        console.log(colors.green(`Enabling Twitch Event Listeners`));
        Kiwisbot.SubscribeToTopic(id, 'user.update', '1', { user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'stream.online', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'stream.offline', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.update', '2', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.follow', '2', { broadcaster_user_id: OwnerBot.owner.id, moderator_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.raid', '1', { to_broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.bits.use', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.chat.message', '1', { broadcaster_user_id: OwnerBot.owner.id, user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.chat.notification', '1', { broadcaster_user_id: OwnerBot.owner.id, user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.channel_points_custom_reward_redemption.add', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.channel_points_automatic_reward_redemption.add', '2', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.subscribe', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.subscription.gift', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
        Kiwisbot.SubscribeToTopic(id, 'channel.subscription.message', '1', { broadcaster_user_id: OwnerBot.owner.id }, Creds.auth.client_id, Creds.tokens.access_token)
    });
    eventSub.on('session_silenced', () => {
        let msg = 'Session mystery died due to silence detected';
        console.log(msg)
    });
    // MAIN LISTENED EVENTS
    eventSub.on('channel.update', function({ payload }){
        socket.emit('Twitch', ['channel.update', payload])
        Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Updated: Category[ ${payload.event.category_name} ] Title[ ${payload.event.title} ]`)
    });
    eventSub.on('stream.online', function({ payload }){
        console.log('stream.online', payload)
        socket.emit('Twitch', ['stream.online', payload])
    });
    eventSub.on('stream.offline', function({ payload }){
        console.log('stream.offline', payload)
        socket.emit('Twitch', ['stream.offline', payload])
    });
    eventSub.on('user.update', function({ payload }){
        console.log('user.update', payload)
        socket.emit('Twitch', ['user.update', payload])
    });
    eventSub.on('channel.follow', function({ payload }){
        console.log('channel.follow', payload.event.user_name)
        socket.emit('Twitch', ['channel.follow', payload])
        Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Thanks for the Follow: ${payload.event.user_name}! miketh101Heart Please do not chew on the furniture.  miketh101Heart`)
    });
    eventSub.on('channel.raid', async function({ payload }){
        console.log('channel.raid',payload.event.from_broadcaster_user_name, payload.event.viewers)
        socket.emit('Twitch', ['channel.raid', payload])
        let shoutthresh = Number(payload.event.viewers)
        if (shoutthresh>5) {
            Kiwisbot.ShoutoutUser(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id, payload.event.from_broadcaster_user_id)
            Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Thanks for the Raid: ${payload.event.from_broadcaster_user_name}! miketh101Heart What did your <${payload.event.viewers}> Viewers do to deserve this?!`)
        }
        else {
            Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, `Thanks for the Raid: ${payload.event.from_broadcaster_user_name}! miketh101Heart What did your <${payload.event.viewers}> Viewers do to deserve this?!`)
        }        
    });
    eventSub.on('channel.chat.notification', function({ payload }){
        console.log('channel.chat.notification',payload)
        socket.emit('Twitch', ['channel.chat.notification', payload])
        console.log(colors.cyan("[Notification]"), `${payload.event.notice_type} || ${payload.event.system_message} ||`)
    });
    eventSub.on('channel.bits.use', function({ payload }){
        console.log('channel.bits.use',payload)
        socket.emit('Twitch', ['channel.bits.use', payload])
    });
    eventSub.on('channel.chat.message', function({ payload }){
        socket.emit('Twitch', ['channel.chat.message', payload])
        let currentDT = new Date();
        if (payload.event.reply != null){
            console.log(currentDT, colors.blue("[Chat]"), colors.yellow(`reply to <${payload.event.reply.parent_user_name}>`))
        }
        console.log(currentDT, colors.blue("[Chat]"), colors.yellow(`<${payload.event.chatter_user_name}>`), payload.event.message.text)
    });    
    eventSub.on('channel.channel_points_custom_reward_redemption.add', async function({ payload }){
        let reward = payload.event.reward
        let redeemer = {
            display_name: payload.event.user_name,
            login: payload.event.user_login,
            id: payload.event.user_id,
            user_input: payload.event.user_input
        }
        let tUser = await Kiwisbot.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, redeemer.login)
        let rewardData = {redeemer: redeemer, reward: reward, user: tUser}
        socket.emit('Twitch', ['channel.channel_points_custom_reward_redemption.add', rewardData])    
        console.log('channel.channel_points_custom_reward_redemption.add', payload.event.reward.type)
        ChannelPointCustomRedemption(rewardData)
    });
    eventSub.on('channel.channel_points_automatic_reward_redemption.add', function({ payload }){
        console.log(colors.green('[Points]'), `<${payload.event.reward.type}> Cost:(${payload.event.reward.channel_points})`, payload.event.user_name)
        socket.emit('Twitch', ['channel.channel_points_automatic_reward_redemption.add', payload])
        ChannelPointAutoRedemption(payload)
    });
    // Update System //
    setInterval(async () => {        
        Creds = await Kiwisbot.initData(dbdeets);
        OwnerBot.owner = await Kiwisbot.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.auth.username)
        OwnerBot.bot = await Kiwisbot.fetchUserByName(Creds.auth.client_id, Creds.tokens.access_token, Creds.botauth.username)
        OwnerChannel = await Kiwisbot.InitTwitchStream(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
        OwnerAds = await Kiwisbot.fetchAdsSchedule(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)        
        let stringusers = ''
        Chatters = await Kiwisbot.getChatters(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
        for (let index = 0; index < Chatters.length; index++) {
            const element = Chatters[index];
            stringusers += `${element.user_name} `
        }
        console.log(colors.gray('[Users]'), `${stringusers}` )
        if (OwnerAds.preroll_free_time<=900){
            let ac = await Kiwisbot.RunAds(Creds.auth.client_id, Creds.tokens.access_token, OwnerBot.owner.id)
            console.log('ac', ac)
            if (ac[0] == 'Ads'){
                let adsStr = `Ads are Playing! Kiwisbot Runs between 1-2 minutes worth of ads every 20 mins to scare away Prerolls! I dont trigger them just to annoy you!!  miketh101Heart Thanks for your Patience!  miketh101Heart`
                Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, adsStr)
                let nextRuntime = Date.now()+(ac[2][0].retry_after*1000) //date.now+480000 == future tiume
                let adtimer = (ac[2][0].length*1000) //90000
                let dd = new Date(nextRuntime)
                console.log(colors.gray('[Ads]'),`Running Ads`, ac[2][0].length, `Safe Ad Reload: ${dd}`)
                socket.emit('Twitch', ['Ads', adtimer])
                let notifyadend = setTimeout(async () => {
                    let adsStr = `Ads should be over. (${ac[2][0].length}seconds). Welcome Back!`;
                    await Kiwisbot.SayInChat(Creds.botauth.client_id, Creds.bottokens.access_token, OwnerBot.owner.id, OwnerBot.bot.id, adsStr);
                }, adtimer);
            }
            if (ac[0] == 'NextRun'){
                if (ac[2] < 5){
                    console.log(colors.cyan('[Ad Incoming]'), ac)
                }              
            }
        }else{
            // console.log('ads', OwnerChannel, OwnerAds)
            if (OwnerAds.preroll_free_time <= 1080){
                console.log(colors.cyan('[Ad Incoming]'), (OwnerAds.preroll_free_time-900))
            }else{
                let prtimeclean = Math.floor((OwnerAds.preroll_free_time/60))
                let unixtsdate = OwnerAds.next_ad_at*1000;
                let nextad = new Date(unixtsdate);
                let nextaddiff = (((unixtsdate - Date.now())/1000)/60)
                let ndr = Math.round(nextaddiff)
                console.log(colors.gray('[Ads]'),`Ad Free for: ${ndr} Mins. Preroll Free: ${prtimeclean} Mins.`)
            }
        }
        //
    }, 30000);
    //
}, 500);