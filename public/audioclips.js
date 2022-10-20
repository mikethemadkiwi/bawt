const socket = io(); // Socket.io
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
    const box = document.getElementById('AudContainer');
    box.appendChild(audio);
});
