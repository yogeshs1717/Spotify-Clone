console.log('lets write javascript');

let currentSong = new Audio();
let songs = [];
let currfolder = "";

// Utility function to format time
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Fetch songs from a folder
async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/info.json`);
    let response = await a.json();
    songs = response.tracks;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
                <div>prince</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listeners for each song
    Array.from(document.querySelectorAll(".songList li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info").firstElementChild.innerHTML;
            playMusic(`${currfolder}/${track}`);
        });
    });

    return songs;
}


// Play a specific track
const playMusic = (track, pause = false) => {
    currentSong.src = `${currfolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Display album cards
async function displayAlbums() {
    let res = await fetch("songs/albums.json");
    let data = await res.json();
    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of data.albums) {
        let infoRes = await fetch(`songs/${folder}/info.json`);
        let info = await infoRes.json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44" height="44" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="green" stroke-width="1.5" fill="green"/>
                        <path d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z" fill="black"/>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
    }

    // Attach click to cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

// Main logic
async function main() {
    // Get button references
    let play = document.getElementById("play");
    let previous = document.getElementById("previous");
    let next = document.getElementById("next");

    songs = await getSongs("songs/Indian");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    await displayAlbums();

    // Play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update song time + seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Previous
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1]);
        }
    });

    // Next
    next.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((currentIndex + 1) < songs.length) {
            playMusic(songs[currentIndex + 1]);
        }
    });

    // Volume range
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        console.log("Setting volume to", currentSong.volume);
        document.querySelector(".volume>img").src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });
}

// Hamburger menu
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
});

// Volume toggle button
document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
        e.target.src = "img/mute.svg";
        currentSong.volume = 0;
        document.querySelector(".range input").value = 0;
    } else {
        e.target.src = "img/volume.svg";
        currentSong.volume = 0.5;
        document.querySelector(".range input").value = 50;
    }
});

main();
