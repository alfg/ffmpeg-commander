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
  codecs: [
    { name: 'x264', value: 'x264', type: 'mp4' },
    { name: 'x265', value: 'x265', type: 'mp4' },
    { name: 'VP9', value: 'vp9', type: 'webm' },
    { name: 'copy', value: 'copy', type: null },
  ],
};

export default config;
