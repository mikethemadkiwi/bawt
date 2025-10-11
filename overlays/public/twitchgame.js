////////////////////////////////////////////////////////////////
let gameCanvas = document.getElementById('gameContainer');
let topCanvas = document.getElementById('topCanvas');
let bottomCanvas = document.getElementById('bottomCanvas');
var ctx = gameCanvas.getContext("2d");
var ctxtop = topCanvas.getContext("2d");
var ctxbottom = bottomCanvas.getContext("2d");
var tarFps = 1000 / 60; // 1 second divided by how many frames per second.
var tps = 10; // 2 descisions to each frame
const bSpaceObjs = []
const PlayerObjs = []
const imageObjs = []
//
var viewer = {
    window: { w: window.innerWidth, h: window.innerHeight, hw: 0, hh: 0 },
    tarpos: { x: 0, y: 0, z: 0 },
    actpos: { x: 0, y: 0, z: 0 },
    frame: { framecurrent: 0, frametotal: 0, framepersec: 0},
    tick: { tickcurrent: 0, ticktotal: 0, tickpersec: 0 },
}
////////////////////////////////////////////////////////////////
class UniverseClass {
    CreateObject = async function(universeObj, img){ 
        let tmpObj = {
            id: universeObj.name,
            name: universeObj.name,            
            img: img,
            type: universeObj.type,
            size: universeObj.size,
            actpos: {
                x:universeObj.x,
                y:universeObj.y,
                z:0,
                bubble: 0
            },
            tarpos: {
                x:universeObj.x,
                y:universeObj.y,
                z:0,
                bubble: 0
            },
            resourceStr: '',
            resources: universeObj.resources
        }
        bSpaceObjs.push(tmpObj)
    }
    UpdateObject = async function(universeObj, Uexists){
        bSpaceObjs[Uexists].type = universeObj.type;
        bSpaceObjs[Uexists].size = universeObj.size;
        bSpaceObjs[Uexists].resources = universeObj.resources;
        bSpaceObjs[Uexists].tarpos.x = universeObj.x;
        bSpaceObjs[Uexists].tarpos.y = universeObj.y;
        bSpaceObjs[Uexists].resourceStr = ''
        bSpaceObjs[Uexists].resources.forEach(resource => {
            bSpaceObjs[Uexists].resourceStr+=`${resource.name}: ${resource.amount} `
        });
    }
    RenderFrame = async function(universeObj){
        let offsetx = viewer.window.hw - viewer.actpos.x;
        let offsety = viewer.window.hh - viewer.actpos.y;
        let radius = universeObj.size / 2;
        ctx.font = '10px Arial';
        ctx.fillStyle = '#bada55';
        ctx.fillText(`${universeObj.name} [ Resources: ${universeObj.resourceStr} ] `, (offsetx + universeObj.actpos.x - radius), (offsety + universeObj.actpos.y - 15 - radius));
        ctx.drawImage(universeObj.img, (offsetx + universeObj.actpos.x - radius), (offsety + universeObj.actpos.y - radius), universeObj.size, universeObj.size);        
    }
    UpdateTick = async function(universeObj){
        let diffX = universeObj.actpos.x - universeObj.tarpos.x; 
        let diffY = universeObj.actpos.y - universeObj.tarpos.y; 
        let diffZ = universeObj.actpos.z - universeObj.tarpos.z;
        if(diffX>0.01){
            universeObj.actpos.x = universeObj.actpos.x-0.1
        }
        if(diffX<-0.01){
            universeObj.actpos.x = universeObj.actpos.x+0.1
        }
        if(diffY>0.01){
            universeObj.actpos.y = universeObj.actpos.y-0.1
        }
        if(diffY<-0.01){
            universeObj.actpos.y = universeObj.actpos.y+0.1
        }
    }
}
class PlayerClass {
    CreatePlayer = async function(playerObj, img){
        let tmpObj = {
            id: playerObj.twitchid,
            name: playerObj.name,            
            img: img,
            task: playerObj.task,
            size: 25,
            actpos: {
                x:playerObj.actposx,
                y:playerObj.actposy,
                z:0,
                bubble: 0
            },
            tarpos: {
                x:playerObj.tarposx,
                y:playerObj.tarposy,
                z:0,
                bubble: 0
            }
        }
        PlayerObjs.push(tmpObj)
    }
    UpdatePlayer = async function(playerObj, Uexists){
        PlayerObjs[Uexists].tarpos = {
            x:playerObj.tarposx,
            y:playerObj.tarposy,
            z:0,
            bubble: 0
        }
    }
    RenderFrame = async function(playerObj){
        let offsetx = viewer.window.hw - viewer.actpos.x;
        let offsety = viewer.window.hh - viewer.actpos.y;
        let radius = playerObj.size / 2;
        ctx.font = '10px Arial';
        ctx.fillStyle = '#bada55';
        // ctx.fillText(`${playerObj.name} [ ${playerObj.actpos.x} / ${playerObj.actpos.y} ] `, (offsetx + playerObj.actpos.x - radius), (offsety + playerObj.actpos.y - 15 - radius));
        ctx.drawImage(playerObj.img, (offsetx + playerObj.actpos.x - radius), (offsety + playerObj.actpos.y - radius), playerObj.size, playerObj.size);
        
    }
    UpdateTick = async function(playerObj){
        // console.log(playerObj.actpos, playerObj.tarpos)
        let diffX = playerObj.actpos.x - playerObj.tarpos.x; 
        let diffY = playerObj.actpos.y - playerObj.tarpos.y; 
        let diffZ = playerObj.actpos.z - playerObj.tarpos.z;
        if(diffX>0.01){
            playerObj.actpos.x = playerObj.actpos.x-0.1
        }
        if(diffX<-0.01){
            playerObj.actpos.x = playerObj.actpos.x+0.1
        }
        if(diffY>0.01){
            playerObj.actpos.y = playerObj.actpos.y-0.1
        }
        if(diffY<-0.01){
            playerObj.actpos.y = playerObj.actpos.y+0.1
        }
    }
}
let uClass = new UniverseClass;
let pClass = new PlayerClass;
////////////////////////////////////////////////////////////////
const socket = io();
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
    // console.log("GameEngine", gameObj)
    // let eventType = gameObj[0]
    // let eventdata = gameObj[1]
    switch(gameObj[0]){
        case 'universe:update':
            gameObj[1].forEach(async uniObj => {
                let Uexists = await IsInArray(bSpaceObjs, uniObj.name)
                if(Uexists == -1){
                    let tmpImg = new Image()
                    tmpImg.src = uniObj.imgsrc;                    
                    uClass.CreateObject(uniObj, tmpImg)
                }
                else{
                    // console.log('Existing space obj:', bSpaceObjs[Uexists].name)  
                    uClass.UpdateObject(uniObj, Uexists)   
                }       
            });
        break;
        case 'player:update':
            gameObj[1].forEach(async pObj => {
                let Uexists = await IsInArray(PlayerObjs, pObj.twitchid)
                if(Uexists == -1){
                    let tmpImg = new Image()
                    tmpImg.src = pObj.profile;
                    pClass.CreatePlayer(pObj, tmpImg)
                }
                else{
                    // console.log('Existing User', pObj.twitchid)  
                    pClass.UpdatePlayer(pObj, Uexists)      
                }        
            });
        break;
        default:
    }
});
////////////////////////////////////////////////////////////////
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
async function CustomRewards(rewardData){
    // console.log('Twitch', rewardData.reward.title, rewardData)
    // switch(rewardData.reward.title){
    //     case 'Travel-Home':
    //         console.log('Travel-Home')
    //     break;
    //     default:
    // }
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
////////////////////////////////////////////////////////////////
window.onload = function () {
    resizelayout();
};
//
window.onresize = function () {
    resizelayout();
}
gameCanvas.oncontextmenu = handler;
topCanvas.oncontextmenu = handler;
bottomCanvas.oncontextmenu = handler;
////////////////////////////////////////////////////////////////
update = setInterval(function () {
    bSpaceObjs.forEach(bsObj => {
        uClass.UpdateTick(bsObj);
    });
    PlayerObjs.forEach(pObj => {
        pClass.UpdateTick(pObj);
    });
    viewer.tick.tickcurrent++;
    viewer.tick.ticktotal++;
}, tps);
//
render = setInterval(function () {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    ctxtop.clearRect(0, 0, topCanvas.width, topCanvas.height);
    ctxbottom.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
    //
    bSpaceObjs.forEach(bsObj => {
        uClass.RenderFrame(bsObj);
    });
    PlayerObjs.forEach(pObj => {
        pClass.RenderFrame(pObj);
    });
    // top frame
    ctxtop.font = '12px Lucida Console';
    ctxtop.fillStyle = '#bada55';
    ctxtop.fillText('TwitchGame', 10, 22);
    // Bottom frame
    ctxbottom.font = '12px Lucida Console';
    ctxbottom.fillStyle = '#bada55';
    ctxbottom.fillText('TPS| av:' + viewer.tick.tickpersec + ' current:' + viewer.tick.tickcurrent + ' total:' + viewer.tick.ticktotal, 10, 22);
    ctxbottom.fillText('Res|' + viewer.window.w + 'x' + viewer.window.h + ' (Midpoint:' + viewer.window.hw + 'x' + viewer.window.hh + ')| FPS| av:' + viewer.frame.framepersec + ' current: ' + viewer.frame.framecurrent + ' total: ' + viewer.frame.frametotal + ' | ', 10, 37);
    //
    viewer.frame.framecurrent++;
    viewer.frame.frametotal++;
}, tarFps);
//
persec = setInterval(function () {
    viewer.frame.framepersec = viewer.frame.framecurrent;
    viewer.frame.framecurrent = 0;
    viewer.tick.tickpersec = viewer.tick.tickcurrent;
    viewer.tick.tickcurrent = 0;
}, 1000);