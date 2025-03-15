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
//
var viewer = {
    window: { w: window.innerWidth, h: window.innerHeight, hw: 0, hh: 0 },
    tarpos: { x: 0, y: 0, z: 0 },
    actpos: { x: 0, y: 0, z: 0 },
    frame: { framecurrent: 0, frametotal: 0, framepersec: 0},
    tick: { tickcurrent: 0, ticktotal: 0, tickpersec: 0 },
};

function resizelayout() {
    viewer.window.w = window.innerWidth;
    viewer.window.h = window.innerHeight;
    viewer.window.hw = window.innerWidth / 2;
    viewer.window.hh = window.innerHeight / 2;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    console.log(canvas.height, canvas.width, `h:${viewer.window.h} w:${viewer.window.w} hh:${viewer.window.hh} hw: ${viewer.window.hw}`)
};
//
window.onload = function () {
    resizelayout();
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
const ImageFarm = [];
ImageFarm["BG"] = './img/background.png';
ImageFarm["hero"] = './img/hero.png';

//
const PlayFeilds = [];
const Players = [];
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
            height: (canvas.height/10),
            actpos: {
                x:0,
                y:(canvas.height - (canvas.height/10)),
                z:0,
                bubble: 0
            }
        }
        this.UpdateMe = async function() {
            this.uObj.width = canvas.width;
            this.uObj.height = (canvas.height/10);
            this.uObj.actpos.y = (canvas.height - (canvas.height/10))
        }
        this.RenderMe = function() {
            ctx.drawImage(this.img, (this.uObj.actpos.x), (this.uObj.actpos.y), this.uObj.width, this.uObj.height);
        }
    }
}
//
update = setInterval(function () {


    PlayFeilds.forEach(bsObj => {
        bsObj.UpdateMe();
    });

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

    let imagePosH = 10;
    Players.forEach(bsObj => {
        let cuImg = new Image;
        cuImg.src = bsObj.profile_image_url;
        let midfeild = ((canvas.height/10)/2)
        let playerpos = (canvas.height - midfeild)
        ctx.drawImage(cuImg, imagePosH-5, playerpos, 10, 10);
        imagePosH = (imagePosH + 40);
    });

    ////
    if (debugshow == true) {
        ctx.font = '12px Lucida Console';
        ctx.fillStyle = '#cccccc';
        ctx.fillText('twitch game', 10, 22);
        ctx.fillText('TPS| av:' + viewer.tick.tickpersec + ' current:' + viewer.tick.tickcurrent + ' total:' + viewer.tick.ticktotal, 10, 40);
        ctx.fillText('Res|' + viewer.window.w + 'x' + viewer.window.h + ' (Midpoint:' + viewer.window.hw + 'x' + viewer.window.hh + ')| FPS| av:' + viewer.frame.framepersec + ' current: ' + viewer.frame.framecurrent + ' total: ' + viewer.frame.frametotal + ' | ', 10, 58);
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
socket.on('twitchgameusers', async function(msgData) { 
    let isin = Players.map(function(obj) { return obj.id; }).indexOf(msgData.id)
    if(isin == -1) {
        console.log(`twitchUser`, msgData)
        Players.push(msgData)
    }
    else {
        console.log('user is already a pleb')
    }
});

//
let bg = new Image;
bg.src = ImageFarm['BG'];
PlayFeilds[0] = new Playfeild('BG', 0, bg)


/// during ads, mobs attack village all of the players defend. if they win, xp loot, hand jobs
/// they fail, obviously town is ransacked, they must rebuild (figure that part out later)

/// during non ad periods, you can challenge each other for xp and rep.
/// training can guarantee stat gain, but locks out rep and xp.
/// only one option per round is available.

/// players that dont select gain 1/10th of xp from raid.