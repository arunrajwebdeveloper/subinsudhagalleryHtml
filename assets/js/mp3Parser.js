const MPEG_BIT_RATES = [
  [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
];
const MPEG_SAMPLE_RATES = [
  [44100, 48000, 32000, 0],
  [22050, 24000, 16000, 0],
  [11025, 12000, 8000, 0],
];

function parseFrameHeader(header) {
  const b1 = header[1];
  const b2 = header[2];
  const versionBits = (b1 >> 3) & 0x03;
  const layerBits = (b1 >> 1) & 0x03;
  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0x03;

  const version = versionBits === 3 ? 2 : versionBits === 2 ? 1 : 0;
  const layer = 4 - layerBits;
  const bitrate = MPEG_BIT_RATES[layer - 1][bitrateIndex];
  const sampleRate = MPEG_SAMPLE_RATES[version][sampleRateIndex];

  return { bitrate, sampleRate };
}

// Trim text
function trimFileName(fileName, maxLength = 30) {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const start = fileName.substring(0, 15);
  const end = fileName.substring(fileName.length - 15);
  return `${start}...${end}`;
}

async function audioMetaData(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      const data = new Uint8Array(buffer);

      // Get file size in MB
      const fileSizeInBytes = data.length;
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

      // Parse MP3 headers
      const header = data.slice(0, 4);
      const { bitrate, sampleRate } = parseFrameHeader(header);

      // Extract file name from URL
      const fileName = url.split("/").pop();
      const trimmedFileName = trimFileName(fileName);

      return { fileName: trimmedFileName, sampleRate, bitrate, fileSizeInMB };
    })
    .catch((error) => {
      console.error("Error fetching or processing the audio file:", error);
    });
}
