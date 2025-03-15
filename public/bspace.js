const socket = io(); // Socket.io
///////
var debugshow = true;
var canvas = document.getElementById('mainCanvas');
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
    canvas.width = viewer.window.w;
    canvas.height = viewer.window.h;
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
function newImage(src){
    let tmp = new Image();
    tmp.src = src;
    return tmp
}
function IsInArray(array, ID){
    return new Promise((resolve, reject) => {
        let isin = array.map(function(obj) { return obj.id; }).indexOf(ID)
        resolve(isin)
    })
}
//
const bSpaceObjs = []
const PlayerObjs = []
//
class PlayerObj {
    constructor(player) {
        this.id = player.user.id;
        this.img = new Image;
        this.img.src = './img/hero.png';
        // this.img.src = player.user.profile_image_url
        this.player = player;
        this.actpos = player.actpos;
        this.tarpos = player.tarpos;
        this.radius = 5;
        this.size = 10;
        this.updatePlayer = function(uplayer){
            this.player = uplayer;
            this.actpos = player.actpos;
            this.tarpos = player.tarpos;
        }
        this.RenderMe = async function(offsetx, offsety) {
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ffffcc';           
            if(Number(this.actpos.x) >= Number((offsetx+this.radius))){ 
                //offscreen, delete me
            }
            else if(Number(this.actpos.x) <= Number((-offsetx-this.radius))){
                //offscreen, delete me
            }
            else{
                ctx.fillText(this.player.user.display_name + ' | ' + Math.round(this.actpos.x) + ':' + Math.round(this.actpos.y) + '', (offsetx + this.actpos.x - this.radius), (offsety + this.actpos.y - this.radius - 15));
                ctx.drawImage(this.img, offsetx + this.actpos.x - this.radius, offsety + this.actpos.y - this.radius, this.size, this.size);                
            }
        }
        this.UpdateMe = async function() {
            // this is not graceful movement OR lerping... ffs clean this up
            let diffX = this.actpos.x - this.tarpos.x; 
            let diffY = this.actpos.y - this.tarpos.y; 
            let diffZ = this.actpos.z - this.tarpos.z; 
            if(diffX>0.01){
                this.actpos.x = this.actpos.x-0.01
            }
            if(diffX<-0.01){
                this.actpos.x = this.actpos.x+0.01
            }
            if(diffY>0.01){
                this.actpos.y = this.actpos.y-0.01
            }
            if(diffY<-0.01){
                this.actpos.y = this.actpos.y+0.01
            }
            // if(this.actpos.x<this.tarpos.x){
            //     this.actpos.x+0.01
            // }
            // if(this.actpos.y>this.tarpos.y){
            //     this.actpos.y-0.01
            // }
            // if(this.actpos.y<this.tarpos.y){
            //     this.actpos.y+0.01
            // }
            // this.actpos.x= this.actpos.x-0.01;
        }
    }
}
class UniverseObj {
    constructor(ObjName, type, img, size, x, y, z, bub, resources, aResources) {
        this.id = ObjName
        this.img = img;
        this.uObj = {
            id: ObjName,
            name: ObjName,
            type: type,
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
            availableResources: aResources
        }
        this.updateValues = function(msgData) {
            this.uObj.actpos = msgData.actpos
            this.uObj.actpos = msgData.actpos
            this.uObj.actpos = msgData.actpos
            this.uObj.resources = msgData.resources
            this.uObj.availableResources = msgData.availableResources
        }
        this.UpdateTick = function(){
        }
        this.RenderMe = function(offsetx, offsety) {
            let radius = this.uObj.size / 2;
            ctx.font = '10px Arial';
            ctx.fillStyle = '#ffffcc';
            let strRes = ''
            this.uObj.resources.forEach(resourceId => {           
                strRes += ` ${resourceId}: { ${this.uObj.availableResources[resourceId]} }`
            });            
            ctx.fillText(`${this.id} [ ${this.uObj.actpos.x} / ${this.uObj.actpos.y} ] ${strRes}`, (offsetx + this.uObj.actpos.x - radius), (offsety + this.uObj.actpos.y - 15 - radius));
            ctx.drawImage(this.img, (offsetx + this.uObj.actpos.x - radius), (offsety + this.uObj.actpos.y - radius), this.uObj.size, this.uObj.size);
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    ctx.fillStyle = '#ffff99';
    ctx.fillText('Bubblespace 0.0.3', 10, 22);
    if (debugshow == true) {
        ctx.font = '12px Lucida Console';
        ctx.fillStyle = '#ffffcc';
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
///////////////////////////////////////////////////////////////////////////////////////
// Sockets
///////////////////////////////////////////////////////////////////////////////////////
socket.on('playerUpdate', async function(msgData) {
    let Uexists = await IsInArray(PlayerObjs, msgData.user.id)
    if(Uexists == -1){
        console.log('Creating User:', msgData)
        PlayerObjs.push(new PlayerObj(msgData))
    }
    else{
        console.log('Existing User', PlayerObjs[Uexists])        
    }
});
socket.on('uObjUpdate', async function(msgData) {
    let Uexists = await IsInArray(bSpaceObjs, msgData.id)
    if(Uexists == -1){
        // console.log('Creating obj:', msgData)
        let tImg = new Image;
        tImg.src = msgData.imgsrc;
        bSpaceObjs.push(new UniverseObj(msgData.name, msgData.type, tImg, msgData.size, msgData.actpos.x, msgData.actpos.y, msgData.actpos.z, msgData.actpos.bubble , msgData.resources, msgData.availableResources))
    }
    else{
        // console.log('Existing Object', bSpaceObjs[Uexists].length)
        // console.log(bSpaceObjs[Uexists].id, bSpaceObjs[Uexists].uObj.resources) 
        bSpaceObjs[Uexists].updateValues(msgData)  
    }
});
socket.on('Dest-Luna', async function(msgData) { 
    let Uexists = await IsInArray(PlayerObjs, msgData[0].id)
    PlayerObjs[Uexists].tarpos.x = msgData[1].x
    PlayerObjs[Uexists].tarpos.y = msgData[1].y
    PlayerObjs[Uexists].tarpos.z = msgData[1].z
    PlayerObjs[Uexists].tarpos.bubble = msgData[1].bubble
    // console.log(`Dest-Luna`, Uexists, msgData)
});
socket.on('Dest-Earth', async function(msgData) { 
    let Uexists = await IsInArray(PlayerObjs, msgData[0].id)
    PlayerObjs[Uexists].tarpos.x = msgData[1].x
    PlayerObjs[Uexists].tarpos.y = msgData[1].y
    PlayerObjs[Uexists].tarpos.z = msgData[1].z
    PlayerObjs[Uexists].tarpos.bubble = msgData[1].bubble
});
socket.on('Dest-Sol', async function(msgData) { 
    let Uexists = await IsInArray(PlayerObjs, msgData[0].id)
    PlayerObjs[Uexists].tarpos.x = msgData[1].x
    PlayerObjs[Uexists].tarpos.y = msgData[1].y
    PlayerObjs[Uexists].tarpos.z = msgData[1].z
    PlayerObjs[Uexists].tarpos.bubble = msgData[1].bubble
    // console.log(`Dest-Sol`, msgData)
});