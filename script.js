// ----- Данные треков (точные имена из папки) -----
const tracks = [
    {
        name: 'Angelseek',
        artist: 'Ado',
        src: 'assets/tracks/Ado_-_Angelseek.mp3',
        cover: 'assets/covers/ado.jpg'
    },
    {
        name: 'Cake By The Ocean',
        artist: 'DNCE',
        src: 'assets/tracks/DNCE_-_Cake_By_The_Ocean.mp3',
        cover: 'assets/covers/DNCEart.jpg'
    },
    {
        name: 'GRAVEDIGGER',
        artist: 'Jimmy Chang',
        src: 'assets/tracks/Jimmy_Chang_-_GRAVEDIGGER.mp3',
        cover: 'assets/covers/Jimmy_Chang_-_GRAVEDIGGER.jpg'
    },
    {
        name: 'The Unknowing',
        artist: 'Jfarrari',
        src: 'assets/tracks/Jfarrari_-_The_Unknowing.mp3',   // две 'r'!
        cover: 'assets/covers/The_Unknowing.jpg'            // без пробела
    },
    {
        name: 'AIZO',
        artist: 'King Gnu',
        src: 'assets/tracks/King_Gnu_-_AIZO.mp3',           // заглавная I
        cover: 'assets/covers/aizo.jpg'
    }
];

// ----- Остальной код (полная копия из предыдущего исправления) -----
let playlist = [];
let currentPlaylistIndex = 0;
let repeatMode = 0;
let likedTracks = new Set();

const audio = document.getElementById('audio-player');
const trackNameEl = document.getElementById('track-name');
const artistEl = document.getElementById('track-artist');
const coverEl = document.getElementById('track-cover');
const likeBtn = document.getElementById('like-btn');
const repeatBtn = document.getElementById('repeat-btn');
const allTracksList = document.getElementById('all-tracks-list');
const playlistList = document.getElementById('playlist-list');
const clearPlaylistBtn = document.getElementById('clear-playlist');

function loadState() {
    try {
        const savedPlaylist = localStorage.getItem('playlist');
        if (savedPlaylist) playlist = JSON.parse(savedPlaylist);
        else playlist = tracks.map((_, i) => i);
        const savedLikes = localStorage.getItem('likedTracks');
        if (savedLikes) {
            const arr = JSON.parse(savedLikes);
            likedTracks = new Set(arr);
        }
        const savedRepeat = localStorage.getItem('repeatMode');
        if (savedRepeat !== null) repeatMode = parseInt(savedRepeat, 10);
        const savedIndex = localStorage.getItem('currentPlaylistIndex');
        if (savedIndex !== null) currentPlaylistIndex = parseInt(savedIndex, 10);
    } catch (e) {
        console.warn('Ошибка загрузки состояния');
    }
    if (!playlist || playlist.length === 0) {
        playlist = tracks.map((_, i) => i);
    }
    if (currentPlaylistIndex >= playlist.length) currentPlaylistIndex = 0;
}

function saveState() {
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('likedTracks', JSON.stringify([...likedTracks]));
    localStorage.setItem('repeatMode', String(repeatMode));
    localStorage.setItem('currentPlaylistIndex', String(currentPlaylistIndex));
}

function loadTrack(index) {
    if (playlist.length === 0) {
        audio.pause();
        audio.src = '';
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
        return;
    }
    if (index < 0) index = 0;
    if (index >= playlist.length) index = playlist.length - 1;
    currentPlaylistIndex = index;

    const trackIndex = playlist[currentPlaylistIndex];
    const track = tracks[trackIndex];
    if (!track) return;

    audio.src = track.src;
    trackNameEl.textContent = track.name;
    artistEl.textContent = track.artist;
    coverEl.style.backgroundImage = `url('${track.cover}')`;
    updateLikeButton();
    saveState();
}

function playCurrentTrack() {
    if (audio.src) {
        audio.play().catch(e => {
            console.warn('Автовоспроизведение заблокировано – кликните по плееру');
        });
    }
}

function updateLikeButton() {
    if (playlist.length === 0) return;
    const trackIndex = playlist[currentPlaylistIndex];
    const isLiked = likedTracks.has(trackIndex);
    likeBtn.textContent = isLiked ? '❤️' : '🤍';
    likeBtn.classList.toggle('liked', isLiked);
}

function toggleLike() {
    if (playlist.length === 0) return;
    const trackIndex = playlist[currentPlaylistIndex];
    if (likedTracks.has(trackIndex)) likedTracks.delete(trackIndex);
    else likedTracks.add(trackIndex);
    updateLikeButton();
    saveState();
    renderAllTracks();
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    updateRepeatButton();
    saveState();
}
function updateRepeatButton() {
    const labels = ['🔁', '🔂', '🔁'];
    repeatBtn.textContent = labels[repeatMode];
    repeatBtn.classList.toggle('repeat-active', repeatMode !== 0);
}

function nextTrack() {
    if (playlist.length === 0) return;
    if (repeatMode === 1) {
        audio.currentTime = 0;
        playCurrentTrack();
        return;
    }
    let newIndex = currentPlaylistIndex + 1;
    if (newIndex >= playlist.length) {
        if (repeatMode === 2) newIndex = 0;
        else {
            newIndex = playlist.length - 1;
            audio.pause();
            audio.currentTime = 0;
            return;
        }
    }
    loadTrack(newIndex);
    playCurrentTrack();
}

function prevTrack() {
    if (playlist.length === 0) return;
    if (repeatMode === 1) {
        audio.currentTime = 0;
        playCurrentTrack();
        return;
    }
    let newIndex = currentPlaylistIndex - 1;
    if (newIndex < 0) {
        if (repeatMode === 2) newIndex = playlist.length - 1;
        else newIndex = 0;
    }
    loadTrack(newIndex);
    playCurrentTrack();
}

audio.addEventListener('ended', () => {
    if (repeatMode === 1) {
        audio.currentTime = 0;
        playCurrentTrack();
    } else {
        nextTrack();
    }
});

function renderAllTracks() {
    allTracksList.innerHTML = '';
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        const meta = document.createElement('div');
        meta.className = 'track-meta';
        meta.innerHTML = `<span class="name">${track.name}</span><span class="artist">${track.artist}</span>`;
        const actions = document.createElement('div');
        actions.className = 'track-actions-small';
        if (likedTracks.has(index)) {
            const likeSpan = document.createElement('span');
            likeSpan.className = 'like-indicator';
            likeSpan.textContent = '❤️';
            actions.appendChild(likeSpan);
        }
        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = '+';
        addBtn.title = 'Добавить в плейлист';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToPlaylist(index);
        });
        actions.appendChild(addBtn);
        li.appendChild(meta);
        li.appendChild(actions);
        allTracksList.appendChild(li);
    });
}

function renderPlaylist() {
    playlistList.innerHTML = '';
    if (playlist.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'Плейлист пуст';
        empty.style.background = 'transparent';
        empty.style.color = '#b3b3b3';
        playlistList.appendChild(empty);
        return;
    }
    playlist.forEach((trackIndex, pos) => {
        const track = tracks[trackIndex];
        if (!track) return;
        const li = document.createElement('li');
        const meta = document.createElement('div');
        meta.className = 'track-meta';
        meta.innerHTML = `<span class="name">${track.name}</span><span class="artist">${track.artist}</span>`;
        const actions = document.createElement('div');
        actions.className = 'track-actions-small';
        const playBtn = document.createElement('button');
        playBtn.textContent = '▶️';
        playBtn.title = 'Играть этот трек';
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrack(pos);
            playCurrentTrack();
        });
        actions.appendChild(playBtn);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Удалить из плейлиста';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromPlaylist(pos);
        });
        actions.appendChild(removeBtn);
        li.appendChild(meta);
        li.appendChild(actions);
        playlistList.appendChild(li);
    });
}

function addToPlaylist(trackIndex) {
    if (playlist.includes(trackIndex)) {
        alert('Этот трек уже есть в плейлисте');
        return;
    }
    playlist.push(trackIndex);
    saveState();
    renderPlaylist();
    if (playlist.length === 1) {
        loadTrack(0);
        playCurrentTrack();
    }
}

function removeFromPlaylist(pos) {
    if (pos < 0 || pos >= playlist.length) return;
    const wasCurrent = (pos === currentPlaylistIndex);
    playlist.splice(pos, 1);
    saveState();
    renderPlaylist();
    if (playlist.length === 0) {
        audio.pause();
        audio.src = '';
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
        currentPlaylistIndex = 0;
        return;
    }
    if (wasCurrent) {
        if (pos >= playlist.length) pos = playlist.length - 1;
        loadTrack(pos);
    } else if (pos < currentPlaylistIndex) {
        currentPlaylistIndex--;
        saveState();
    }
}

function clearPlaylist() {
    if (confirm('Удалить все треки из плейлиста?')) {
        playlist = [];
        saveState();
        renderPlaylist();
        audio.pause();
        audio.src = '';
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
        currentPlaylistIndex = 0;
    }
}

function init() {
    loadState();
    renderAllTracks();
    renderPlaylist();
    updateRepeatButton();
    if (playlist.length > 0) {
        loadTrack(currentPlaylistIndex);
    } else {
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
    }
    likeBtn.addEventListener('click', toggleLike);
    repeatBtn.addEventListener('click', toggleRepeat);
    clearPlaylistBtn.addEventListener('click', clearPlaylist);
    document.querySelector('.player').addEventListener('click', () => {
        if (audio.src && audio.paused) playCurrentTrack();
    });
}

document.addEventListener('DOMContentLoaded', init);