const socket = io(); // Socket.io
const shoutList = [];
const sCanvas = document.getElementById('shoutCanvas');
const ctx = sCanvas.getContext("2d");
const Loop = {
    tick: 1,
    draw: (1000/60)
}
const windowSize = {
    w: 0,
    h: 0,
    hw: 0,
    hh: 0
}
let imgSize = 100;
//
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
window.onresize = function () {
    resizelayout();
};
//
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
                let slUser = shoutList.map(function(sPUser) { return sPUser.id; }).indexOf(this.id);
                shoutList.splice(slUser, 1);
            }
            else{
                this.GPS.current.x = (this.GPS.current.x + this.GPS.target.x)
                this.GPS.current.y = (this.GPS.current.y + this.GPS.target.y)
                this.GPS.current.z = (this.GPS.current.z + this.GPS.target.z)
                if(this.GPS.current.x >= windowSize.hw){
                    this.GPS.target.x = -(this.GPS.target.x)
                }
                if(this.GPS.current.x <= -(windowSize.hw)){
                    this.GPS.target.x = -(this.GPS.target.x)
                }
                if(this.GPS.current.y >= windowSize.hh){
                    this.GPS.target.y = -(this.GPS.target.y)
                }
                if(this.GPS.current.y <= -(windowSize.hh)){
                    this.GPS.target.y = -(this.GPS.target.y)
                }
            }
        }
        this.Draw = function(){
            ctx.font = '36px Lucida Console';
            ctx.fillStyle = '#bada55';
            let offsetx = windowSize.hw + this.GPS.current.x;
            let offsety = windowSize.hh + this.GPS.current.y;
            ctx.fillText(this.redeemer.display_name, offsetx - (imgSize/2), offsety + (imgSize/2) + 20);
            ctx.drawImage(this.img, offsetx - (imgSize/2), offsety - (imgSize/2), imgSize, imgSize);
        }
    }
}
//
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
//
socket.on('ShoutOut', function(msgData) {
    let tmpGPS = {x:randoFromTo(-1, 1), y:randoFromTo(-1, 1), z:randoFromTo(-1, 1)} 
    let sP = new shoutPacket(msgData.redeemer.id, msgData.redeemer,msgData.reward, msgData.user, tmpGPS)
    console.log(`ShoutOut`, sP)
    shoutList.push(sP)
});

socket.on('kiwisdebug', function(msgData) {    
    console.log(msgData.redeemer.id, msgData.redeemer,msgData.reward, msgData.user)
});