const socket = io(); // Socket.io
const shoutList = [];
const sCanvas = document.getElementById('shoutCanvas');
const ctx = sCanvas.getContext("2d");
const Loop = {
    tick: 10,
    draw: (1000/60)
}
var tarFps = 1000 / 60; // 1 second divided by how many frames per second.
var tps = 10; // 2 descisions to each frame
const windowSize = {
    w: 0,
    h: 0,
    hw: 0,
    hh: 0
}
let imgSize = 100;
function resizelayout() {
    windowSize.w = window.innerWidth;
    windowSize.h = window.innerHeight;
    windowSize.hw = (windowSize.w / 2);
    windowSize.hh = (windowSize.h / 2);
    sCanvas.width = windowSize.w;
    sCanvas.height = windowSize.h;
    console.log(`h:${windowSize.h} w:${windowSize.w} hh:${windowSize.hh} hw: ${windowSize.hw}`)
};
function randoFromTo(from, to){    
    return Math.floor(Math.random() * to) + from;
}
//
window.onload = function () {
    resizelayout();
};
//
window.onresize = function () {
    resizelayout();
};
function newImage(src){
    let tmp = new Image();
    tmp.src = src;
    return tmp
}
class shoutPacket {
    constructor(id, redeemer, reward, user, tarGPS) {
        this.id = id
        this.redeemer = redeemer;
        this.reward = reward;
        this.user = user[0]; // note this excludes the user array for the first object.
        this.lastShoutTrigger = (Date.now()+10000);
        this.img = new Image;
        this.img.src = user[0]['profile_image_url'];
        this.GPS = {
            current:{x:0,y:0,z:0},
            target:{x:tarGPS.x,y:tarGPS.y,z:tarGPS.z}
        }
        this.Tick = function(){
            if(this.lastShoutTrigger<=Date.now()){
                console.log('i should go')
                let slUser = shoutList.map(function(sPUser) { return sPUser.id; }).indexOf(this.id);
                shoutList.splice(slUser, 1);
            }
            else{
                this.GPS.current.x = (this.GPS.current.x + this.GPS.target.x)
                this.GPS.current.y = (this.GPS.current.y + this.GPS.target.y)
                this.GPS.current.z = (this.GPS.current.z + this.GPS.target.z)
                let nDate = (this.lastShoutTrigger - Date.now())
                console.log(`shoutout from ${this.id} @ [${nDate}]`)
            }
        }
        this.Draw = function(){
            let offsetx = windowSize.hw + this.GPS.current.x;
            let offsety = windowSize.hh + this.GPS.current.y;
            ctx.drawImage(this.img, offsetx - (imgSize/2), offsety - (imgSize/2), imgSize, imgSize);
        }
    }
}

socket.on('ShoutOut', function(msgData) {
    console.log(`ShoutOut`, msgData)
    let tmpGPS = {x:randoFromTo(-3, 3), y:randoFromTo(-3, 3), z:randoFromTo(-3, 3)} 
    let sP = new shoutPacket(msgData.redeemer.id, msgData.redeemer,msgData.reward, msgData.user, tmpGPS)
    shoutList.push(sP)
});

const TickLoop = setInterval(() => {
    if(shoutList[0]!=null){
        shoutList.forEach(shoutOut => {
            shoutOut.Tick();
        });
    }
}, Loop.tick);
const DrawLoop = setInterval(() => {
    ctx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    if(shoutList[0]!=null){
        shoutList.forEach(shoutOut => {
            shoutOut.Draw();
        });
    }
}, Loop.draw);