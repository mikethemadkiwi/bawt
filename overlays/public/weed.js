let weedcanvas = document.getElementById('weedwall');
//
function CustomRewards(rewardObj){
    console.log('this page can see', rewardObj)
    weedcanvas.style.display = "inline-block";
    setTimeout(() => {
        weedcanvas.style.display = "none";
    }, 15000);
}
//
const socket = io();
socket.on("Twitch", async (twitchObj) => {
    switch(twitchObj[0]){
        case 'channel.channel_points_custom_reward_redemption.add':
            if (twitchObj[1].reward.title == '420Friendly'){
                CustomRewards(twitchObj[1])
            }
        break;
        default:
    }
})
//