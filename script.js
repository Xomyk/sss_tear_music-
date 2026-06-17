// ----- Данные треков (ваш массив) -----
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
        src: 'assets/tracks/Jfarrani_-_The_Unknowing.mp3',
        cover: 'assets/covers/The Unknowing.jpg'   // пробел допустим, но лучше переименовать
    },
    {
        name: 'AIZO',
        artist: 'King Gnu',
        src: 'assets/tracks/King_Gnu_-_AlZO.mp3',
        cover: 'assets/covers/aizo.jpg'
    }
];

// ----- Состояние -----
let playlist = [];               // массив индексов треков из tracks (очередь)
let currentPlaylistIndex = 0;    // индекс в playlist (не в tracks!)
let repeatMode = 0;             // 0 = нет повтора, 1 = повтор одного трека, 2 = повтор всего плейлиста
let likedTracks = new Set();     // множество индексов треков, которые лайкнуты

// Элементы DOM
const audio = document.getElementById('audio-player');
const trackNameEl = document.getElementById('track-name');
const artistEl = document.getElementById('track-artist');
const coverEl = document.getElementById('track-cover');
const likeBtn = document.getElementById('like-btn');
const repeatBtn = document.getElementById('repeat-btn');
const allTracksList = document.getElementById('all-tracks-list');
const playlistList = document.getElementById('playlist-list');
const clearPlaylistBtn = document.getElementById('clear-playlist');

// ----- Загрузка состояния из localStorage -----
function loadState() {
    try {
        const savedPlaylist = localStorage.getItem('playlist');
        if (savedPlaylist) playlist = JSON.parse(savedPlaylist);
        else playlist = tracks.map((_, i) => i); // по умолчанию все треки

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
        console.warn('Ошибка загрузки состояния, используем значения по умолчанию');
    }
    // Если плейлист пуст, заполняем всеми треками
    if (!playlist || playlist.length === 0) {
        playlist = tracks.map((_, i) => i);
    }
    // Корректируем индекс, если он вышел за границы
    if (currentPlaylistIndex >= playlist.length) currentPlaylistIndex = 0;
}

// ----- Сохранение состояния в localStorage -----
function saveState() {
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('likedTracks', JSON.stringify([...likedTracks]));
    localStorage.setItem('repeatMode', String(repeatMode));
    localStorage.setItem('currentPlaylistIndex', String(currentPlaylistIndex));
}

// ----- Загрузка трека по индексу в плейлисте -----
function loadTrack(index) {
    if (playlist.length === 0) {
        // Если плейлист пуст, ничего не играем
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

    // Обновляем состояние кнопки лайка
    updateLikeButton();

    // Автоматически играем
    audio.play();
    saveState();
}

// ----- Обновить кнопку лайка -----
function updateLikeButton() {
    if (playlist.length === 0) return;
    const trackIndex = playlist[currentPlaylistIndex];
    const isLiked = likedTracks.has(trackIndex);
    likeBtn.textContent = isLiked ? '❤️' : '🤍';
    likeBtn.classList.toggle('liked', isLiked);
}

// ----- Переключение лайка -----
function toggleLike() {
    if (playlist.length === 0) return;
    const trackIndex = playlist[currentPlaylistIndex];
    if (likedTracks.has(trackIndex)) {
        likedTracks.delete(trackIndex);
    } else {
        likedTracks.add(trackIndex);
    }
    updateLikeButton();
    saveState();
    renderAllTracks(); // обновить список всех треков (показать лайки)
}

// ----- Переключение режима повтора -----
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3; // 0→1→2→0
    updateRepeatButton();
    saveState();
}
function updateRepeatButton() {
    const labels = ['🔁', '🔂', '🔁']; // 0 – нет, 1 – один, 2 – все
    repeatBtn.textContent = labels[repeatMode];
    repeatBtn.classList.toggle('repeat-active', repeatMode !== 0);
}

// ----- Следующий трек -----
function nextTrack() {
    if (playlist.length === 0) return;
    if (repeatMode === 1) {
        // повтор одного трека – просто перезапускаем текущий
        audio.currentTime = 0;
        audio.play();
        return;
    }
    let newIndex = currentPlaylistIndex + 1;
    if (newIndex >= playlist.length) {
        if (repeatMode === 2) {
            newIndex = 0; // зациклить плейлист
        } else {
            // нет повтора – останавливаемся на последнем
            newIndex = playlist.length - 1;
            audio.pause();
            // можно сделать перемотку на начало последнего
            audio.currentTime = 0;
            return;
        }
    }
    loadTrack(newIndex);
}

// ----- Предыдущий трек -----
function prevTrack() {
    if (playlist.length === 0) return;
    if (repeatMode === 1) {
        audio.currentTime = 0;
        audio.play();
        return;
    }
    let newIndex = currentPlaylistIndex - 1;
    if (newIndex < 0) {
        if (repeatMode === 2) {
            newIndex = playlist.length - 1;
        } else {
            newIndex = 0;
        }
    }
    loadTrack(newIndex);
}

// ----- Обработчик окончания трека -----
audio.addEventListener('ended', () => {
    if (repeatMode === 1) {
        // повтор одного трека – перезапускаем
        audio.currentTime = 0;
        audio.play();
    } else {
        // переключаем на следующий (если есть)
        nextTrack();
    }
});

// ----- Рендеринг списка всех треков -----
function renderAllTracks() {
    allTracksList.innerHTML = '';
    tracks.forEach((track, index) => {
        const li = document.createElement('li');
        const meta = document.createElement('div');
        meta.className = 'track-meta';
        meta.innerHTML = `<span class="name">${track.name}</span><span class="artist">${track.artist}</span>`;

        const actions = document.createElement('div');
        actions.className = 'track-actions-small';

        // индикатор лайка
        if (likedTracks.has(index)) {
            const likeSpan = document.createElement('span');
            likeSpan.className = 'like-indicator';
            likeSpan.textContent = '❤️';
            actions.appendChild(likeSpan);
        }

        // кнопка "добавить в плейлист"
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

// ----- Рендеринг текущего плейлиста -----
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

        // кнопка "играть" (переключиться на этот трек)
        const playBtn = document.createElement('button');
        playBtn.textContent = '▶️';
        playBtn.title = 'Играть этот трек';
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            loadTrack(pos);
        });
        actions.appendChild(playBtn);

        // кнопка "удалить из плейлиста"
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

// ----- Добавление трека в плейлист (в конец) -----
function addToPlaylist(trackIndex) {
    if (playlist.includes(trackIndex)) {
        // уже есть – можно не добавлять, но для удобства можно продублировать (или нет)
        // сделаем, что дубликаты не добавляем
        alert('Этот трек уже есть в плейлисте');
        return;
    }
    playlist.push(trackIndex);
    saveState();
    renderPlaylist();
    // если плейлист был пуст, загружаем первый добавленный трек
    if (playlist.length === 1) {
        loadTrack(0);
    }
}

// ----- Удаление трека из плейлиста по позиции -----
function removeFromPlaylist(pos) {
    if (pos < 0 || pos >= playlist.length) return;
    // если удаляем текущий трек, то переключаемся на следующий или предыдущий
    const wasCurrent = (pos === currentPlaylistIndex);
    playlist.splice(pos, 1);
    saveState();
    renderPlaylist();

    if (playlist.length === 0) {
        // плейлист опустел – останавливаем
        audio.pause();
        audio.src = '';
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
        currentPlaylistIndex = 0;
        return;
    }

    if (wasCurrent) {
        // если удалили текущий, загружаем трек на той же позиции (если она есть) или предыдущий
        if (pos >= playlist.length) pos = playlist.length - 1;
        loadTrack(pos);
    } else if (pos < currentPlaylistIndex) {
        // если удалили перед текущим, сдвигаем индекс
        currentPlaylistIndex--;
        saveState();
    }
}

// ----- Очистка всего плейлиста -----
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

// ----- Инициализация -----
function init() {
    loadState();
    renderAllTracks();
    renderPlaylist();
    updateRepeatButton();
    if (playlist.length > 0) {
        loadTrack(currentPlaylistIndex);
    } else {
        // если плейлист пуст, показываем заглушку
        trackNameEl.textContent = 'Нет треков';
        artistEl.textContent = 'Добавьте треки в плейлист';
        coverEl.style.backgroundImage = 'none';
    }
    // Обработчики кнопок
    likeBtn.addEventListener('click', toggleLike);
    repeatBtn.addEventListener('click', toggleRepeat);
    clearPlaylistBtn.addEventListener('click', clearPlaylist);
    // Обработка клика на кнопки управления (уже есть onclick в HTML)
}

// Запускаем всё после загрузки DOM
document.addEventListener('DOMContentLoaded', init);