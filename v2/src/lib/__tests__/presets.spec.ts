import { describe, it, expect } from 'vitest';
import util from '@/lib/util';
import ffmpeg from '@/lib/ffmpeg';
import presets from '@/lib/presets';
import { makeForm } from './fixtures/form';

// Characterization tests for the 12 bundled presets.
//
// The preset `value` slugs are a public contract (they are what a saved URL and
// the planned video-commander.com recipe links select), and the command each one
// produces is the most visible output the app has. Both are pinned here.

// Applies a preset the way Editor.setPreset() does: onto a pristine default form.
const buildPreset = (slug: string) => ffmpeg.build(
  util.transform(makeForm(presets.getPreset(slug) as Record<string, unknown>)) as never,
);

const general = presets.getPresetOptions().find((o) => o.id === 'general');
const slugs = (general?.data ?? []).map((p) => p.value);

describe('preset catalogue', () => {
  it('lists the expected 12 presets, in order', () => {
    expect(slugs).toEqual([
      'h264-very-fast-1080p30',
      'h264-very-fast-720p30',
      'h264-very-fast-480p30',
      'h264-fast-1080p30',
      'h264-fast-720p30',
      'h264-fast-480p30',
      'h264-high-profile-level-4.2-6000-1080p',
      'h264-main-profile-level-4.0-3000-720p',
      'h264-main-profile-level-3.1-1000-480p',
      'h264-baseline-profile-level-3.0-600-360p',
      'vp9-3000-1080p',
      'vp9-1500-720p',
    ]);
  });

  it('every JSON file on disk is wired into the static import map', () => {
    // The Vue app resolved presets with a dynamic require(), so a new JSON file
    // worked as soon as it was listed. Here it must also be imported and added
    // to presetData, and forgetting that fails silently at runtime -- this is
    // the check that catches it.
    const onDisk = Object.keys(import.meta.glob('../presets/*.json'))
      .map((f) => f.split('/').pop()!.replace('.json', ''))
      .sort();
    expect(onDisk).toEqual([...slugs].sort());
    onDisk.forEach((slug) => expect(presets.getPreset(slug)).toBeDefined());
  });

  it('exposes the Custom and Saved groups alongside General', () => {
    expect(presets.getPresetOptions().map((o) => o.id)).toEqual(['general', 'custom', 'saved']);
  });
});

describe('preset commands', () => {
  it.each([
    ['h264-very-fast-1080p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset veryfast -r 30 -crf 24 -vf "scale=1920:-1" -c:a copy output.mp4'],
    ['h264-very-fast-720p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset veryfast -r 30 -crf 23 -vf "scale=1280:-1" -c:a copy output.mp4'],
    ['h264-very-fast-480p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset veryfast -r 30 -crf 22 -vf "scale=720:-1" -c:a copy output.mp4'],
    ['h264-fast-1080p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset fast -r 30 -crf 22 -vf "scale=1920:-1" -c:a copy output.mp4'],
    ['h264-fast-720p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset fast -r 30 -crf 21 -vf "scale=1280:-1" -c:a copy output.mp4'],
    ['h264-fast-480p30',
      'ffmpeg -i input.mp4 -c:v libx264 -preset fast -r 30 -crf 20 -vf "scale=720:-1" -c:a copy output.mp4'],
    ['h264-high-profile-level-4.2-6000-1080p',
      'ffmpeg -i input.mp4 -c:v libx264 -b:v 6000K -minrate 6000K -maxrate 6000K -bufsize 6000K '
      + '-profile:v high -level 4.2 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 '
      + '-vf "scale=1920:-1" -c:a copy output.mp4'],
    ['h264-main-profile-level-4.0-3000-720p',
      'ffmpeg -i input.mp4 -c:v libx264 -b:v 3000K -minrate 3000K -maxrate 3000K -bufsize 3000K '
      + '-profile:v main -level 4.0 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 '
      + '-vf "scale=1280:-1" -c:a copy output.mp4'],
    ['h264-main-profile-level-3.1-1000-480p',
      'ffmpeg -i input.mp4 -c:v libx264 -b:v 1000K -minrate 1000K -maxrate 1000K -bufsize 1000K '
      + '-profile:v main -level 3.1 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 '
      + '-vf "scale=768:-1" -c:a copy output.mp4'],
    ['h264-baseline-profile-level-3.0-600-360p',
      'ffmpeg -i input.mp4 -c:v libx264 -b:v 600K -minrate 600K -maxrate 600K -bufsize 600K '
      + '-profile:v baseline -level 3.0 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 '
      + '-vf "scale=480:-1" -c:a copy output.mp4'],
    ['vp9-3000-1080p',
      'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 3000k -g 72 -vf "scale=1920:-1" -c:a libopus output.mp4'],
    ['vp9-1500-720p',
      'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1500k -g 72 -vf "scale=1280:-1" -c:a libopus output.mp4'],
  ])('%s', (slug, expected) => {
    expect(buildPreset(slug)).toBe(expected);
  });
});

describe('preset quality settings', () => {
  const crfPresets = [
    'h264-very-fast-1080p30',
    'h264-very-fast-720p30',
    'h264-very-fast-480p30',
    'h264-fast-1080p30',
    'h264-fast-720p30',
    'h264-fast-480p30',
  ];

  it.each(crfPresets)('%s carries its crf through to the command', (slug) => {
    // Each of these declares "pass": "crf" alongside its crf value. Without it
    // setVideoFlags() drops -crf entirely, which is what used to happen here.
    const preset = presets.getPreset(slug);
    expect(preset.video?.pass).toBe('crf');
    expect(buildPreset(slug)).toContain(`-crf ${preset.video?.crf}`);
  });

  it('KNOWN BUG: the VP9 presets declare profile 0, which never reaches the command', () => {
    // setFlagsFromMap guards with `if (options[o])`, and 0 is falsy, so a
    // legitimate VP9 profile of 0 is dropped. Same code path in the Vue app.
    // The guard needs to test for undefined/null/'' rather than truthiness.
    ['vp9-3000-1080p', 'vp9-1500-720p'].forEach((slug) => {
      expect(presets.getPreset(slug).video?.profile).toBe(0);
      expect(buildPreset(slug)).not.toContain('-profile:v');
    });
  });

  it('the bitrate presets do not rely on crf', () => {
    const bitratePresets = slugs.filter((s) => !crfPresets.includes(s));
    bitratePresets.forEach((slug) => {
      expect(presets.getPreset(slug).video?.crf).toBeUndefined();
    });
  });
});
