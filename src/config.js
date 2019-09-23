const config = {
  containers: {
    video: [
      { name: 'MP4', value: 'mp4' },
      { name: 'MKV', value: 'mkv' },
      { name: 'WebM', value: 'webm' },
      { name: 'MPG', value: 'mpg' },
      { name: 'AVI', value: 'avi' },
      { name: 'OGV', value: 'ogv' },
    ],
    audio: [
      { name: 'MP3', value: 'mp3' },
      { name: 'M4A', value: 'm4a' },
      { name: 'OGG', value: 'ogg' },
      { name: 'FLAC', value: 'flac' },
      { name: 'WAV', value: 'wav' },
    ],
  },
  codecs: {
    video: [
      { name: 'x264', value: 'x264', supported: ['mp4'] },
      { name: 'x265', value: 'x265', supported: ['mp4'] },
      { name: 'VP9', value: 'vp9', supported: ['webm'] },
      { name: 'copy', value: 'copy', supported: null },
    ],
    audio: [
      { name: 'AAC', value: 'aac', supported: ['mp4', 'm4a'] },
      { name: 'AC3', value: 'ac3', supported: ['mp4'] },
      { name: 'DTS', value: 'dts', supported: ['mp4'] },
      { name: 'Vorbis', value: 'vorbis', supported: ['mp4', 'ogg'] },
      { name: 'Opus', value: 'opus', supported: ['mp4', 'ogg'] },
      { name: 'LAME', value: 'lame', supported: ['mp3'] },
      { name: 'ALAC', value: 'alac', supported: ['m4a'] },
      { name: 'FLAC', value: 'flac', supported: ['flac'] },
      { name: 'Copy', value: 'copy', supported: null },
      { name: 'None', value: 'none', supported: null },
    ],
  },
};

export default config;
