const socket = io(); // Socket.io
let eyecover = document.getElementById('eye_cover');
let eyebrow = document.getElementById('eyebrow-left');
let eyecol = document.getElementsByClassName('eye-col');
let chatters = document.getElementById('chatlist');
const chatList = [];
class CSSAnim {
  raiseEyeLeft(dur){
    eyebrow.style.top = '-10px';
    eyebrow.style.transform = 'rotate(-10deg)';
    eyebrow.style.transition = 'all 0.5s';    
    eyecover.style.top = '-20%';
    eyecover.style.transform = 'scale(1.3 , 0.5)';
    eyecover.style.transition = 'all 0.5s';
    let lowereye = setTimeout(function(){      
        eyebrow.style.top = '15%';
        eyebrow.style.transform = 'none';
        eyebrow.style.transition = 'all 0.5s';    
        eyecover.style.top = '-10%';
        eyecover.style.transform = 'scale(1.3 , 1.3)';
        eyecover.style.transition = 'all 0.5s';
    },dur)
  }
  makeRedEyes(dur){
    for (let index = 0; index < eyecol.length; index++) { 
        const element = eyecol[index];
        // element.style.fill = url(document.getElementById('dragon'));
        element.setAttribute("style", "fill: url('#dragon')");
    }
    let setWhiteEyes = setTimeout(() => {
        for (let index = 0; index < eyecol.length; index++) {
            const element = eyecol[index];
            element.style.fill = '#f2f2f2';            
        }
    }, dur);
  }
}
socket.on('userJoin', function(msgData) {
    console.log('userJoin',msgData)
    if(chatList[msgData.display_name]!=null){
        chatters[msgData.display_name] = msgData;
    }
    chatters.innerHTML = null;
    chatList.forEach(chatter => {
        chatters.innerHTML = `<img src="${chatter.profile_image_url}" width="20px" /> ${chatter.display_name} <br />`
    });
    let _css = new CSSAnim;
    _css.raiseEyeLeft(2500);
    _css.makeRedEyes(2500);
});
socket.on('userPart', function(msgData) {
    console.log('userPart',msgData)
    if(chatList[msgData.display_name]!=null){
        chatters[msgData.display_name] = null;

    }
    chatters.innerHTML = null;
    chatList.forEach(chatter => {
        chatters.innerHTML = `<img src="${chatter.profile_image_url}" width="20px" /> ${chatter.display_name} <br />`
    });
    let _css = new CSSAnim;
    _css.raiseEyeLeft(2500);
    _css.makeRedEyes(2500);
});
socket.on('LookMa', function(msgData) {
    console.log('LookMa',msgData)
    let _css = new CSSAnim;
    let dragonflame = document.getElementById('dragonflame')
    let dragonname =  document.getElementById('dragonname')
    dragonflame.style.display = 'block';
    _css.makeRedEyes(2500);
    let flametimer = setTimeout(()=>{
        dragonflame.style.display = 'none';
    }, 2500)
});

socket.on('effyou', function(msgData) {
    console.log('effyou',msgData)
    var fs = require('fs');
    var files = fs.readdirSync('./sounds/host/');
    var rFile = Math.random(0, (files.length() - 1));
    console.log(files[rFile]);
    // let _css = new CSSAnim;
    // let dragonflame = document.getElementById('dragonflame')
    // let dragonname =  document.getElementById('dragonname')
    // dragonflame.style.display = 'block';
    // _css.makeRedEyes(2500);
    // let flametimer = setTimeout(()=>{
    //     dragonflame.style.display = 'none';
    // }, 2500)
});

socket.on('hosted', function(msgData) {
    console.log('hosted',msgData)
    let audSrc = 'https://mad.kiwi/purplemonkeydishwasher/media/sounds/Jellybunz%20Blueberry%20Sounds/pullsout.mp3'
    document.getElementById('shoutout').innerHTML = `<audio id="audio-player" controls="controls" src="${audSrc}" type="audio/mpeg" autoplay="true">`;
    document.getElementById('audio-player').style.display = 'none';
    document.getElementById('audio-player').setAttribute("autoplay","autoplay");
    let _css = new CSSAnim;
    _css.raiseEyeLeft(2500);
    _css.makeRedEyes(2500);
});