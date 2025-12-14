/* =========================================
   YOUTUBE AUDIO PLAYER - GLOBAL SCOPE
   CRITICAL: Must be before DOMContentLoaded
   ========================================= */
let player = null;
let playlist = [];
let currentIndex = -1;
let playerReady = false;

// YouTube API ready callback - MUST BE GLOBAL
window.onYouTubeIframeAPIReady = function () {
    console.log('✅ YouTube API Ready!');
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'playsinline': 1,
            'controls': 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

function onPlayerReady(event) {
    playerReady = true;
    console.log('✅ Player Ready - You can now play songs!');

    if (window.pendingSong !== undefined) {
        const pendingIndex = window.pendingSong;
        window.pendingSong = undefined;
        playSong(pendingIndex);
    }
}

function onPlayerStateChange(event) {
    const playPauseBtn = document.getElementById('play-pause-btn');

    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    } else if (event.data === YT.PlayerState.PLAYING) {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else if (event.data === YT.PlayerState.PAUSED) {
        if (playPauseBtn) playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function playSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentIndex = index;
    const song = playlist[index];

    document.getElementById('current-song-title').textContent = `Now Playing: ${song.title}`;
    document.querySelectorAll('.song-card').forEach((c, i) => {
        c.classList.toggle('playing', i === index);
    });

    if (player && player.loadVideoById) {
        player.loadVideoById({ videoId: song.videoId, startSeconds: 0 });
    } else {
        console.warn('⏳ Player not ready, will play when ready...');
        window.pendingSong = index;
    }
}

function playNext() {
    if (currentIndex < playlist.length - 1) {
        playSong(currentIndex + 1);
    }
}

function playPrev() {
    if (currentIndex > 0) {
        playSong(currentIndex - 1);
    }
}

function togglePlayPause() {
    if (!playerReady || !player || !player.getPlayerState) {
        console.log('Player not ready');
        return;
    }

    if (currentIndex === -1 && playlist.length > 0) {
        playSong(0);
        return;
    }

    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.CUED) {
        player.playVideo();
    }
}

function updateProgress() {
    if (!player || !player.getCurrentTime) return;

    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();

    if (duration > 0) {
        const progressBar = document.getElementById('progress-bar');
        const currentTimeDisplay = document.getElementById('current-time');
        const durationDisplay = document.getElementById('duration-time');

        progressBar.value = (currentTime / duration) * 100;
        currentTimeDisplay.textContent = formatTime(currentTime);
        durationDisplay.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function seekTo(event) {
    if (!player || !player.getDuration) return;

    const progressBar = document.getElementById('progress-bar');
    const duration = player.getDuration();
    const seekTime = (progressBar.value / 100) * duration;

    player.seekTo(seekTime, true);
}

function changeVolume(event) {
    if (!player || !player.setVolume) return;

    const volumeSlider = document.getElementById('volume-slider');
    const volumeBtn = document.getElementById('volume-btn');
    const volume = volumeSlider.value;

    player.setVolume(volume);

    // Update volume icon
    if (volume == 0) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volume < 50) {
        volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function toggleMute() {
    if (!player || !player.isMuted) return;

    const volumeSlider = document.getElementById('volume-slider');
    const volumeBtn = document.getElementById('volume-btn');

    if (player.isMuted()) {
        player.unMute();
        volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        volumeSlider.value = player.getVolume();
    } else {
        player.mute();
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// Start progress tracking when player is ready
setInterval(updateProgress, 1000);

document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       1. MAIN TAB NAVIGATION & PERSISTENCE
       ========================================= */
    const mainTabs = document.querySelectorAll('.dock-item[data-target]');
    const mainContents = document.querySelectorAll('.tab-content');

    const savedTab = localStorage.getItem('meng_personal_tab') || 'tab-photos';
    activateMainTab(savedTab);

    mainTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            activateMainTab(targetId);
            localStorage.setItem('meng_personal_tab', targetId);
        });
    });

    function activateMainTab(tabId) {
        mainTabs.forEach(t => t.classList.remove('active'));
        mainContents.forEach(c => c.classList.remove('active'));

        const targetBtn = document.querySelector(`.dock-item[data-target="${tabId}"]`);
        const targetContent = document.getElementById(tabId);

        if (targetBtn && targetContent) {
            targetBtn.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    /* =========================================
       2. NEWS SUB-NAVIGATION & LOGIC (MULTI-SOURCE)
       ========================================= */
    const subTabs = document.querySelectorAll('.subnav-item');
    const newsContainers = document.querySelectorAll('.news-category-container');
    const sentinel = document.getElementById('news-sentinel');

    const feeds = {
        'world': {
            urls: [
                'https://feeds.bbci.co.uk/news/world/rss.xml',
                'http://rss.cnn.com/rss/edition.rss',
                'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'
            ],
            container: document.getElementById('grid-world'),
            items: [],
            loaded: 0,
            fallbackImages: [
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800',
                'https://images.unsplash.com/photo-1444653614773-995cb1ef902a?q=80&w=800',
                'https://images.unsplash.com/photo-1529101091760-61df6bead86c?q=80&w=800'
            ]
        },
        'tech': {
            urls: [
                'https://www.theverge.com/rss/index.xml',
                'https://techcrunch.com/feed/',
                'https://www.wired.com/feed/category/gear/latest/rss'
            ],
            container: document.getElementById('grid-tech'),
            items: [],
            loaded: 0,
            fallbackImages: [
                'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800',
                'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800',
                'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800'
            ]
        }
    };

    let activeCategory = 'news-world';
    const BATCH_SIZE = 9;

    subTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSub = btn.getAttribute('data-sub');
            switchSubTab(targetSub);
        });
    });

    function switchSubTab(targetId) {
        subTabs.forEach(b => b.classList.remove('active'));
        document.querySelector(`.subnav-item[data-sub="${targetId}"]`).classList.add('active');

        newsContainers.forEach(c => c.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');

        activeCategory = targetId;
        const key = targetId.split('-')[1];

        sentinel.style.display = 'block';

        if (feeds[key].items.length === 0) {
            sentinel.innerHTML = '<div class="spinner"><i class="fas fa-satellite-dish fa-spin"></i> Aggregating sources...</div>';
            aggregateFeeds(key);
        } else {
            if (feeds[key].loaded >= feeds[key].items.length) {
                sentinel.style.display = 'none';
            } else {
                sentinel.innerHTML = '<div class="spinner"><i class="fas fa-satellite-dish fa-spin"></i> Loading more...</div>';
            }
        }
    }

    async function aggregateFeeds(key) {
        const feedConfig = feeds[key];
        const fetchPromises = feedConfig.urls.map(url => {
            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
            return fetch(proxyUrl).then(res => res.json());
        });

        try {
            const results = await Promise.all(fetchPromises);

            let aggregatedItems = [];
            results.forEach(data => {
                if (data.status === 'ok') {
                    aggregatedItems = aggregatedItems.concat(data.items);
                }
            });

            feedConfig.items = shuffleArray(aggregatedItems);

            if (feedConfig.items.length > 0) {
                renderBatch(key);
            } else {
                sentinel.innerHTML = 'No news available from sources.';
            }

        } catch (err) {
            console.error(err);
            sentinel.innerHTML = `<p style="color:var(--text-muted)">Connection Error.</p>`;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderBatch(key) {
        const feed = feeds[key];
        const endIndex = Math.min(feed.loaded + BATCH_SIZE, feed.items.length);
        const nextBatch = feed.items.slice(feed.loaded, endIndex);

        nextBatch.forEach(item => {
            const card = document.createElement('a');
            card.className = 'news-card';
            card.href = item.link;
            card.target = '_blank';
            card.rel = 'noopener noreferrer';

            let imgUrl = item.thumbnail || item.enclosure?.link;

            if (!imgUrl && item.description) {
                const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
                if (match) imgUrl = match[1];
            }

            if (!imgUrl || !imgUrl.startsWith('http')) {
                const randomIdx = Math.floor(Math.random() * feed.fallbackImages.length);
                imgUrl = feed.fallbackImages[randomIdx];
            }

            if (imgUrl.startsWith('http:')) imgUrl = imgUrl.replace('http:', 'https:');

            card.innerHTML = `
                <div class="news-img" style="background-image: url('${imgUrl}')"></div>
                <div class="news-content">
                    <h3>${item.title}</h3>
                    <p class="read-more">Read Article <i class="fas fa-external-link-alt"></i></p>
                </div>
            `;
            feed.container.appendChild(card);
        });

        feed.loaded = endIndex;

        if (feed.loaded >= feed.items.length) {
            sentinel.style.display = 'none';
        } else {
            sentinel.style.display = 'block';
            sentinel.innerHTML = '<div class="spinner"><i class="fas fa-satellite-dish fa-spin"></i> Loading more...</div>';
        }
    }

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            const key = activeCategory.split('-')[1];
            if (feeds[key].items.length > feeds[key].loaded) {
                setTimeout(() => renderBatch(key), 500);
            }
        }
    });
    if (sentinel) observer.observe(sentinel);

    // Initial Load
    aggregateFeeds('world');

    /* =========================================
       3. YOUTUBE AUDIO PLAYER WITH AUTO-ADVANCE
       ========================================= */
    const API_KEY = 'AIzaSyDIea9dWaloEH1AUK7HC7zSJPsEYZInxkQ';
    const PLAYLIST_ID = 'PLZ2fCa0Z6GN0qMcHk8nvHQyjqXe4s-MMM';
    const playlistLoading = document.getElementById('playlist-loading');
    const songListContainer = document.getElementById('song-list');

    // Setup control buttons
    document.getElementById('play-pause-btn')?.addEventListener('click', togglePlayPause);
    document.getElementById('next-btn')?.addEventListener('click', playNext);
    document.getElementById('prev-btn')?.addEventListener('click', playPrev);

    // Setup progress bar and volume controls
    document.getElementById('progress-bar')?.addEventListener('input', seekTo);
    document.getElementById('volume-slider')?.addEventListener('input', changeVolume);
    document.getElementById('volume-btn')?.addEventListener('click', toggleMute);

    async function fetchPlaylist() {
        try {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (playlistLoading) playlistLoading.style.display = 'none';

            songListContainer.innerHTML = '';
            playlist = [];

            data.items.forEach((item, index) => {
                const songTitle = item.snippet.title;
                const thumbnail = item.snippet.thumbnails.default.url;
                const videoId = item.snippet.resourceId.videoId;

                playlist.push({ title: songTitle, videoId: videoId });

                const songCard = document.createElement('div');
                songCard.className = 'song-card';
                songCard.style.cursor = 'pointer';

                songCard.innerHTML = `
                    <div class="song-number">${index + 1}</div>
                    <img src="${thumbnail}" alt="Thumbnail" class="song-thumbnail">
                    <div class="song-info">
                        <div class="song-title">${songTitle}</div>
                    </div>
                    <div class="song-play-icon">
                        <i class="fas fa-play"></i>
                    </div>
                `;

                // Click handler to play song
                songCard.addEventListener('click', function () {
                    console.log('Song clicked:', index, songTitle);
                    playSong(index);
                });

                songListContainer.appendChild(songCard);
            });

        } catch (error) {
            console.error('YouTube API Error:', error);
            if (playlistLoading) {
                playlistLoading.innerHTML = `<i class="fas fa-exclamation-circle"></i> Failed to load playlist: ${error.message}`;
            }
        }
    }

    const musicTab = document.querySelector('.dock-item[data-target="tab-music"]');
    if (musicTab) {
        musicTab.addEventListener('click', () => {
            if (songListContainer && songListContainer.children.length === 0) {
                fetchPlaylist();
            }
        });

        // CRITICAL FIX: Also check if Music tab is already active on page load
        const musicSection = document.getElementById('tab-music');
        if (musicSection && musicSection.classList.contains('active')) {
            // Music tab is active, load playlist immediately
            fetchPlaylist();
        }
    }
});
