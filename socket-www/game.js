const bigBang = new Date();
console.log('Setting Up Playfeild', bigBang)
const socket = io(); // Socket.io
///////
var debugshow = true;
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext("2d");
canvas.oncontextmenu = handler;
var tarFps = 1000 / 60; // 1 second divided by how many frames per second.
var tps = 10; // 2 descisions to each frame

let pfh = 0;
let pfw = 0;
let pft = 0;
let pfvcenter = 0;
let pfhcenter = 0;
let pfb = 0;
//
var viewer = {
    window: { w: window.innerWidth, h: window.innerHeight, hw: 0, hh: 0 },
    tarpos: { x: 0, y: 0, z: 0 },
    actpos: { x: 0, y: 0, z: 0 },
    frame: { framecurrent: 0, frametotal: 0, framepersec: 0},
    tick: { tickcurrent: 0, ticktotal: 0, tickpersec: 0 },
};
//
function resizelayout() {
    viewer.window.w = window.innerWidth;
    viewer.window.h = window.innerHeight;
    viewer.window.hw = window.innerWidth / 2;
    viewer.window.hh = window.innerHeight / 2;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    console.log(canvas.height, canvas.width, `h:${viewer.window.h} w:${viewer.window.w} hh:${viewer.window.hh} hw: ${viewer.window.hw}`)

    pfh = (canvas.height/10)
    pfw = (canvas.width)
    pft = (canvas.height - pfh)
    pfvcenter = ((canvas.height/10)/2)
    pfhcenter = (canvas.width/2)
    pfb = (canvas.height)

    console.log(`playfeildsize: ${pfw}X${pfh} top: ${pft} bottom: ${pfb}` )
};
//
window.onload = function () {
    resizelayout();
    socket.emit("playerlist", "request", (response) => {
        console.log(response); // "got it"
      });
};
//
window.onresize = function () {
    resizelayout();
};
//
function handler(event) {
    event = event || window.event;
    if (event.stopPropagation)
        event.stopPropagation();
    event.cancelBubble = true;
    return false;
};
//
function randoFromTo(from, to){    
    return Math.floor(Math.random() * to) + from;
}

/////////////////////////
const ImageFarm = [];
ImageFarm["BG"] = './img/background.png';
ImageFarm["townhall"] = './img/village.jpg';
ImageFarm["mines"] = './img/mines.png';
ImageFarm["training"] = './img/arena.png';
ImageFarm["hero"] = './img/hero.png';
ImageFarm['fortifications'] = './img/fort.png';
//
function imagefromfarm(name){
    let tImg = new Image;
    tImg.src = ImageFarm[name];
    return tImg;
}
/////////////////////////

//
const PlayFeilds = [];
const Players = [];
const Locations = [];
const BattleQueue = [];

//
class Playfeild {
    constructor(ObjName, type, img) {
        this.id = ObjName
        this.img = img;
        this.uObj = {
            id: ObjName,
            name: ObjName,
            type: type,
            width: canvas.width,
            height: canvas.height,
        }
        this.UpdateMe = async function() {

        }
        this.RenderMe = function() {
            ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
            //render player entry portal.
        }
    }
}
//
class PlayLocation {
    constructor(label, img, size, x, y) {
        this.label = label;
        this.img = img;
        this.size = size;
        this.actpos = { x:x, y:y };
        this.tarpos = { x:x, y:y };
        this.UpdateMe = function() {

        }
        this.RenderMe = function() {            
            ctx.font = '12px Lucida Console';
            ctx.fillStyle = '#000000';
            ctx.fillText(this.label, (this.actpos.x-(this.size/2)), ((this.actpos.y-(this.size/2))-10));
            ctx.drawImage(this.img, (this.actpos.x - (this.size/2)), (this.actpos.y - (this.size/2)), this.size, this.size);
        }
    }
}
//
class Player {
    constructor(twitchid, tuser, bubble, actposx, actposy, tarposx, tarposy, profile) {
        this.twitchid = twitchid;
        this.twitch = tuser;
        this.img = new Image;
        this.img.src = profile;
        this.size = 20;
        this.bubble = bubble;
        this.actpos = { x:actposx, y:actposy };
        this.tarpos = { x:tarposx, y:tarposy };
        this.idleWander = true;
        this.UpdateMe = function() {
            if (this.img.src != profile){
                this.img.src = profile;
            }
            let diffX = (this.actpos.x-this.tarpos.x);
            let diffY = (this.actpos.y-this.tarpos.y);
            this.idleWander = true;
            if (diffX>50){ 
                this.actpos.x = (this.actpos.x - 1)
                this.idleWander = false;
            }
            if (diffX<-50){ 
                this.actpos.x = (this.actpos.x + 1)
                this.idleWander = false;
            }
            if (diffY>50){ 
                this.actpos.y = (this.actpos.y - 1)
                this.idleWander = false;
            }
            if (diffY<-50){ 
                this.actpos.y = (this.actpos.y + 1)
                this.idleWander = false;
            }
            if (this.idleWander == true){
                const randomValw = Math.random();
                const randomValh = Math.random();
                const widthDir = randomValw < 0.5 ? 1 : -1;
                const heightDir = randomValh < 0.5 ? 1 : -1;
                if (widthDir == -1){
                    // move -x
                    let nextX = (this.actpos.x - 1)
                    if (nextX>0) {
                        this.actpos.x = nextX;
                    }
                }
                if (widthDir == 1){
                    // move +x
                    let nextX = (this.actpos.x + 1)
                    if (nextX<canvas.width) {
                        this.actpos.x = nextX;
                    }
                }        
                if (heightDir == -1){
                    // move -y
                    let nextY = (this.actpos.y - 1)
                    if (nextY>0) {
                        this.actpos.y = nextY;
                    }
                }
                if (heightDir == 1){
                    // move +y
                    let nextY = (this.actpos.y + 1)
                    if (nextY<canvas.width) {
                        this.actpos.y = nextY;
                    }
                }
            }
        }
        this.RenderMe = function() {
            if (debugshow == true) {
                ctx.font = '12px Lucida Console';
                ctx.fillStyle = '#000000';
                if (this.idleWander == true){
                    ctx.fillText('Idle', (this.actpos.x-(this.size/2)), (this.actpos.y-(this.size/2)));
                }
                else{
                    ctx.fillText('Pathing', (this.actpos.x-(this.size/2)), (this.actpos.y-(this.size/2)));
                }
                
            }
            ctx.drawImage(this.img, (this.actpos.x-(this.size/2)), (this.actpos.y-(this.size/2)), this.size, this.size);
        }
    }
}



//
let bg = new Image;
bg.src = ImageFarm['BG'];
let th = new Image;
th.src = ImageFarm['townhall'];
let ms = new Image;
ms.src = ImageFarm['mines'];
let tr = new Image;
tr.src = ImageFarm['training'];
let fr = new Image;
fr.src = ImageFarm['fortifications'];
//
PlayFeilds[0] = new Playfeild('BG', 0, bg)
//
Locations[0] = new PlayLocation('Town of Madhaus', th, 100, 150, 150)
Locations[1] = new PlayLocation('Fartington Mines', ms, 50, 850, 250)
Locations[2] = new PlayLocation('Freds Training', tr, 50, 550, 400)
Locations[3] = new PlayLocation('Fortifications', fr, 50, 1024, 600)


//
update = setInterval(function () {
    //playfeild
    PlayFeilds.forEach(bsObj => {
        bsObj.UpdateMe();
    });
    //
    Locations.forEach(bsObj => {
        bsObj.UpdateMe();
    });
    //
    Players.forEach(bsObj => {
        bsObj.UpdateMe();
    })
    viewer.tick.tickcurrent++;
    viewer.tick.ticktotal++;
}, tps);

//
render = setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    /////
    // Debug Objects
    /////
    PlayFeilds.forEach(bsObj => {
        bsObj.RenderMe();
    });
    //
    Locations.forEach(bsObj => {
        bsObj.RenderMe();
    });
    //
    Players.forEach(bsObj => {
        bsObj.RenderMe();
    });
    ////
    if (debugshow == true) {
        ctx.font = '12px Lucida Console';
        ctx.fillStyle = '#000000';
        ctx.fillText('twitch game', 50, 22);
        ctx.fillText('TPS| av:' + viewer.tick.tickpersec + ' current:' + viewer.tick.tickcurrent + ' total:' + viewer.tick.ticktotal, 50, 40);
        ctx.fillText('Res|' + viewer.window.w + 'x' + viewer.window.h + ' (Midpoint:' + viewer.window.hw + 'x' + viewer.window.hh + ')| FPS| av:' + viewer.frame.framepersec + ' current: ' + viewer.frame.framecurrent + ' total: ' + viewer.frame.frametotal + ' | ', 50, 58);
    }
   viewer.frame.framecurrent++;
   viewer.frame.frametotal++;
}, tarFps);

persec = setInterval(function () {
    
    viewer.frame.framepersec = viewer.frame.framecurrent;
    viewer.frame.framecurrent = 0;
    viewer.tick.tickpersec = viewer.tick.tickcurrent;
    viewer.tick.tickcurrent = 0;
}, 1000);

socket.on('gamedebug', async function(msgData) { 
    console.log(`gamedebug`, msgData)
});
socket.on('Ads', async function(msgData) { 
    console.log(`Ads`, msgData)
});
socket.on('twitchgameusers', async function(msgData) {
    console.log(msgData)
    let isin = Players.map(function(obj) { return obj.twitchid; }).indexOf(msgData.twitchid)
    if(isin == -1) {
        let w2 = (canvas.width/2) 
        let h2 = (canvas.height/2) 
        let cuPObj = new Player(msgData.twitchid, msgData.tuser, msgData.bubble, msgData.actposx, msgData.actposy, msgData.tarposx, msgData.tarposy, msgData.profile)
        Players.push(cuPObj)
        console.log(`New`, cuPObj)
    }
    else {
        Players[isin].twitch = msgData.tuser;
        console.log(`Existing`, Players[isin])
    }
});


socket.on('newplayertarget', async function(msgData) {
    let isin = Players.map(function(obj) { return obj.twitchid; }).indexOf(msgData.twitchid)
    if(isin == -1) {
    }
    else {
        // Players[isin].twitch = msgData[0];
        // Players[isin].api = msgData[1];
        // console.log('loc',Players[isin].api.display_name, Players[isin].twitch.loc)
        Players[isin].tarpos.x = msgData.tarposx
        Players[isin].tarpos.y = msgData.tarposy
    }
});

/// during ads, mobs attack village all of the players defend. if they win, xp loot, hand jobs
/// they fail, obviously town is ransacked, they must rebuild (figure that part out later)

/// during non ad periods, you can challenge each other for xp and rep.
/// training can guarantee stat gain, but locks out rep and xp.
/// only one option per round is available.

/// players that dont select gain 1/10th of xp from raid.