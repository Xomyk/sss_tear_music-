git add .



= [
    { name: 'Song 1', artist: 'Artist A', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { name: 'Song 2', artist: 'Artist B', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { name: 'Song 3', artist: 'Artist C', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

let currentTrackIndex = 0;
const audio = document.getElementById('audio-player');
const trackNameEl = document.getElementById('track-name');
const artistEl = document.getElementById('track-artist');

function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.src;
    trackNameEl.textContent = track.name;
    artistEl.textContent = track.artist;
    audio.play();
}

// Автозагрузка первого трека
window.onload = () => {
    loadTrack(0);
};

// Обработка окончания трека – переключение на следующий
audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
});
