const socket = io();
//
socket.on('Ads', async (adObj) => {
    console.log('Ads', adObj)
});
socket.on("Twitch", async (twitchObj) => {
    switch(twitchObj[0]){
        case 'Ads':
            console.log('Ads', twitchObj[1])
            let draper = document.getElementById('draper')
            draper.style.display = 'block';
            setTimeout(() => {
                draper.style.display = 'none';
            }, 90000);
        break;
        default:
            //
    }
});