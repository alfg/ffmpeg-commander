import storage from '@/lib/storage';

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
import vp915007200p from './vp9-1500-720p.json';
import vp930001080p from './vp9-3000-1080p.json';

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
  format?: { container?: string };
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
    frame_rate?: string;
    size?: string;
    profile?: string | number;
    level?: string;
    codec_options?: string;
  };
  audio?: { codec?: string };
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
