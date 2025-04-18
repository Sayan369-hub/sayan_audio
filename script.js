const songs = [
    { name: "song1.mp3", title: "Interstellar", artist: "Hans Zimmer", cover: "cover1.jpg" },
    { name: "song2.mp3", title: "Sherlock Holmes", artist: "Hans Zimmer", cover: "cover2.jpg" },
    { name: "song3.mp3", title: "Harry Potter", artist: "john williams", cover: "cover3.jpg" },
    { name: "song4.mp3", title: "Game Of Thrones", artist: "Ramin Djawadi", cover: "cover4.jpg" },
    { name: "song5.mp3", title: "Marvel Avengers", artist: "Alan Silvestri", cover: "cover5.jpg" },
    { name: "song6.mp3", title: "Moon Knight", artist: "Mega Anthem Hitz", cover: "cover6.jpg" },
    { name: "song7.mp3", title: "Naruto-Sad & Sorrow", artist: "Toshio Masuda", cover: "cover7.jpg" },
    { name: "song8.mp3", title: "Pirates of the Caribbean", artist: "Hans Zimmer", cover: "cover8.jpg" }
  ];
  
  let currentIndex = 0;
  let isShuffle = false;
  let isRepeat = false;
  const audio = document.getElementById("audio");
  const title = document.getElementById("title");
  const artist = document.getElementById("artist");
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const shuffleBtn = document.getElementById("shuffle");
  const repeatBtn = document.getElementById("repeat");
  const favoriteBtn = document.getElementById("favorite");
  const progress = document.getElementById("progress");
  const progressContainer = document.querySelector(".progress-container");
  const volumeSlider = document.getElementById("volume");
  const cover = document.getElementById("cover");
  const playlistEl = document.getElementById("playlist");
  const themeToggle = document.getElementById("theme-toggle");
  const downloadBtn = document.getElementById("download");
  
  const canvas = document.getElementById("visualizer");
  const ctx = canvas.getContext("2d");
  let audioCtx, analyser, src, dataArray;
  
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  
  function setupVisualizer() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      src = audioCtx.createMediaElementSource(audio);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
      analyser.fftSize = 64;
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / dataArray.length;
      dataArray.forEach((value, i) => {
        const height = value / 2;
        ctx.fillStyle = `rgb(${value + 100}, 50, 150)`;
        ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
      });
    }
    draw();
  }
  
  function loadSong(index) {
    const song = songs[index];
    title.textContent = song.title;
    artist.textContent = song.artist;
    cover.src = song.cover;
    audio.src = song.name;
    downloadBtn.href = song.name;
    downloadBtn.download = song.title;
    downloadBtn.style.display = "block";
    highlightPlaylist(index);
    updateFavoriteIcon();
  }
  
  function playSong() {
    audio.play();
    playBtn.textContent = "⏸️";
    setupVisualizer();
  }
  
  function pauseSong() {
    audio.pause();
    playBtn.textContent = "▶️";
  }
  
  function togglePlay() {
    audio.paused ? playSong() : pauseSong();
  }
  
  function nextSong() {
    currentIndex = isShuffle ? Math.floor(Math.random() * songs.length) : (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
    playSong();
  }
  
  function prevSong() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
    playSong();
  }
  
  function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const percent = (currentTime / duration) * 100;
    progress.style.width = `${percent}%`;
  }
  
  function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
  }
  
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });
  
  repeatBtn.addEventListener("click", () => {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? "#1db954" : "#fff";
  });
  
  audio.addEventListener("ended", () => {
    isRepeat ? playSong() : nextSong();
  });
  
  shuffleBtn.addEventListener("click", () => {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? "#1db954" : "#fff";
  });
  
  function buildPlaylist() {
    playlistEl.innerHTML = "";
    songs.forEach((song, index) => {
      const item = document.createElement("div");
      const heart = favorites.includes(song.name) ? "❤️" : "🤍";
      item.innerHTML = `<span>${song.title} - ${song.artist}</span><span>${heart}</span>`;
      item.addEventListener("click", () => {
        currentIndex = index;
        loadSong(currentIndex);
        playSong();
      });
      playlistEl.appendChild(item);
    });
    highlightPlaylist(currentIndex);
  }
  
  function highlightPlaylist(index) {
    const items = playlistEl.querySelectorAll("div");
    items.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
  }
  
  favoriteBtn.addEventListener("click", () => {
    const current = songs[currentIndex].name;
    if (favorites.includes(current)) {
      const i = favorites.indexOf(current);
      favorites.splice(i, 1);
    } else {
      favorites.push(current);
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    buildPlaylist();
    updateFavoriteIcon();
  });
  
  function updateFavoriteIcon() {
    const current = songs[currentIndex].name;
    favoriteBtn.textContent = favorites.includes(current) ? "❤️" : "🤍";
  }
  
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    themeToggle.textContent = document.body.classList.contains("light-theme") ? "🌞" : "🌙";
  });
  
  // Initialize player
  loadSong(currentIndex);
  buildPlaylist();
  playBtn.addEventListener("click", togglePlay);
  nextBtn.addEventListener("click", nextSong);
  prevBtn.addEventListener("click", prevSong);
  audio.addEventListener("timeupdate", updateProgress);
  progressContainer.addEventListener("click", setProgress);
  