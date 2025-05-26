let currentSong = new Audio()
let songs;

function secondsToMinutesSeconds(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "invalid input";
    }
    const minutes = Math.floor(seconds / 60);
    const remSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

let currFolder;
async function getSongs(folder) {
    currFolder = folder;
    let a =  await fetch(`/songs/${currFolder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let i = 0; i < as.length; ++i) {
        const element = as[i];
        if(element.href.endsWith('.mp3')) {
            songName = element.href.split(`/${currFolder}/`)
            songs.push(songName[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""  // previous content is removed from playlist
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + 
        `<li>
            <img id="music-icon" src="/img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Priya</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img src="/img/play.svg"">
            </div>
        </li>`
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    
    return songs
}
const playMusic = (track, pause = false) => {
    // Reset the song source and play
    currentSong.src = `/songs/${currFolder}/` + track

    if(!pause) {
        // if song is not paused, then play the song
        currentSong.play()
        play.src = "/img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs")) {
            let folder = e.href.split('/').slice(-2, -1)[0];  
            
            // get metadata of the folder
            let a = await fetch(`${e.href}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
                    <img src="${e.href}/cover.jpg">
                    <img class="card-play" src="/img/play.svg">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>
            `
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
async function main() {
    // get song list
    await getSongs("ncs")
    playMusic(songs[0], true)

    // display all albums 
    displayAlbums()

    // Play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "/img/pause.svg"
        } else {
            currentSong.pause()
            play.src = "/img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%"; 
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger-icon").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".plus-icon").style.display = "none"
    })

    // Add an event listener to close icon
    document.querySelector(".close-icon").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
        document.querySelector(".plus-icon").style.display = "block"
    })
 
    // Add an event listener to previous button
    playPrevious.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1])
        if(index > 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[songs.length - 1])
        }
    })

    // Add an event listener to next button
    playNext.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1])
        if(index + 1 < songs.length) {
            playMusic(songs[index + 1])
        } else {
            playMusic(songs[0]);
        }
    })

    // Add an event listener to volume button
    document.getElementById("volumeRange").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add an event listener to mute the volume
    document.querySelector(".volume > img").addEventListener("click", (e) => {
        if(e.target.src.includes("volume.svg")) {
            e.target.src = "/img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = "/img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })

}

main()
