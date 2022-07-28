/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

import storage from '@/storage';

const LOCALSTORAGE_PRESETS_KEY = 'presets';

interface IPresetOption {
  name: string;
  value: string;
  data: string;
}

const presetOptions = [
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
  const items = <IPresetOption[]>storage.getItems(LOCALSTORAGE_PRESETS_KEY);
  if (preset && items) {
    preset.data = items;
  }
  return presetOptions;
}

function getPreset(preset: string) {
  const r = preset.replace('./', '').replace('.json', '');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const item = require(`./${r}`);
  return item;
}

function getPresetFromLocalStorage(preset: string) {
  const data = <IPresetOption[]>storage.getItem(LOCALSTORAGE_PRESETS_KEY);
  return data.find((o: { value: string; }) => o.value === preset);
}

function savePresetToLocalStorage(preset: string, savedPresetName: string, formData: string) {
  const saved = <IPresetOption[]>storage.getItem(LOCALSTORAGE_PRESETS_KEY) || [];

  // If a savedPresetName is provided, then we update the loaded preset, otherwise
  // create a new entry the stored presets array.
  let presetName: string;
  if (savedPresetName) {
    presetName = preset;
    const p = saved.find((o: { value: string; }) => o.value === presetName);
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
  const data = <IPresetOption[]>storage.getItem(LOCALSTORAGE_PRESETS_KEY);
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
