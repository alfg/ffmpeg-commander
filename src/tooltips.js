const tooltips = [
  { value: 'ffmpeg', tip: 'Command used to run FFmpeg.' },

  // Options.
  { value: '-i', tip: 'Input file.' },
  { value: '-c:v', tip: 'Selects a video codec.' },
  { value: '-c:a', tip: 'Selects an audio codec.' },
  { value: '-ss', tip: 'Specify a start timestamp.' },
  { value: '-to', tip: 'Specify a stop timestamp.' },
  { value: '-preset', tip: 'A preset is a collection of options that will provide a certain encoding speed to compression ratio.' },
  { value: '-hwaccel', tip: 'Use hardware acceleration to decode the matching stream(s).' },
  { value: '-crf', tip: 'Constant Rate Factor (CRF). Use this rate control if you want to keep the best quality and care less about the file size.' },
  { value: '-pass', tip: 'Select the pass number (1 or 2). It is used to do two-pass video encoding.' },
  { value: '-b:v', tip: 'Specifies the target (average) bit rate for the encoder to use.' },
  { value: '-b:a', tip: 'Specifies the target (average) bit rate for the encoder to use.' },
  { value: '-minrate', tip: 'Specifies a minimum tollerance to be used.' },
  { value: '-maxrate', tip: 'Specifies a maximum tolerance. This is only used in conjuction with -bufsize.' },
  { value: '-bufsize', tip: 'Specifies the decoder buffer size, which determines the variability of the output bitrate.' },
  { value: '-pix_fmt', tip: 'Set pixel format. Use -pix_fmts to show all the supported pixel formats.' },
  { value: '-r', tip: 'Set frame rate (Hz value, fraction or abbreviation).' },
  { value: '-tune', tip: 'Use -tune to change settings based upon the specifics of your input.' },
  { value: '-profile:v', tip: 'The -profile:v option limits the output to a specific H.264 profile. Some devices (mostly very old or obsolete) only support the more limited Constrained Baseline or Main profiles. You can set these profiles with -profile:v baseline or -profile:v main.' },
  { value: '-level', tip: 'Set the -profile:v level for h.264.' },
  { value: '-movflags faststart', tip: 'Move the index (moov atom) to the beginning of the file. This operation can take a while, and will not work in various situations such as fragmented output, thus it is not enabled by default.' },
  { value: '-aspect', tip: 'Set the video display aspect ratio specified by aspect.' },
  { value: '-vf', tip: 'Create the filtergraph specified by <em>filtergraph</em> and use it to filter the stream. This is an alias for <code>-filter:v</code>, see the <a href="https://ffmpeg.org/ffmpeg.html#filter_005foption">-filter option.</a>' },
  { value: '-af', tip: 'Create the filtergraph specified by <em>filtergraph</em> and use it to filter the stream. This is an alias for <code>-filter:a</code>, see the <a href="https://ffmpeg.org/ffmpeg.html#filter_005foption">-filter option.</a>' },
  { value: '-rematrix_maxval', tip: 'Set maximum output value for rematrixing. This can be used to prevent clipping vs. preventing volume reduction. A value of 1.0 prevents clipping.' },
  { value: '-ac', tip: 'Set the number of audio channels. For output streams it is set by default to the number of input audio channels. For input streams this option only makes sense for audio grabbing devices and raw demuxers and is mapped to the corresponding demuxer options.' },
  { value: '-ar', tip: 'Set the audio sampling frequency. For output streams it is set by default to the frequency of the corresponding input stream. For input streams this option only makes sense for audio grabbing devices and raw demuxers and is mapped to the corresponding demuxer options.' },
  { value: '-f', tip: 'Force output file format.' },
  { value: '-y', tip: 'Overwrite output files without asking.' },

  // Values.
  { value: 'copy', tip: 'Skip the decoding and encoding step for the specified stream, so it does only demuxing and muxing.' },
  { value: 'libx264', tip: 'H.264/AVC Encoder' },
  { value: 'libx265', tip: 'H.265/HEVC Encoder.' },
  { value: 'scale', tip: 'Scale (resize) the input video, using the libswscale library.' },
];

export default tooltips;
