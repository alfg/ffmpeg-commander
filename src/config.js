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
      { name: 'x264', value: 'x264', supported: ['mp4', 'mkv'] },
      { name: 'x265', value: 'x265', supported: ['mp4', 'mkv'] },
      { name: 'AV1', value: 'av1', supported: ['mp4', 'mkv'] },
      { name: 'VP8', value: 'vp8', supported: ['webm', 'mkv'] },
      { name: 'VP9', value: 'vp9', supported: ['webm', 'mkv'] },
      { name: 'copy', value: 'copy', supported: null },
    ],
    audio: [
      { name: 'AAC', value: 'aac', supported: ['mp4', 'm4a', 'mkv'] },
      { name: 'AC3', value: 'ac3', supported: ['mp4', 'mkv'] },
      { name: 'DTS', value: 'dts', supported: ['mp4', 'mkv'] },
      { name: 'Vorbis', value: 'vorbis', supported: ['mp4', 'mkv', 'ogg'] },
      { name: 'Opus', value: 'opus', supported: ['mp4', 'mkv', 'ogg'] },
      { name: 'LAME', value: 'lame', supported: ['mp3', 'mkv'] },
      { name: 'ALAC', value: 'alac', supported: ['m4a'] },
      { name: 'FLAC', value: 'flac', supported: ['flac', 'mkv'] },
      { name: 'PCM', value: 'pcm', supported: ['mkv'] },
      { name: 'Copy', value: 'copy', supported: null },
      { name: 'None', value: 'none', supported: null },
    ],
  },
  videoSpeeds: [
    { name: 'Placebo', value: 'placebo' },
    { name: 'Very Slow', value: 'veryslow' },
    { name: 'Slower', value: 'slower' },
    { name: 'Slow', value: 'slow' },
    { name: 'Medium', value: 'medium' },
    { name: 'Fast', value: 'fast' },
    { name: 'Faster', value: 'faster' },
    { name: 'Very Fast', value: 'veryfast' },
    { name: 'Super Fast', value: 'superfast' },
    { name: 'Ultra Fast', value: 'ultrafast' },
    { name: 'None', value: 'none' },
  ],
  hardwareAccelerationOptions: [
    { name: 'Off', value: 'off' },
    { name: 'dxva2', value: 'dxva2' },

    // NVidia HW Codec.
    { name: 'nvenc', value: 'nvenc' },
  ],
};

export default config;
