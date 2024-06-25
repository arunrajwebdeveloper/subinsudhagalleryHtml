// Function to create a WaveSurfer instance and load the audio file
function createWaveSurfer(containerId, audioFile) {
  var wavesurfer = WaveSurfer.create({
    container: `#${containerId}`,
    waveColor: "#c6c6c6",
    progressColor: "orange",
    backend: "MediaElement", // Use MediaElement backend to ensure cross-browser compatibility
    barWidth: 2,
    height: 60,
    responsive: true,
    dragToSeek: true,
  });

  // Load the audio file
  wavesurfer.load(audioFile);

  // Event listener to update play/pause button text

  wavesurfer.on("loading", function (percent) {
    const loadingElement = document.getElementById(
      `loading-element${containerId.charAt(containerId.length - 1)}`
    );
    loadingElement.innerHTML = `<div>${percent}%</div>`;
  });

  // on ready
  wavesurfer.on("ready", () => {
    const loadingElement = document.getElementById(
      `loading-element${containerId.charAt(containerId.length - 1)}`
    );
    loadingElement.style.display = "none";

    // get meta
    getAudioMetaData(containerId, audioFile);
    // Set audio track total duration
    const duration = wavesurfer.getDuration();
    getTotalTime(containerId, duration);
  });

  // Event listener to update play/pause button text
  wavesurfer.on("play", function () {
    updatePlayPauseButton(containerId, true);
  });

  wavesurfer.on("pause", function () {
    updatePlayPauseButton(containerId, false);
  });

  // Handle audio end event
  wavesurfer.on("finish", () => {
    wavesurfer.seekTo(0); // Seek back to the start
    updatePlayPauseButton(containerId, false);
  });

  // Event listener to log errors
  wavesurfer.on("error", function (e) {
    console.error(`Error loading audio for ${containerId}:`, e);
  });

  // Sets the timecode current timestamp as audio plays
  wavesurfer.on("audioprocess", () => {
    const time = wavesurfer.getCurrentTime();
    getCurrTime(containerId, time);
  });

  // Get current time in intraction
  wavesurfer.on("interaction", () => {
    const time = wavesurfer.getCurrentTime();
    getCurrTime(containerId, time);
  });

  return wavesurfer;
}

// GET AUDIO META DATA

async function getAudioMetaData(containerId, file) {
  const meta = await audioMetaData(file);
  const metadata = document.getElementById(
    `file-info-render${containerId.charAt(containerId.length - 1)}`
  );
  metadata.innerHTML = `
  <h2 class="item-title">${meta?.fileName}</h2>
  <span class="item-subtext">
    <em>${meta?.sampleRate ?? "__"}Hz</em>  
    <em>${meta?.bitrate ?? "__"}Kbps</em>
    <em>${meta?.fileSizeInMB ?? "__"}MB</em>
    </span>`;
}

// Formats time as HH:MM:SS
const formatTimecode = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(11, 8);
};

// get total duration
function getTotalTime(containerId, duration) {
  const totalDuration = document.getElementById(
    `totalDuration${containerId.charAt(containerId.length - 1)}`
  );
  totalDuration.innerHTML = formatTimecode(duration);
}

// get current time
function getCurrTime(containerId, time) {
  const currentTime = document.getElementById(
    `currentTime${containerId.charAt(containerId.length - 1)}`
  );

  currentTime.innerHTML = formatTimecode(time);
}

// Function to update play/pause button text
function updatePlayPauseButton(containerId, isPlaying) {
  const button = document.getElementById(
    `playPauseButton${containerId.charAt(containerId.length - 1)}`
  );
  if (button) {
    // button.textContent = isPlaying ? "Pause" : "Play";
    if (isPlaying) {
      button.classList.remove("play");
      button.classList.add("pause");
    } else {
      button.classList.remove("pause");
      button.classList.add("play");
    }
  }
}
