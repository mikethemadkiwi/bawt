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