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
    const duration = wavesurfer.getDuration();
    updatePlayPauseButton(containerId, false);
    updateProgressBar(containerId, duration, 0);
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
  });

  // Get current time in intraction
  wavesurfer.on("interaction", () => {
    const time = wavesurfer.getCurrentTime();
    const duration = wavesurfer.getDuration();
    getCurrTime(containerId, time);
    updateProgressBar(containerId, duration, time);
  });

  // Get current time in seeking
  // wavesurfer.on("seeking", (time) => {
  //   const duration = wavesurfer.getDuration();
  //   getCurrTime(containerId, time);
  //   updateProgressBar(containerId, duration, time);
  // });

  // Get current time in timeupdate
  wavesurfer.on("timeupdate", (time) => {
    const duration = wavesurfer.getDuration();
    getCurrTime(containerId, time);
    updateProgressBar(containerId, duration, time);
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
    if (isPlaying) {
      button.classList.remove("play");
      button.classList.add("pause");
    } else {
      button.classList.remove("pause");
      button.classList.add("play");
    }
  }
}
