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
class shoutPacket {
    constructor(id, redeemer, reward, user) {
        this.id = id
        this.redeemer = redeemer;
        this.reward = reward;
        this.user = user[0]; // note this excludes the user array for the first object.
        this.tmpDate = (Date.now()+10000);
        this.lastShoutTrigger = this.tmpDate;
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

        }
        // this.canShout = function() {
        //     return new Promise((resolve, reject) => {                
        //         let slUser = shoutList.map(function(sPUser) { return sPUser.id; }).indexOf(this.id); 
        //         console.log('sluser', slUser)
        //         if(shoutList[slUser].lastShoutTrigger<=Date.now()){
        //             console.log('canrun')
        //             let nDate = (Date.now()+)
        //             shoutList[slUser].lastShoutTrigger = ;
        //             return shoutList[slUser]
        //         }
        //         else{
        //             console.log('cantrun')                    
        //         }
        // // OnlineIdentities.splice(removeIndex, 1);
        //     })
        // }
    }
}

socket.on('ShoutOut', function(msgData) {
    console.log(`ShoutOut`, msgData)
    let sP = new shoutPacket(msgData.redeemer.id, msgData.redeemer,msgData.reward, msgData.user)
    shoutList.push(sP)
    console.log(shoutList)
    // let shoutout = document.getElementById('shoutout');
    // shoutout.style.display = 'block';//${msgData.user["profile_image_url"]}
    // shoutout.innerHTML = `<img src="${msgData.user[0]['profile_image_url']}" width="250px" /><br /><p id="shoutout">ShoutOut: ${msgData.redeemer.display_name}!</p>`
    // // shoutout.innerText += ``;
    // let shoutouttimer = setTimeout(()=>{
    //     shoutout.style.display = 'none';
    //     shoutout.innerText = ``;
    // }, 5000)
});

const TickLoop = setInterval(() => {
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