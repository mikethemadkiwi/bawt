const socket = io();
//
async function CustomRewards(rewardData){
    // console.log('Twitch', rewardData.reward.title, rewardData)
    switch(rewardData.reward.title){
        case 'Travel-Home':
            console.log('Travel-Home')
        break;
        default:
    }
}
//
socket.on("Twitch", async (twitchObj) => {
    switch(twitchObj[0]){
        case 'channel.channel_points_custom_reward_redemption.add':
            CustomRewards(twitchObj[1])
        break;
        default:
    }
})
//
socket.on("GameEngine", async (gameObj) => {
    console.log("GameEngine", gameObj)
    // let eventType = gameObj[0]
    // bSpaceObjs = gameObj[1]
    // PlayerObjs = gameObj[2]    
});
////////////////////////////////////////////////////////////////
let gameCanvas = document.getElementById('gameContainer');
let topCanvas = document.getElementById('topCanvas');
let bottomCanvas = document.getElementById('bottomCanvas');
var ctx = gameCanvas.getContext("2d");
var ctxtop = topCanvas.getContext("2d");
var ctxbottom = bottomCanvas.getContext("2d");
gameCanvas.oncontextmenu = handler;
topCanvas.oncontextmenu = handler;
bottomCanvas.oncontextmenu = handler;
var tarFps = 1000 / 60; // 1 second divided by how many frames per second.
var tps = 10; // 2 descisions to each frame
////////////////////////////////////////////////////////////////
class UniverseClass {
    RenderFrame = async function(universeObj){
        let offsetx = viewer.window.hw - viewer.actpos.x;
        let offsety = viewer.window.hh - viewer.actpos.y;
        
    }
    UpdateTick = async function(universeObj){
        
    }
}
class PlayerClass {
    RenderFrame = async function(playerObj){
        let offsetx = viewer.window.hw - viewer.actpos.x;
        let offsety = viewer.window.hh - viewer.actpos.y;
        
    }
    UpdateTick = async function(playerObj){
        
    }
}
////////////////////////////////////////////////////////////////
//
const bSpaceObjs = []
const PlayerObjs = []
//
var viewer = {
    window: { w: window.innerWidth, h: window.innerHeight, hw: 0, hh: 0 },
    tarpos: { x: 0, y: 0, z: 0 },
    actpos: { x: 0, y: 0, z: 0 },
    frame: { framecurrent: 0, frametotal: 0, framepersec: 0},
    tick: { tickcurrent: 0, ticktotal: 0, tickpersec: 0 },
}
//
function resizelayout() {
    viewer.window.w = window.innerWidth;
    viewer.window.h = window.innerHeight;
    viewer.window.hw = window.innerWidth / 2;
    viewer.window.hh = window.innerHeight / 2;
    gameCanvas.width = viewer.window.w;
    topCanvas.width = viewer.window.w;
    bottomCanvas.width = viewer.window.w;
    gameCanvas.height = viewer.window.h;
}
//
window.onload = function () {
    resizelayout();
};
//
window.onresize = function () {
    resizelayout();
}
//
function handler(event) {
    event = event || window.event;
    if (event.stopPropagation)
        event.stopPropagation();
    event.cancelBubble = true;
    return false;
}
//
function newImage(src){
    let tmp = new Image();
    tmp.src = src;
    return tmp
}
//
function IsInArray(array, ID){
    return new Promise((resolve, reject) => {
        let isin = array.map(function(obj) { return obj.id; }).indexOf(ID)
        resolve(isin)
    })
}
//
update = setInterval(function () {
    PlayerObjs.forEach(pObj => {
        PlayerClass.UpdateTick(pObj);
    });
    bSpaceObjs.forEach(bsObj => {
        UniverseClass.UpdateTick(bsObj);
    });
    viewer.tick.tickcurrent++;
    viewer.tick.ticktotal++;
}, tps);
//
render = setInterval(function () {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctxtop.clearRect(0, 0, topCanvas.width, topCanvas.height);
    ctxbottom.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
    /////
    // Debug Objects
    /////
    bSpaceObjs.forEach(bsObj => {
        UniverseClass.RenderFrame(bsObj, offsetx, offsety);
    });
    PlayerObjs.forEach(pObj => {
        PlayerClass.RenderFrame(pObj, offsetx, offsety);
    });
    ////
    ctxtop.font = '12px Lucida Console';
    ctxtop.fillStyle = '#bada55';
    ctxtop.fillText('TwitchGame', 10, 22);
    //

    //    
    ctxbottom.font = '12px Lucida Console';
    ctxbottom.fillStyle = '#bada55';
    ctxbottom.fillText('TPS| av:' + viewer.tick.tickpersec + ' current:' + viewer.tick.tickcurrent + ' total:' + viewer.tick.ticktotal, 10, 22);
    ctxbottom.fillText('Res|' + viewer.window.w + 'x' + viewer.window.h + ' (Midpoint:' + viewer.window.hw + 'x' + viewer.window.hh + ')| FPS| av:' + viewer.frame.framepersec + ' current: ' + viewer.frame.framecurrent + ' total: ' + viewer.frame.frametotal + ' | ', 10, 37);
   viewer.frame.framecurrent++;
   viewer.frame.frametotal++;
}, tarFps);

persec = setInterval(function () {
    viewer.frame.framepersec = viewer.frame.framecurrent;
    viewer.frame.framecurrent = 0;
    viewer.tick.tickpersec = viewer.tick.tickcurrent;
    viewer.tick.tickcurrent = 0;
}, 1000);