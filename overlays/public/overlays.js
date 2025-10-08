const socket = io();
//
class CSSAnim {
  raiseEyeLeft(dur){
    let eyecover = document.getElementById('eye_cover');
    let eyebrow = document.getElementById('eyebrow-left');
    let eyecol = document.getElementsByClassName('eye-col');
    eyebrow.style.top = '-10px';
    eyebrow.style.transform = 'rotate(-10deg)';
    eyebrow.style.transition = 'all 0.5s';    
    eyecover.style.top = '-20%';
    eyecover.style.transform = 'scale(1.3 , 0.5)';
    eyecover.style.transition = 'all 0.5s';
    let lowereye = setTimeout(function(){      
        eyebrow.style.top = '20%';
        eyebrow.style.transform = 'none';
        eyebrow.style.transition = 'all 0.5s';    
        eyecover.style.top = '-10%';
        eyecover.style.transform = 'scale(1.3 , 1.3)';
        eyecover.style.transition = 'all 0.5s';
    },dur)
  }
  makeRedEyes(dur){
    let eyecover = document.getElementById('eye_cover');
    let eyebrow = document.getElementById('eyebrow-left');
    let eyecol = document.getElementsByClassName('eye-col');
    for (let index = 0; index < eyecol.length; index++) { 
        const element = eyecol[index];
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
//
async function CustomRewards(rewardData){
    // console.log('Twitch', rewardData.reward.title, rewardData)
    let _css = new CSSAnim;
    switch(rewardData.reward.title){
        case 'LookMa':
            console.log('LookMa')
            let dragonflame = document.getElementById('dragonflame')
            dragonflame.style.display = 'block';
            _css.makeRedEyes(2500);
            let flametimer = setTimeout(()=>{
                dragonflame.style.display = 'none';
            }, 2500)
        break;
        case 'RaiseEye':
            _css.raiseEyeLeft(2500);
        break;
        case 'DumbAnswer':
            console.log('DumbAnswer')
            let DumbAnswer = document.createElement('video');
            DumbAnswer.src = 'video/dumbanswer.mp4';
            DumbAnswer.autoplay = true;
            DumbAnswer.controls = false;
            DumbAnswer.muted = false;
            DumbAnswer.height = 480; // 👈️ in px
            DumbAnswer.width = 854; // 👈️ in px
            DumbAnswer.volume = 0.25;
            DumbAnswer.addEventListener("ended", function(){
                document.getElementById('videvent').innerHTML = null;
            });
            const boxDumbAnswer = document.getElementById('videvent');
            boxDumbAnswer.appendChild(DumbAnswer);
        break;
        case 'TotalCunt':
            console.log('TotalCunt')
            let TotalCunt = document.createElement('video');
            TotalCunt.src = 'video/totalcunt.mp4';
            TotalCunt.autoplay = true;
            TotalCunt.controls = false;
            TotalCunt.muted = false;
            TotalCunt.height = 480; // 👈️ in px
            TotalCunt.width = 854; // 👈️ in px
            TotalCunt.volume = 0.25;
            TotalCunt.addEventListener("ended", function(){
                document.getElementById('videvent').innerHTML = null;
            });
            const boxTotalCunt = document.getElementById('videvent');
            boxTotalCunt.appendChild(TotalCunt);
        break;
        case 'EffYou':
            console.log('EffYou')
            let EffYou = document.createElement('video');
            EffYou.src = 'video/finger.mp4';
            EffYou.autoplay = true;
            EffYou.controls = false;
            EffYou.muted = false;
            EffYou.height = 480; // 👈️ in px
            EffYou.width = 854; // 👈️ in px
            EffYou.volume = 0.25;
            EffYou.addEventListener("ended", function(){
                document.getElementById('videvent').innerHTML = null;
            });
            const boxEffYou = document.getElementById('videvent');
            document.getElementById('videvent').innerHTML = null;
            boxEffYou.appendChild(EffYou);
        break;
        default:
    }
}
//
async function AutoRewards(rewardData){
    console.log('auto', rewardData.reward.type, rewardData)
    switch(rewardData.reward.type){
        case 'send_highlighted_message':
            console.log('this works.', rewardData.message.text)
        break;
        default:
    }
}
//
async function ChatMessage(chatData){
    console.log('twitchchatmessage', chatData.chatter_user_name, chatData.message.text)
}
//
socket.on("BunnySays", async (bsFile) => {
    let audSrc = `../sounds/bunny/${bsFile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.50;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('soundevent').innerHTML = null;
    });
    const box = document.getElementById('soundevent');
    box.appendChild(audio);
});
socket.on("Honk", async (hFile) => {
    let audSrc = `../sounds/honk/${hFile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.50;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('soundevent').innerHTML = null;
    });
    const box = document.getElementById('soundevent');
    box.appendChild(audio);
});
socket.on("Gong", async (gFile) => {
    let audSrc = `../sounds/honk/${gFile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.50;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('soundevent').innerHTML = null;
    });
    const box = document.getElementById('soundevent');
    box.appendChild(audio);
});
socket.on("TSKicked", async (gFile) => {
    let audSrc = `../sounds/honk/${gFile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.50;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('soundevent').innerHTML = null;
    });
    const box = document.getElementById('soundevent');
    box.appendChild(audio);
});
socket.on("Loud", async (lFile) => {
    let audSrc = `../sounds/honk/${lFile}`;
    const audio = document.createElement('audio');
    audio.src = audSrc;
    audio.autoplay = true;
    audio.controls = false;
    audio.muted = false;
    audio.volume = 0.50;
    audio.addEventListener("ended", function(){
        console.log('audioended');
        document.getElementById('soundevent').innerHTML = null;
    });
    const box = document.getElementById('soundevent');
    box.appendChild(audio);
});
socket.on("Twitch", async (twitchObj) => {
    switch(twitchObj[0]){
        case 'channel.channel_points_custom_reward_redemption.add':
            CustomRewards(twitchObj[1])
        break;
        case 'channel.channel_points_automatic_reward_redemption.add':
            AutoRewards(twitchObj[1].event)
        break;
        case 'channel.chat.message':
            ChatMessage(twitchObj[1].event)
        break;
        case 'Ads':
            let audSrc = `../sounds/ads/Morse.ogg`;
            const audio = document.createElement('audio');
            audio.src = audSrc;
            audio.autoplay = true;
            audio.controls = false;
            audio.muted = false;
            audio.volume = 0.10;
            audio.addEventListener("ended", function(){
                console.log('audioended');
                document.getElementById('soundevent').innerHTML = null;
            });
            const box = document.getElementById('soundevent');
            box.appendChild(audio);
            console.log('Ads', twitchObj[1])
        break;
        default:
            console.log('addme',twitchObj[0])
    }
});
//
socket.on('Ads', async (adObj) => {
    console.log('Ads', adObj)
});