const socket = io(); // Socket.io

socket.on('effyou', function(msgData) {
    let video = document.createElement('video');
    video.src = '../video/finger.mp4';
    video.autoplay = true;
    video.controls = false;
    video.muted = false;
    video.height = 480; // 👈️ in px
    video.width = 854; // 👈️ in px
    video.volume = 0.25;
    video.addEventListener("ended", function(){
        console.log('videoended');
        // video = null;
        document.getElementById('vidContainer').innerHTML = null;
    });
    const box = document.getElementById('vidContainer');
    box.appendChild(video);
});
socket.on('dumbanswer', function(msgData) {
    let video = document.createElement('video');
    video.src = '../video/dumbanswer.mp4';
    video.autoplay = true;
    video.controls = false;
    video.muted = false;
    video.height = 480; // 👈️ in px
    video.width = 854; // 👈️ in px
    video.volume = 0.25;
    video.addEventListener("ended", function(){
        console.log('videoended');
        // video = null;
        document.getElementById('vidContainer').innerHTML = null;
    });
    const box = document.getElementById('vidContainer');
    box.appendChild(video);
});
socket.on('totalcunt', function(msgData) {
    let video = document.createElement('video');
    video.src = '../video/totalcunt.mp4';
    video.autoplay = true;
    video.controls = false;
    video.muted = false;
    video.height = 480; // 👈️ in px
    video.width = 854; // 👈️ in px
    video.volume = 0.25;
    video.addEventListener("ended", function(){
        console.log('videoended');
        // video = null;
        document.getElementById('vidContainer').innerHTML = null;
    });
    const box = document.getElementById('vidContainer');
    box.appendChild(video);
});
socket.on('Ads', function(msgData) {
    const box = document.getElementById('AdsContainer');
    let boxinner = `<img src='img/draper.jpg' /><p>Currently Running Ads!</p>`;
    box.innerHTML = boxinner
    //
    let audSrc3 = `../sounds/Morse.ogg`;
    const audio3 = document.createElement('audio');
    audio3.src = audSrc3;
    audio3.autoplay = true;
    audio3.controls = false;
    audio3.muted = false;
    audio3.volume = 0.25;
    audio3.addEventListener("ended", function(){
        console.log('audio3ended');
        document.getElementById('AudContainer').innerHTML = null;
    });
    document.getElementById('AudContainer').innerHTML = null;
    const box2 = document.getElementById('AudContainer');
    box2.appendChild(audio3);
    //
    setTimeout(() => {
        document.getElementById('AdsContainer').innerHTML = null;
    }, 5000);
});
const shoutList = [];
const adList = [];
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


socket.on('BunnySays', function(soundfile) {
    // console.log()
    let audSrc = `../sounds/host/${soundfile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.25;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('AudContainer').innerHTML = null;
    });
    document.getElementById('AudContainer').innerHTML = null;
    const box = document.getElementById('AudContainer');
    box.appendChild(audio);
});

socket.on('Honk', function(soundfile) {
    let audSrc2 = `../sounds/TSYouWhereKickedFromTheServer.mp3`;
    const audio2 = document.createElement('audio');
    audio2.src = audSrc2;
    audio2.autoplay = true;
    audio2.controls = false;
    audio2.muted = false;
    audio2.volume = 0.25;
    audio2.addEventListener("ended", function(){
        console.log('audio2ended');
        document.getElementById('AudContainer').innerHTML = null;
    });
    document.getElementById('AudContainer').innerHTML = null;
    const box = document.getElementById('AudContainer');
    box.appendChild(audio2);
});











socket.on('kiwisdebug', function(msgData) {
    console.log('gandaulf is cool', msgData)
});