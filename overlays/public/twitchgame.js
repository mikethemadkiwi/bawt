const socket = io();
//
async function CustomRewards(rewardData){
    // console.log('Twitch', rewardData.reward.title, rewardData)
    switch(rewardData.reward.title){
        case 'Home':
            console.log('Home')
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
    
});
////////////////////////////////////////////////////////////////
let gameCanvas = document.getElementById('gameContainer');
var ctx = gameCanvas.getContext("2d");
gameCanvas.oncontextmenu = handler;
var tarFps = 1000 / 60; // 1 second divided by how many frames per second.
var tps = 10; // 2 descisions to each frame
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
        pObj.UpdateMe();
    });
    bSpaceObjs.forEach(bsObj => {
        bsObj.UpdateTick();
    });

    viewer.tick.tickcurrent++;
    viewer.tick.ticktotal++;
}, tps);
//
render = setInterval(function () {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    var offsetx = viewer.window.hw - viewer.actpos.x;
    var offsety = viewer.window.hh - viewer.actpos.y;
    /////
    // Debug Objects
    /////
    bSpaceObjs.forEach(bsObj => {
        bsObj.RenderMe(offsetx, offsety);
    });
    PlayerObjs.forEach(pObj => {
        pObj.RenderMe(offsetx, offsety);
    });
    ////
    ctx.font = '12px Lucida Console';
    ctx.fillStyle = '#bada55';
    ctx.fillText('Bubblespace 0.0.3', 10, 22);
    // if (debugshow == true) {
        ctx.font = '12px Lucida Console';
        ctx.fillStyle = '#ffffcc';
        ctx.fillText('TPS| av:' + viewer.tick.tickpersec + ' current:' + viewer.tick.tickcurrent + ' total:' + viewer.tick.ticktotal, 10, 40);
        ctx.fillText('Res|' + viewer.window.w + 'x' + viewer.window.h + ' (Midpoint:' + viewer.window.hw + 'x' + viewer.window.hh + ')| FPS| av:' + viewer.frame.framepersec + ' current: ' + viewer.frame.framecurrent + ' total: ' + viewer.frame.frametotal + ' | ', 10, 58);
    // }
   viewer.frame.framecurrent++;
   viewer.frame.frametotal++;
}, tarFps);

persec = setInterval(function () {
    viewer.frame.framepersec = viewer.frame.framecurrent;
    viewer.frame.framecurrent = 0;
    viewer.tick.tickpersec = viewer.tick.tickcurrent;
    viewer.tick.tickcurrent = 0;
}, 1000);