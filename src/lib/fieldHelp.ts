/**
 * Plain-language help for the form controls, shown in a popover beside each
 * label. Keyed by the control's id, so Field and Range pick it up without the
 * sections wiring anything.
 *
 * Written for someone learning ffmpeg: what the setting does, which flag it
 * sets, and when you would change it. lib/tooltips.ts describes the flags in the
 * generated command; this describes the controls that produce them.
 */
export interface FieldHelp {
  /** What the setting does and when to change it. Plain text. */
  text: string
  /** The ffmpeg flag or filter it controls. */
  flag?: string
  /** Notes on individual choices, keyed by option value. */
  values?: Record<string, string>
}

const vbv = 'Only matters for streaming or devices with a bandwidth limit; leave empty otherwise.'

const help: Record<string, FieldHelp> = {
  // Input / output.
  'io-input': {
    flag: '-i',
    text: 'The file or stream to read. Use the protocol picker to fill in a URL template for FTP, HTTP, RTMP, SRT and so on.',
  },
  'io-output': {
    text: 'The file to write, always the last argument. Its extension follows the container chosen on the Format tab.',
  },

  // Format.
  'format-container': {
    text: 'The file format that holds the video and audio streams. It decides which codecs you can use and where the file will play.',
    values: {
      mp4: 'Plays almost everywhere: browsers, phones, TVs. The safe default.',
      mkv: 'Holds nearly any codec plus subtitles and chapters. Great for archiving; less supported on phones and browsers.',
      webm: 'Open web format for VP8, VP9 or AV1 video with Vorbis or Opus audio.',
      mpg: 'MPEG program stream, used by DVDs and older players.',
      avi: 'Legacy Windows format. Only pick it for old software that needs it.',
      ogv: 'Ogg video, usually Theora. Rarely used today.',
      flv: 'Flash video. Mostly obsolete, though some RTMP streaming still uses it.',
      mp3: 'Audio only. Plays on anything.',
      m4a: 'Audio-only MP4, usually AAC or Apple Lossless.',
      ogg: 'Audio-only Ogg, for Vorbis or Opus.',
      flac: 'Lossless compressed audio.',
      wav: 'Uncompressed audio. Large files, no quality loss.',
    },
  },
  'format-clip': {
    text: 'Cut out part of the input instead of converting all of it. Enabling this shows the start and stop times.',
  },
  'format-start': {
    flag: '-ss',
    text: 'Where the clip begins, as HH:MM:SS (fractions like 00:01:30.5 work) or plain seconds. Placed after -i, so ffmpeg seeks accurately but reads from the start of the file to get there.',
  },
  'format-stop': {
    flag: '-to',
    text: 'Where the clip ends, measured from the start of the input, not the length of the clip. Same format as the start time.',
  },

  // Video: encoder.
  'video-codec': {
    flag: '-c:v',
    text: 'The video encoder. It decides compatibility, file size for a given quality, and how long encoding takes.',
    values: {
      x264: 'H.264 (libx264). The most compatible choice and a good default.',
      x265: 'HEVC (libx265). Similar quality to H.264 in a noticeably smaller file, but slower to encode and not supported by every browser.',
      h264_nvenc: 'H.264 on an NVIDIA GPU. Much faster than x264, but larger files at the same quality. Needs an NVIDIA card and an ffmpeg build with NVENC.',
      hevc_nvenc: 'HEVC on an NVIDIA GPU. Fast, with the same trade-offs as h264_nvenc.',
      h264_videotoolbox: 'H.264 on Apple hardware (macOS). Very fast, larger files than x264 at the same quality.',
      hevc_videotoolbox: 'HEVC on Apple hardware (macOS). Very fast; for 10-bit, pick Main 10 and a 10-bit pixel format.',
      av1: 'AV1 (libaom). The best compression here, but by far the slowest to encode.',
      vp8: 'VP8 (libvpx). The older WebM codec; prefer VP9 unless something needs VP8.',
      vp9: 'VP9 (libvpx-vp9). Open codec used by YouTube and WebM, comparable to HEVC.',
      copy: 'Copy the video as-is without re-encoding. Instant and lossless, but no filters, resizing or quality changes apply.',
      none: 'Drop the video track entirely (-vn), e.g. to extract audio.',
    },
  },
  'video-preset': {
    flag: '-preset',
    text: 'Trades encoding speed for compression. Slower presets make a smaller file at the same quality; faster ones finish sooner with a bigger file. Pick the slowest you have patience for.',
    values: {
      none: 'Use the encoder default (medium for x264 and x265).',
      placebo: 'Barely better than Very Slow and enormously slower. Not worth it.',
      veryslow: 'Smallest files for the time spent. Good for archiving.',
      medium: 'The x264/x265 default. A sensible balance.',
      ultrafast: 'Fastest, with much larger files. Handy for quick tests or live capture.',
      hp: 'NVENC high performance: favours speed.',
      hq: 'NVENC high quality: favours quality.',
      bd: 'NVENC Blu-ray disc compatible settings.',
      lossless: 'NVENC lossless. Very large files.',
      losslesshp: 'NVENC lossless, favouring speed.',
    },
  },
  'video-pass': {
    text: 'How the encoder decides how many bits to spend.',
    values: {
      crf: 'Constant quality: you pick a quality level and the file size follows. Best for most encodes.',
      '1': 'One pass aiming at the bit rate below. Predictable size, but quality varies with the content. Without a bit rate, x264 and x265 fall back to their default quality.',
      '2': 'Two passes: the first analyses the video, the second hits the bit rate as efficiently as possible. Best when you need a specific file size. Needs a bit rate.',
    },
  },
  'video-crf': {
    flag: '-crf',
    text: 'Quality level for constant-quality encoding. Lower is better quality and a bigger file. For x264, 23 is the default and about 18 looks visually lossless; x265 defaults to 28. Each step of about 6 roughly halves or doubles the file size.',
  },

  // Video: bit rate.
  'video-bitrate': {
    flag: '-b:v',
    text: 'Target average bit rate. Add a unit: 3000k is 3 Mbit/s. A bare number means bits per second, so 2000 is only 2 kbit/s. Required for two-pass.',
  },
  'video-minrate': {
    flag: '-minrate',
    text: `The lowest bit rate the encoder should drop to. ${vbv}`,
  },
  'video-maxrate': {
    flag: '-maxrate',
    text: `Caps the bit rate at peaks, e.g. to stay under a streaming limit. Set it together with a buffer size. ${vbv}`,
  },
  'video-bufsize': {
    flag: '-bufsize',
    text: 'How far the bit rate may swing around the target before max rate is enforced. Often 1–2× the max rate; smaller means a steadier bit rate.',
  },
  'video-gopsize': {
    flag: '-g',
    text: 'Maximum frames between keyframes. Smaller values make seeking and stream segments snappier at the cost of size. A keyframe every 2 seconds (e.g. 48 at 24 fps) is common for streaming.',
  },

  // Video: encoding.
  'video-pixel_format': {
    flag: '-pix_fmt',
    text: 'How colour is stored in each frame. Leave it on auto unless something requires a specific format.',
    values: {
      auto: 'Let ffmpeg pick, usually matching the source.',
      yuv420p: 'The most compatible format. Browsers, phones and QuickTime expect it for H.264.',
      yuv420p10le: '10-bit colour: smoother gradients with less banding. Needs a 10-bit profile such as Main 10.',
      yuv422p: 'More colour detail than 4:2:0. Used in editing and broadcast; not widely playable.',
      yuv444p: 'Full colour detail. Useful for screen recordings with sharp coloured text; poorly supported by players.',
      nv12: '4:2:0 in a layout hardware encoders and decoders prefer.',
      gray: 'Black and white only.',
    },
  },
  'video-frame_rate': {
    flag: '-r',
    text: 'Output frames per second. Lowering it drops frames and raising it duplicates them; it does not create slow motion (use Speed for that).',
    values: {
      auto: 'Keep the source frame rate.',
      ntsc: '29.97 fps (30000/1001), the North American TV rate.',
      pal: '25 fps, the European TV rate.',
      film: '24 fps, the cinema rate.',
    },
  },
  'video-speed': {
    flag: 'setpts',
    text: 'Plays the video faster or slower by rescaling its timestamps. Only the video changes speed, so the audio will drift out of sync; consider removing the audio.',
  },
  'video-tune': {
    flag: '-tune',
    text: 'Adjusts x264 and x265 for a type of content. x265 accepts only Grain, Animation, Fast Decode and Zero Latency.',
    values: {
      none: 'No tuning. Right for most content.',
      film: 'High-quality live-action footage. x264 only.',
      animation: 'Cartoons and anime with flat colour areas.',
      grain: 'Keeps film grain instead of smoothing it away. Makes larger files.',
      stillimage: 'Slideshow-like content that barely moves. x264 only.',
      fastdecode: 'Turns off features that are expensive to decode, for weak playback devices.',
      zerolatency: 'Live streaming and video calls: no frames held back for look-ahead.',
    },
  },
  'video-profile': {
    flag: '-profile:v',
    text: 'Restricts the encoder to a feature set so older or limited devices can play the file. Leave it on None unless a device or service asks for one.',
    values: {
      none: 'Let the encoder choose.',
      baseline: 'H.264 for very old phones and devices. Least efficient.',
      main: 'Broadly compatible H.264 or HEVC.',
      high: 'The usual H.264 profile for HD video on modern devices.',
      main10: '10-bit HEVC. Pair it with a 10-bit pixel format.',
      rext: 'HEVC range extensions, for 4:2:2 or 4:4:4 colour and higher bit depths.',
      '0': 'VP9 8-bit 4:2:0. The one most players support.',
      '1': 'VP9 8-bit with 4:2:2 or 4:4:4 colour.',
      '2': 'VP9 10- or 12-bit 4:2:0.',
      '3': 'VP9 10- or 12-bit with 4:2:2 or 4:4:4 colour.',
    },
  },
  'video-level': {
    flag: '-level',
    text: 'Caps resolution, frame rate and bit rate so a specific device can decode the file. For example, 3.1 fits 720p and 4.0/4.1 fit 1080p30. Leave it on None unless something requires it.',
  },

  // Video: size.
  'video-faststart': {
    flag: '-movflags faststart',
    text: 'Moves the MP4 index to the front of the file so playback can start before the whole file downloads. Turn it on for video served on the web.',
  },
  'video-size': {
    flag: 'scale',
    text: 'Resizes the video. The presets set one side and keep the source aspect ratio for the other; Custom lets you enter both.',
  },
  'video-format': {
    text: 'Which side the Size preset applies to. Widescreen sets the width; Full Screen sets the height. The other side follows the source aspect ratio.',
  },
  'video-width': {
    text: 'Output width in pixels. Use -1 to keep the aspect ratio from the height, or -2 to do the same while rounding to an even number, which most encoders need.',
  },
  'video-height': {
    text: 'Output height in pixels. Use -1 to keep the aspect ratio from the width, or -2 to do the same while rounding to an even number.',
  },
  'video-fit': {
    text: 'What to do when the custom size has a different shape from the source.',
    values: {
      false: 'Stretch to exactly this width and height. The picture distorts if the shapes differ.',
      true: 'Shrink to fit inside the box while keeping the aspect ratio, rounded to even dimensions. One side may come out smaller than you asked.',
    },
  },
  'video-aspect': {
    flag: '-aspect',
    text: 'Sets the display aspect ratio stored in the file. It does not resize the pixels; players stretch the picture to this shape when showing it.',
  },
  'video-scaling': {
    flag: 'scale flags',
    text: 'The resampling algorithm used when resizing. It only applies when a size is set.',
    values: {
      auto: "ffmpeg's default, bicubic.",
      neighbor: 'Nearest neighbour: no smoothing, blocky. Good for pixel art.',
      area: 'Averages pixels. Good for shrinking.',
      fast_bilinear: 'Fastest smooth option, lower quality.',
      bilinear: 'Fast and soft.',
      bicubic: 'A good balance of sharpness and speed.',
      bicublin: 'Bicubic for brightness, bilinear for colour.',
      gauss: 'Soft, slightly blurred result.',
      sinc: 'Very sharp, but can add halos around edges.',
      lanczos: 'Sharp and a popular choice for downscaling.',
      spline: 'Sharp, similar to Lanczos.',
      experimental: 'Experimental scaler. Avoid for real work.',
    },
  },
  'video-codec-options': {
    text: 'Raw encoder settings passed straight to x264 or x265 as key=value pairs separated by colons, e.g. keyint=72:scenecut=0. Only used with those two codecs.',
  },

  // Audio.
  'audio-codec': {
    flag: '-c:a',
    text: 'The audio encoder. Pick one that the container supports and your players can decode.',
    values: {
      aac: 'The standard for MP4 and M4A. Widely compatible.',
      ac3: 'Dolby Digital. Common for surround sound on DVDs and TVs.',
      dts: 'DTS surround. ffmpeg\'s DTS encoder is experimental.',
      vorbis: 'Open codec for Ogg and WebM. Opus is usually the better choice now.',
      opus: 'Excellent quality even at low bit rates. For WebM, Ogg and MKV.',
      lame: 'MP3. Plays on anything.',
      alac: 'Apple Lossless: no quality loss, for Apple devices.',
      flac: 'Lossless and open. Roughly half the size of WAV.',
      pcm: 'Uncompressed 16-bit audio. Large, no quality loss.',
      copy: 'Copy the audio as-is. Instant and lossless, but volume and audio filters cannot apply.',
      none: 'Drop the audio track entirely (-an).',
    },
  },
  'audio-channel': {
    flag: '-ac',
    text: 'Number of audio channels. Converting to fewer channels mixes them down; ffmpeg is told to avoid clipping while doing so.',
  },
  'audio-quality': {
    flag: '-b:a',
    text: 'Audio bit rate. For stereo AAC, 128k sounds good and 192k or more is hard to tell from the original. Opus sounds good from about 96k.',
  },
  'audio-bitrate': {
    flag: '-b:a',
    text: 'A custom audio bit rate, with a unit: 192k is 192 kbit/s.',
  },
  'audio-samplerate': {
    flag: '-ar',
    text: 'Samples per second. 48k is standard for video and 44.1k for music. Raising it above the source adds size but no quality.',
  },
  'audio-volume': {
    flag: 'volume',
    text: 'Scales the loudness: 100 leaves it unchanged, 50 halves it, 200 doubles it. Large increases can clip. Needs an audio codec other than Copy.',
  },

  // Filters: video.
  'filters-deband': {
    flag: 'deband',
    text: 'Smooths out banding, the visible stripes in gradients such as skies. Useful on heavily compressed sources.',
  },
  'filters-deflicker': {
    flag: 'deflicker',
    text: 'Evens out brightness that pulses from frame to frame, as in timelapses or footage under flickering lights.',
  },
  'filters-deshake': {
    flag: 'deshake',
    text: 'Reduces small camera shake from hand-held shots or a bumped tripod. The edges uncovered as the frame shifts are filled in from the picture.',
  },
  'filters-dejudder': {
    flag: 'dejudder',
    text: 'Removes the uneven motion left in partially telecined footage, where film was converted to TV frame rates.',
  },
  'filters-denoise': {
    text: 'Reduces noise and grain. Stronger settings remove more noise but also soften fine detail.',
    values: {
      light: 'A light spatial filter (removegrain).',
      medium: 'Wavelet denoising (vaguedenoiser) at a moderate strength.',
      heavy: 'Wavelet denoising at double the medium strength, for very noisy footage.',
    },
  },
  'filters-deinterlace': {
    flag: 'yadif',
    text: 'Removes the comb-like lines of interlaced video from old TV, DVDs or 1080i cameras. Leave it off for normal progressive video.',
    values: {
      frame: 'One output frame per frame. Keeps the frame rate.',
      field: 'One output frame per field. Doubles the frame rate for smoother motion.',
      frame_nospatial: 'Like Frame, but skips a spatial check: faster, slightly lower quality.',
      field_nospatial: 'Like Field, but skips a spatial check: faster, slightly lower quality.',
    },
  },
  'filters-contrast': {
    flag: 'eq contrast',
    text: 'Difference between light and dark areas. 0 leaves it unchanged; negative flattens the picture, positive makes it punchier.',
  },
  'filters-brightness': {
    flag: 'eq brightness',
    text: 'Makes the whole picture lighter or darker. 0 leaves it unchanged.',
  },
  'filters-saturation': {
    flag: 'eq saturation',
    text: 'Colour intensity. Leave it at 0 for no change.',
  },
  'filters-gamma': {
    flag: 'eq gamma',
    text: 'Brightens or darkens the midtones while leaving black and white alone. 10 is neutral; below darkens and above brightens. 0 leaves it unchanged.',
  },

  // Filters: audio.
  'filters-acontrast': {
    flag: 'acontrast',
    text: 'Audio dynamic range compression: brings quiet and loud parts closer together, which sounds louder and punchier. 33 is off.',
  },
  'filters-adelay': {
    flag: 'adelay',
    text: 'Delays the audio by this many milliseconds, to fix audio that plays ahead of the picture. Needs an audio codec other than Copy.',
  },

  // Options.
  'options-loglevel': {
    flag: '-loglevel',
    text: 'How much ffmpeg prints while it runs. Error shows only problems; Info is ffmpeg\'s default; Debug and Trace are for troubleshooting.',
  },
  'options-ffmpegd-address': {
    text: 'Where the ffmpegd daemon is listening. From an https page, a daemon on another machine must be served over https.',
  },
}

export default help
