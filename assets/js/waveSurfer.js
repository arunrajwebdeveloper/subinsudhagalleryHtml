// Gradient for wave color
const gradientMaker = ({ startColor = "#eee", endColor = "#ccc" }) => {
  var ctx = document.createElement("canvas").getContext("2d");
  var linGrad = ctx.createLinearGradient(0, 0, 1000, 128);
  linGrad.addColorStop(0, startColor);
  linGrad.addColorStop(1, endColor);
  return linGrad;
};

// Function to create a WaveSurfer instance and load the audio file
function createWaveSurfer(containerId, audioFile) {
  var wavesurfer = WaveSurfer.create({
    container: `#${containerId}`,
    backend: "MediaElement", // Use MediaElement backend to ensure cross-browser compatibility
    barWidth: 2,
    height: 60,
    responsive: true,
    dragToSeek: true,
    mediaControls: false,
    // progressColor: "orange",
    // waveColor: "#c6c6c6",
    waveColor: gradientMaker({ startColor: "#C6CDDC", endColor: "#B2B8D1" }),
    progressColor: gradientMaker({
      startColor: "#ffd17b",
      endColor: "#ffa500",
    }),
  });
  // Load the audio file
  wavesurfer.load(audioFile);

  // Event listener to update play/pause button text
  wavesurfer.on("loading", function (percent) {
    const sound__load__percent = document.getElementById(
      `sound__load__percent${containerId.charAt(containerId.length - 1)}`
    );

    sound__load__percent.innerText = `${percent}%`;
  });

  // on ready
  wavesurfer.on("ready", () => {
    const skeleton__loader = document.getElementById(
      `sound__skeleton__${containerId.charAt(containerId.length - 1)}`
    );

    const sound__item__block = document.getElementById(
      `sound__item__block__${containerId.charAt(containerId.length - 1)}`
    );

    skeleton__loader.remove();
    sound__item__block.classList.add("visible__element");

    // get meta
    getAudioMetaData(containerId, audioFile);
    // Set audio track total duration
    const duration = wavesurfer.getDuration();
    const time = wavesurfer.getCurrentTime();
    getTotalTime(containerId, duration);
    updateTimeRemaining(containerId, time, duration);
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
    const duration = wavesurfer.getDuration();
    updatePlayPauseButton(containerId, false);
    updateProgressBar(containerId, duration, 0);
    updateTimeRemaining(containerId, 0, duration);
  });

  // Event listener to log errors
  wavesurfer.on("error", function (e) {
    console.error(`Error loading audio for ${containerId}:`, e);
  });

  // Sets the timecode current timestamp as audio plays
  wavesurfer.on("audioprocess", (time) => {
    const duration = wavesurfer.getDuration();
    getCurrTime(containerId, time);
    updateProgressBar(containerId, duration, time);
    updateTimeRemaining(containerId, time, duration);
  });

  // Get current time in intraction
  wavesurfer.on("interaction", () => {
    const time = wavesurfer.getCurrentTime();
    const duration = wavesurfer.getDuration();
    getCurrTime(containerId, time);
    updateProgressBar(containerId, duration, time);
    updateTimeRemaining(containerId, time, duration);
  });

  // Get current time in seeking
  // wavesurfer.on("seeking", (time) => {
  //   const duration = wavesurfer.getDuration();
  //   getCurrTime(containerId, time);
  //   updateProgressBar(containerId, duration, time);
  //   updateTimeRemaining(containerId, time, duration)
  // });

  // Get current time in timeupdate
  wavesurfer.on("timeupdate", (time) => {
    const duration = wavesurfer.getDuration();
    getCurrTime(containerId, time);
    updateProgressBar(containerId, duration, time);
    updateTimeRemaining(containerId, time, duration);
  });

  return wavesurfer;
}

// Update progress svg
function updateProgressBar(containerId, duration, currentTime) {
  const progress_circle_svg = document.getElementById(
    `progress-circle-svg__${containerId.charAt(containerId.length - 1)}`
  );

  const progress = (currentTime / duration) * 224.82;
  progress_circle_svg.style.strokeDashoffset = 224.82 - progress;
}

const fileTypeColors = (type) => {
  switch (type) {
    case "mp3":
      return "badge__MP3";
    case "aac":
      return "badge__AAC";
    case "m4a":
      return "badge__M4A";
    case "wav":
      return "badge__WAV";
    case "wma":
      return "badge__WMA";
    default:
      return "";
  }
};

// GET AUDIO META DATA
async function getAudioMetaData(containerId, file) {
  const meta = await audioMetaData(file);
  const metadata = document.getElementById(
    `file-info-render${containerId.charAt(containerId.length - 1)}`
  );
  metadata.innerHTML = `
    <h2 class="item-title">${meta?.fileName}</h2>
    <span class="item-subtext">
      <em class="${fileTypeColors(meta?.fileType)}">${meta?.fileType}</em>
      ${meta?.sampleRate ? `<em>${meta?.sampleRate}Hz</em>` : ""}  
      ${meta?.bitrate ? `<em>${meta?.bitrate}Kbps</em>` : ""}
      <em>${meta?.fileSizeInMB}MB</em>
      ${meta?.channels ? `<em>CH ${meta?.channels}</em>` : ""}
    </span>`;
}

// Formats time as HH:MM:SS
const formatTimecode = (seconds) => {
  return new Date(seconds * 1000).toISOString().slice(11, 19);
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

// Update remaining time in mob ui
function updateTimeRemaining(containerId, currentTime, duration) {
  const timeRemaining = document.getElementById(
    `timeRemaining__${containerId.charAt(containerId.length - 1)}`
  );
  var remainingTime = duration - currentTime;
  timeRemaining.textContent = formatTime(remainingTime);
}

function formatTime(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map((unit) => String(unit).padStart(2, "0"))
    .join(":");
}

// Function to update play/pause button text
function updatePlayPauseButton(containerId, isPlaying) {
  const button = document.getElementById(
    `playPauseButton${containerId.charAt(containerId.length - 1)}`
  );
  if (button) {
    if (isPlaying) {
      button.classList.remove("play");
      button.classList.add("pause");
    } else {
      button.classList.remove("pause");
      button.classList.add("play");
    }
  }
}
