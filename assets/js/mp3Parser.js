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
  const b0 = header[0];
  const b1 = header[1];
  const b2 = header[2];
  const b3 = header[3];

  // Verify the sync word
  if (b0 === 0xff && (b1 & 0xe0) === 0xe0) {
    const versionBits = (b1 >> 3) & 0x03;
    const layerBits = (b1 >> 1) & 0x03;
    const bitrateIndex = (b2 >> 4) & 0x0f;
    const sampleRateIndex = (b2 >> 2) & 0x03;

    let version, layer;

    switch (versionBits) {
      case 0:
        version = 2.5;
        break;
      case 2:
        version = 2;
        break;
      case 3:
        version = 1;
        break;
      default:
        version = -1;
    }

    switch (layerBits) {
      case 1:
        layer = 3;
        break;
      case 2:
        layer = 2;
        break;
      case 3:
        layer = 1;
        break;
      default:
        layer = -1;
    }

    const bitrate = MPEG_BIT_RATES[layer - 1][bitrateIndex];
    const sampleRate =
      MPEG_SAMPLE_RATES[version === 1 ? 0 : version === 2 ? 1 : 2][
        sampleRateIndex
      ];

    return { bitrate, sampleRate };
  }

  throw new Error("Invalid MP3 frame header");
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
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Get file size in MB
    const fileSizeInBytes = data.length;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    // Find MP3 frame header (skip potential ID3 tags)
    let headerIndex = 0;
    while (headerIndex < data.length - 4) {
      if (
        data[headerIndex] === 0xff &&
        (data[headerIndex + 1] & 0xe0) === 0xe0
      ) {
        break;
      }
      headerIndex++;
    }

    if (headerIndex >= data.length - 4) {
      throw new Error("MP3 frame header not found");
    }

    const header = data.slice(headerIndex, headerIndex + 4);
    const { bitrate, sampleRate } = parseFrameHeader(header);

    // Extract file name from URL
    const fileName = url.split("/").pop();
    const trimmedFileName = trimFileName(fileName);

    return { fileName: trimmedFileName, sampleRate, bitrate, fileSizeInMB };
  } catch (error) {
    console.error("Error fetching or processing the audio file:", error);
  }
}
