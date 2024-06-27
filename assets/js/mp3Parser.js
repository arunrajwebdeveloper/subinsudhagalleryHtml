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
const AAC_SAMPLE_RATES = [
  96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025,
  8000, 7350, 0, 0, 0,
];

function parseMP3Header(header) {
  const b0 = header[0];
  const b1 = header[1];
  const b2 = header[2];

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

function parseAACHeader(header) {
  const b0 = header[0];
  const b1 = header[1];
  const b2 = header[2];

  if ((b0 === 0xff && (b1 & 0xf0) === 0xf0) || (b0 === 0x56 && b1 === 0xe0)) {
    const sampleRateIndex = (b2 & 0x3c) >> 2;
    const sampleRate = AAC_SAMPLE_RATES[sampleRateIndex];
    return { bitrate: -1, sampleRate };
  }

  throw new Error("Invalid AAC frame header");
}

function parseWAVHeader(data) {
  const sampleRate =
    data[24] | (data[25] << 8) | (data[26] << 16) | (data[27] << 24);
  const byteRate =
    data[28] | (data[29] << 8) | (data[30] << 16) | (data[31] << 24);
  const bitsPerSample = data[34] | (data[35] << 8);
  const channels = data[22] | (data[23] << 8);
  const bitrate = (byteRate * 8) / 1000;
  return { bitrate, sampleRate, channels, bitsPerSample };
}

function parseWMAHeader(data) {
  const sampleRate =
    data[24] | (data[25] << 8) | (data[26] << 16) | (data[27] << 24);
  const byteRate =
    data[28] | (data[29] << 8) | (data[30] << 16) | (data[31] << 24);
  const bitsPerSample = data[34] | (data[35] << 8);
  const channels = data[22] | (data[23] << 8);
  const bitrate = (byteRate * 8) / 1000;
  return { bitrate, sampleRate, channels, bitsPerSample };
}

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

    const fileSizeInBytes = data.length;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    const fileNameWithExtension = url.split("/").pop();
    const [fileName, fileType] = fileNameWithExtension.split(".");
    const trimmedFileName = trimFileName(fileName);

    let metadata;

    if (fileType === "mp3") {
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
      metadata = parseMP3Header(header);
    } else if (fileType === "aac" || fileType === "m4a") {
      let headerIndex = 0;
      while (headerIndex < data.length - 7) {
        if (
          (data[headerIndex] === 0xff &&
            (data[headerIndex + 1] & 0xf0) === 0xf0) ||
          (data[headerIndex] === 0x56 && data[headerIndex + 1] === 0xe0)
        ) {
          break;
        }
        headerIndex++;
      }
      if (headerIndex >= data.length - 7) {
        throw new Error("AAC frame header not found");
      }
      const header = data.slice(headerIndex, headerIndex + 7);
      metadata = parseAACHeader(header);
    } else if (fileType === "wav") {
      metadata = parseWAVHeader(data);
    } else if (fileType === "wma") {
      metadata = parseWMAHeader(data);
    } else {
      throw new Error("Unsupported file type");
    }

    return {
      fileName: trimmedFileName,
      sampleRate: metadata?.sampleRate ?? null,
      bitrate: metadata?.bitrate > 0 ? metadata?.bitrate : null,
      fileSizeInMB,
      fileType,
      channels: metadata?.channels ?? null,
    };
  } catch (error) {
    console.error("Error fetching or processing the audio file:", error);
  }
}
