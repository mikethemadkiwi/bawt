
// const socket = io(); // Socket.io
// socket.on('ShoutOut', function(msgData) {
//     console.log(`ShoutOut`, msgData)
//     let shoutout = document.getElementById('shoutout');
//     shoutout.style.display = 'block';//${msgData.user["profile_image_url"]}
//     shoutout.innerHTML = `<img src="${msgData.user[0]['profile_image_url']}" width="250px" /><br /><p id="shoutout">ShoutOut: ${msgData.redeemer.display_name}!</p>`
//     // shoutout.innerText += ``;
//     let shoutouttimer = setTimeout(()=>{
//         shoutout.style.display = 'none';
//         shoutout.innerText = ``;
//     }, 5000)
// });