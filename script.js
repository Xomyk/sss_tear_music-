// Список треков с локальными путями
const tracks = [
    {
        name: 'Angelseek',
        artist: 'Ado',
        src: 'assets/tracks/Ado_-_Angelseek.mp3',
        cover: 'assets/covers/ado.jpg'
    },
    {
        name: 'Cake_By_The_Ocean',
        artist: 'DNCE',
        src: 'assets/tracks/DNCE_-_Cake_By_The_Ocean.mp3',
        cover: 'assets/covers/DNCEart.jpg'
    },
    {
        name: 'GRAVEDIGGER',
        artist: 'Jimmy_Chang',
        src: 'assets/tracks/Jimmy_Chang_-_GRAVEDIGGER.mp3',
        cover: 'assets/covers/Jimmy_Chang_-_GRAVEDIGGER.jpg'
    },
     {
        name: 'The_Unknowing',
        artist: 'Jfarrari',
        src: 'assets/tracks/Jfarrari_-_The_Unknowing.mp3',
        cover: 'assets/covers/The Unknowing.jpg'
    },
     {
        name: 'AIZO',
        artist: 'King_Gnu',
        src: 'assets/tracks/King_Gnu_-_AIZO.mp3',
        cover: 'assets/covers/aizo.jpg'
    }
];

let currentTrackIndex = 0;
const audio = document.getElementById('audio-player');
const trackNameEl = document.getElementById('track-name');
const artistEl = document.getElementById('track-artist');
const coverEl = document.getElementById('track-cover');

function loadTrack(index) {
    const track = tracks[index];
    audio.src = track.src;
    trackNameEl.textContent = track.name;
    artistEl.textContent = track.artist;
    coverEl.style.backgroundImage = `url('${track.cover}')`;
    audio.play();
}

// При загрузке страницы – первый трек
window.onload = () => {
    loadTrack(0);
};

// Автоматическое переключение на следующий трек
audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
});

// Кнопки управления (добавлены в index.html)
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
}