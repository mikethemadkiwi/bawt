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
let imgSize = 50;

class shoutPacket {
    constructor(id, redeemer, reward, user) {
        this.id = id
        this.redeemer = redeemer;
        this.reward = reward;
        this.user = user[0]; // note this excludes the user array for the first object.
        this.lastShoutTrigger = (Date.now()+10000);
        this.img = new Image();
        this.img.src = user[0]['profile_image_url'];
        this.GPS = {
            current:{x:0,y:0,z:0},
            target:{x:0,y:0,z:0}
        }
        this.Tick = function(){
            if(this.lastShoutTrigger<=Date.now()){
                console.log('i should go')
                let slUser = shoutList.map(function(sPUser) { return sPUser.id; }).indexOf(this.id);
                shoutList.splice(slUser, 1);
            }
            else{
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
    let sP = new shoutPacket(msgData.redeemer.id, msgData.redeemer,msgData.reward, msgData.user)
    shoutList.push(sP)
});

const TickLoop = setInterval(() => {
    windowSize.w = window.innerWidth;
    windowSize.h = window.innerHeight;
    windowSize.hw = (windowSize.w / 2);
    windowSize.hh = (windowSize.h / 2);
    if(shoutList[0]!=null){
        shoutList[0].Tick();
    }
}, Loop.tick);
const DrawLoop = setInterval(() => {
    ctx.clearRect(0, 0, sCanvas.width, sCanvas.height);
    if(shoutList[0]!=null){
        shoutList[0].Draw();
    }
}, Loop.draw);