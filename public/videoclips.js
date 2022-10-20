const socket = io(); // Socket.io
socket.on('effyou', function(msgData) {
    const video = document.createElement('video');
    video.src = '../video/finger.mp4';
    video.autoplay = true;
    video.controls = false;
    video.muted = false;
    video.height = 480; // 👈️ in px
    video.width = 854; // 👈️ in px
    video.volume = 0.25;
    video.addEventListener("ended", function(){
        console.log('videoended');
        document.getElementById('vidContainer').innerHTML = null;
    });
    const box = document.getElementById('vidContainer');
    box.appendChild(video);
});

