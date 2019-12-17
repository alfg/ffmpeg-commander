const codecs = {
  // Video.
  x264: 'libx264',
  x265: 'libx265',
  vp8: 'libvpx',
  vp9: 'libvpx-vp9',
  av1: 'libaom-av1',
  mpeg2: 'mpeg2video',
  mpeg4: 'mpeg4 -vtag xvid',
  theora: 'libtheora',

  // Audio.
  aac: 'aac',
  alac: 'alac',
  dts: 'dca',
  ac3: 'ac3',
  vorbis: 'libvorbias',

  // Copy codec.
  copy: 'copy',
};

export default codecs;
