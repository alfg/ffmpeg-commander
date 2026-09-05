import storage from '@/lib/storage';

import audioFlacLossless from './audio-flac-lossless.json';
import audioM4aAac256k from './audio-m4a-aac-256k.json';
import audioMp3192k from './audio-mp3-192k.json';
import audioPodcastMonoMp3 from './audio-podcast-mono-mp3.json';
import av1Mp41080p from './av1-mp4-1080p.json';
import deinterlaceToMp4 from './deinterlace-to-mp4.json';
import denoiseOldFootage720p from './denoise-old-footage-720p.json';
import h264BaselineProfileLevel30600360p from './h264-baseline-profile-level-3.0-600-360p.json';
import h264Fast1080p30 from './h264-fast-1080p30.json';
import h264Fast480p30 from './h264-fast-480p30.json';
import h264Fast720p30 from './h264-fast-720p30.json';
import h264HighProfileLevel4260001080p from './h264-high-profile-level-4.2-6000-1080p.json';
import h264MainProfileLevel311000480p from './h264-main-profile-level-3.1-1000-480p.json';
import h264MainProfileLevel403000720p from './h264-main-profile-level-4.0-3000-720p.json';
import h264VeryFast1080p30 from './h264-very-fast-1080p30.json';
import h264VeryFast480p30 from './h264-very-fast-480p30.json';
import h264VeryFast720p30 from './h264-very-fast-720p30.json';
import h264VisuallyLossless1080p from './h264-visually-lossless-1080p.json';
import hevc4kUhd from './hevc-4k-uhd.json';
import hevcArchive1080p10bit from './hevc-archive-1080p-10bit.json';
import hevcMp41080p from './hevc-mp4-1080p.json';
import previewClip10s from './preview-clip-10s.json';
import remuxToMp4 from './remux-to-mp4.json';
import slowMotion50 from './slow-motion-50.json';
import socialSquare1080x1080 from './social-square-1080x1080.json';
import socialVertical1080x1920 from './social-vertical-1080x1920.json';
import stabilizeActionCam1080p from './stabilize-action-cam-1080p.json';
import stripAudio from './strip-audio.json';
import timelapse5x from './timelapse-5x.json';
import vp915007200p from './vp9-1500-720p.json';
import vp930001080p from './vp9-3000-1080p.json';
import vp9Webm1080pCq from './vp9-webm-1080p-cq.json';
import webMp41080p from './web-mp4-1080p.json';
import webMp4720p from './web-mp4-720p.json';

const LOCALSTORAGE_PRESETS_KEY = 'presets';

export interface IPresetOption {
  name: string;
  value: string;
  data?: unknown;
}

interface IPresetGroup {
  id: string;
  name: string;
  data: IPresetOption[];
}

// The Vue app resolved these with a dynamic require(), which has no ESM
// equivalent. Importing them into an explicit map keeps the slugs -- a public
// contract, they appear in shared URLs -- checkable at build time instead of
// failing at runtime on a typo.
/** Shape of the bundled preset JSON: a sparse overlay onto the default form. */
export interface IPresetData {
  format?: {
    container?: string;
    clip?: boolean;
    startTime?: string;
    stopTime?: string;
  };
  video?: {
    codec?: string;
    preset?: string;
    pass?: string;
    crf?: number;
    bitrate?: string;
    minrate?: string;
    maxrate?: string;
    bufsize?: string;
    gopsize?: string | number;
    pixel_format?: string;
    frame_rate?: string;
    speed?: string;
    tune?: string;
    faststart?: boolean;
    size?: string;
    width?: string;
    height?: string;
    format?: string;
    aspect?: string;
    scaling?: string;
    profile?: string | number;
    level?: string;
    codec_options?: string;
  };
  audio?: {
    codec?: string;
    channel?: string;
    quality?: string;
    bitrate?: string;
    sampleRate?: string;
    volume?: number;
  };
  filters?: {
    deband?: boolean;
    deshake?: boolean;
    deflicker?: boolean;
    dejudder?: boolean;
    denoise?: string;
    deinterlace?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    gamma?: number;
    acontrast?: number;
  };
}

const presetData: Record<string, IPresetData> = {
  'h264-very-fast-1080p30': h264VeryFast1080p30,
  'h264-very-fast-720p30': h264VeryFast720p30,
  'h264-very-fast-480p30': h264VeryFast480p30,
  'h264-fast-1080p30': h264Fast1080p30,
  'h264-fast-720p30': h264Fast720p30,
  'h264-fast-480p30': h264Fast480p30,
  'h264-high-profile-level-4.2-6000-1080p': h264HighProfileLevel4260001080p,
  'h264-main-profile-level-4.0-3000-720p': h264MainProfileLevel403000720p,
  'h264-main-profile-level-3.1-1000-480p': h264MainProfileLevel311000480p,
  'h264-baseline-profile-level-3.0-600-360p': h264BaselineProfileLevel30600360p,
  'vp9-3000-1080p': vp930001080p,
  'vp9-1500-720p': vp915007200p,

  'web-mp4-1080p': webMp41080p,
  'web-mp4-720p': webMp4720p,
  'hevc-mp4-1080p': hevcMp41080p,
  'vp9-webm-1080p-cq': vp9Webm1080pCq,
  'av1-mp4-1080p': av1Mp41080p,

  'social-vertical-1080x1920': socialVertical1080x1920,
  'social-square-1080x1080': socialSquare1080x1080,

  'h264-visually-lossless-1080p': h264VisuallyLossless1080p,
  'hevc-archive-1080p-10bit': hevcArchive1080p10bit,
  'hevc-4k-uhd': hevc4kUhd,

  'deinterlace-to-mp4': deinterlaceToMp4,
  'denoise-old-footage-720p': denoiseOldFootage720p,
  'stabilize-action-cam-1080p': stabilizeActionCam1080p,

  'audio-mp3-192k': audioMp3192k,
  'audio-m4a-aac-256k': audioM4aAac256k,
  'audio-flac-lossless': audioFlacLossless,
  'audio-podcast-mono-mp3': audioPodcastMonoMp3,

  'remux-to-mp4': remuxToMp4,
  'strip-audio': stripAudio,
  'preview-clip-10s': previewClip10s,
  'timelapse-5x': timelapse5x,
  'slow-motion-50': slowMotion50,
};

const presetOptions: IPresetGroup[] = [
  {
    id: 'general',
    name: 'General',
    data: [
      { name: 'H264 Very Fast 1080p30', value: 'h264-very-fast-1080p30' },
      { name: 'H264 Very Fast 720p30', value: 'h264-very-fast-720p30' },
      { name: 'H264 Very Fast 480p30', value: 'h264-very-fast-480p30' },
      { name: 'H264 Fast 1080p30', value: 'h264-fast-1080p30' },
      { name: 'H264 Fast 720p30', value: 'h264-fast-720p30' },
      { name: 'H264 Fast 480p30', value: 'h264-fast-480p30' },
      { name: 'H264 High Profile Level 4.2 6000K 1080p', value: 'h264-high-profile-level-4.2-6000-1080p' },
      { name: 'H264 Main Profile Level 4.0 3000K 720p', value: 'h264-main-profile-level-4.0-3000-720p' },
      { name: 'H264 Main Profile Level 3.1 1000K 480p', value: 'h264-main-profile-level-3.1-1000-480p' },
      { name: 'H264 Baseline Profile Level 3.0 600K 360p', value: 'h264-baseline-profile-level-3.0-600-360p' },
      { name: 'VP9 3000K 1080p', value: 'vp9-3000-1080p' },
      { name: 'VP9 1500K 720p', value: 'vp9-1500-720p' },
    ],
  },
  {
    id: 'web',
    name: 'Web & Streaming',
    data: [
      { name: 'Web MP4 1080p (H264 + faststart)', value: 'web-mp4-1080p' },
      { name: 'Web MP4 720p (H264 + faststart)', value: 'web-mp4-720p' },
      { name: 'HEVC MP4 1080p (smaller files)', value: 'hevc-mp4-1080p' },
      { name: 'VP9 WebM 1080p (constant quality)', value: 'vp9-webm-1080p-cq' },
      { name: 'AV1 MP4 1080p (slow, smallest)', value: 'av1-mp4-1080p' },
    ],
  },
  {
    id: 'social',
    name: 'Social & Mobile',
    data: [
      { name: 'Vertical 9:16 1080x1920 (Reels/Shorts/TikTok)', value: 'social-vertical-1080x1920' },
      { name: 'Square 1:1 1080x1080 (Feed)', value: 'social-square-1080x1080' },
    ],
  },
  {
    id: 'archive',
    name: 'Archive & Quality',
    data: [
      { name: 'H264 Visually Lossless 1080p (CRF 18)', value: 'h264-visually-lossless-1080p' },
      { name: 'HEVC Archive 1080p 10-bit MKV (CRF 20)', value: 'hevc-archive-1080p-10bit' },
      { name: 'HEVC 4K UHD 10-bit (CRF 22)', value: 'hevc-4k-uhd' },
    ],
  },
  {
    id: 'restore',
    name: 'Restore & Cleanup',
    data: [
      { name: 'Deinterlace to MP4 (DVD/broadcast)', value: 'deinterlace-to-mp4' },
      { name: 'Denoise + Deband Old Footage 720p', value: 'denoise-old-footage-720p' },
      { name: 'Stabilize Action Cam 1080p', value: 'stabilize-action-cam-1080p' },
    ],
  },
  {
    id: 'audio',
    name: 'Audio Only',
    data: [
      { name: 'Extract Audio to MP3 192K', value: 'audio-mp3-192k' },
      { name: 'Extract Audio to M4A AAC 256K', value: 'audio-m4a-aac-256k' },
      { name: 'Extract Audio to FLAC (lossless)', value: 'audio-flac-lossless' },
      { name: 'Podcast Mono MP3 96K', value: 'audio-podcast-mono-mp3' },
    ],
  },
  {
    id: 'utility',
    name: 'Utility',
    data: [
      { name: 'Remux to MP4 (no re-encode)', value: 'remux-to-mp4' },
      { name: 'Strip Audio (no re-encode)', value: 'strip-audio' },
      { name: '10 Second Preview Clip', value: 'preview-clip-10s' },
      { name: 'Timelapse 5x (silent)', value: 'timelapse-5x' },
      { name: 'Slow Motion 50% (silent)', value: 'slow-motion-50' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    data: [
      { name: 'Custom', value: 'custom' },
    ],
  },
  {
    id: 'saved',
    name: 'Saved (Local Storage)',
    data: [],
  },
];

function getPresetOptions() {
  const preset = presetOptions.find((o) => o.id === 'saved');
  const items = storage.getItems<IPresetOption>(LOCALSTORAGE_PRESETS_KEY);
  if (preset && items) {
    preset.data = items;
  }
  return presetOptions;
}

function getPreset(preset: string) {
  const r = preset.replace('./', '').replace('.json', '');
  return presetData[r];
}

function getPresetFromLocalStorage(preset: string) {
  const data = storage.getItem<IPresetOption[]>(LOCALSTORAGE_PRESETS_KEY);
  return data?.find((o) => o.value === preset);
}

function savePresetToLocalStorage(preset: string, savedPresetName: string, formData: unknown) {
  const saved = storage.getItem<IPresetOption[]>(LOCALSTORAGE_PRESETS_KEY) || [];

  // If a savedPresetName is provided, then we update the loaded preset, otherwise
  // create a new entry the stored presets array.
  let presetName: string;
  if (savedPresetName) {
    presetName = preset;
    const p = saved.find((o) => o.value === presetName);
    if (p) {
      p.name = savedPresetName || preset;
      p.data = formData;
    }
  } else {
    const date = new Date();
    presetName = `preset-${date.toISOString()}`;
    saved.push({ name: presetName, value: presetName, data: formData });
  }

  storage.setItem(LOCALSTORAGE_PRESETS_KEY, saved);
  return presetName;
}

function deletePreset(preset: string) {
  const data = storage.getItem<IPresetOption[]>(LOCALSTORAGE_PRESETS_KEY) || [];
  const newData = data.filter((o) => o.value !== preset);
  storage.setItem(LOCALSTORAGE_PRESETS_KEY, newData);
}

function deleteAllPresets() {
  storage.deleteAll(LOCALSTORAGE_PRESETS_KEY);
}

export default {
  getPresetOptions,
  getPreset,
  getPresetFromLocalStorage,
  savePresetToLocalStorage,
  deletePreset,
  deleteAllPresets,
};
