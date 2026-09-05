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

const groups = presets.getPresetOptions();
const groupSlugs = (id: string) => (groups.find((o) => o.id === id)?.data ?? []).map((p) => p.value);
const slugs = groupSlugs('general');

// Every group that ships JSON with it, in picker order. `custom` and `saved` are
// not bundled: one is the defaults and the other comes from localStorage.
const bundledSlugs = groups
  .filter((g) => !['custom', 'saved'].includes(g.id))
  .flatMap((g) => g.data.map((p) => p.value));

describe('preset catalogue', () => {
  it('lists the expected 12 General presets, in order', () => {
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
    expect(onDisk).toEqual([...bundledSlugs].sort());
    onDisk.forEach((slug) => expect(presets.getPreset(slug)).toBeDefined());
  });

  it('exposes the recipe groups, then Custom and Saved', () => {
    expect(groups.map((o) => o.id)).toEqual([
      'general',
      'web',
      'social',
      'archive',
      'restore',
      'audio',
      'utility',
      'custom',
      'saved',
    ]);
  });

  it('has no duplicate slugs across groups', () => {
    expect(new Set(bundledSlugs).size).toBe(bundledSlugs.length);
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
      'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 3000k -g 72 -profile:v 0 -vf "scale=1920:-1" -c:a libopus output.mp4'],
    ['vp9-1500-720p',
      'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 1500k -g 72 -profile:v 0 -vf "scale=1280:-1" -c:a libopus output.mp4'],
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

  it('emits the VP9 profile of 0', () => {
    // setFlagsFromMap used to guard with `if (options[o])`, and 0 is falsy, so
    // this legitimate profile was silently dropped from both VP9 presets.
    ['vp9-3000-1080p', 'vp9-1500-720p'].forEach((slug) => {
      expect(presets.getPreset(slug).video?.profile).toBe(0);
      expect(buildPreset(slug)).toContain('-profile:v 0');
    });
  });

  it('the bitrate presets do not rely on crf', () => {
    const bitratePresets = slugs.filter((s) => !crfPresets.includes(s));
    bitratePresets.forEach((slug) => {
      expect(presets.getPreset(slug).video?.crf).toBeUndefined();
    });
  });
});

// The recipe groups added on top of the original twelve. Same contract: the slug
// is public and the command is the visible output, so both are pinned.
const recipes: [string, string][] = [
    ['web-mp4-1080p',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -profile:v high -level 4.0 '
      + '-crf 23 -movflags faststart -vf "scale=1920:-1" -c:a aac -ar 48000 -b:a 128k output.mp4'],
    ['web-mp4-720p',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -profile:v main -level 3.1 '
      + '-crf 23 -movflags faststart -vf "scale=1280:-1" -c:a aac -ar 48000 -b:a 128k output.mp4'],
    ['hevc-mp4-1080p',
      'ffmpeg -i input.mp4 -c:v libx265 -preset medium -pix_fmt yuv420p -crf 26 -movflags faststart '
      + '-vf "scale=1920:-1" -c:a aac -ar 48000 -b:a 128k output.mp4'],
    // -b:v 0 alongside -crf is what puts libvpx-vp9 in constant-quality mode;
    // without it the CRF is treated as a cap on a bitrate-targeted encode.
    ['vp9-webm-1080p-cq',
      'ffmpeg -i input.mp4 -c:v libvpx-vp9 -b:v 0 -g 240 -crf 31 -vf "scale=1920:-1" '
      + '-c:a libopus -b:a 128k output.mp4'],
    ['av1-mp4-1080p',
      'ffmpeg -i input.mp4 -c:v libaom-av1 -b:v 0 -pix_fmt yuv420p -crf 30 -movflags faststart '
      + '-vf "scale=1920:-1" -c:a aac -b:a 128k output.mp4'],

    ['social-vertical-1080x1920',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -r 30 -profile:v high '
      + '-level 4.0 -crf 23 -movflags faststart -vf "scale=1080:1920" -c:a aac -ar 48000 -b:a 128k output.mp4'],
    ['social-square-1080x1080',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -r 30 -profile:v high '
      + '-level 4.0 -crf 23 -movflags faststart -vf "scale=1080:1080" -c:a aac -ar 48000 -b:a 128k output.mp4'],

    ['h264-visually-lossless-1080p',
      'ffmpeg -i input.mp4 -c:v libx264 -preset slow -pix_fmt yuv420p -crf 18 -movflags faststart '
      + '-vf "scale=1920:-1" -c:a aac -ar 48000 -b:a 320k output.mp4'],
    ['hevc-archive-1080p-10bit',
      'ffmpeg -i input.mp4 -c:v libx265 -preset slow -pix_fmt yuv420p10le -crf 20 '
      + '-vf "scale=1920:-1" -c:a copy output.mp4'],
    ['hevc-4k-uhd',
      'ffmpeg -i input.mp4 -c:v libx265 -preset medium -pix_fmt yuv420p10le -crf 22 -movflags faststart '
      + '-vf "scale=3840:-1" -c:a copy output.mp4'],

    // The three restore recipes are the first bundled presets to carry a
    // `filters` section, which only reaches the form because presets are deep
    // merged onto the defaults rather than spread section by section.
    ['deinterlace-to-mp4',
      'ffmpeg -i input.mp4 -c:v libx264 -preset slow -pix_fmt yuv420p -crf 20 -movflags faststart '
      + '-vf "yadif=1:-1:0" -c:a aac -ar 48000 -b:a 192k output.mp4'],
    ['denoise-old-footage-720p',
      'ffmpeg -i input.mp4 -c:v libx264 -preset slow -pix_fmt yuv420p -crf 21 -movflags faststart '
      + '-vf "scale=1280:-1,deband,vaguedenoiser=threshold=3:method=soft:nsteps=5" -c:a aac -b:a 160k output.mp4'],
    ['stabilize-action-cam-1080p',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -crf 22 -movflags faststart '
      + '-vf "scale=1920:-1,deshake,deflicker" -c:a aac -b:a 128k output.mp4'],

    // Audio-only recipes select the video codec "None", which is -vn. The output
    // extension follows the container once reconcile() runs; makeForm skips it.
    ['audio-mp3-192k', 'ffmpeg -i input.mp4 -vn -c:a libmp3lame -ar 44100 -b:a 192k output.mp4'],
    ['audio-m4a-aac-256k', 'ffmpeg -i input.mp4 -vn -c:a aac -ar 48000 -b:a 256k output.mp4'],
    ['audio-flac-lossless', 'ffmpeg -i input.mp4 -vn -c:a flac output.mp4'],
    ['audio-podcast-mono-mp3',
      'ffmpeg -i input.mp4 -vn -c:a libmp3lame -ar 44100 -rematrix_maxval 1.0 -ac 1 -b:a 96k output.mp4'],

    ['remux-to-mp4', 'ffmpeg -i input.mp4 -c:v copy -movflags faststart -c:a copy output.mp4'],
    ['strip-audio', 'ffmpeg -i input.mp4 -c:v copy -movflags faststart -an output.mp4'],
    ['preview-clip-10s',
      'ffmpeg -i input.mp4 -ss 00:00:00 -to 00:00:10 -c:v libx264 -preset veryfast -pix_fmt yuv420p '
      + '-crf 23 -movflags faststart -vf "scale=1280:-1" -c:a aac -b:a 128k output.mp4'],
    ['timelapse-5x',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -r 30 -crf 23 -movflags faststart '
      + '-vf "setpts=.2*PTS" -an output.mp4'],
    ['slow-motion-50',
      'ffmpeg -i input.mp4 -c:v libx264 -preset medium -pix_fmt yuv420p -crf 21 -movflags faststart '
      + '-vf "setpts=2*PTS" -an output.mp4'],
];

describe('recipe commands', () => {
  it.each(recipes)('%s', (slug, expected) => {
    expect(buildPreset(slug)).toBe(expected);
  });

  it('pins a command for every recipe outside the General group', () => {
    // Guards against a new preset landing in the picker with no pinned command.
    expect(recipes.map(([slug]) => slug).sort())
      .toEqual(bundledSlugs.filter((s) => !slugs.includes(s)).sort());
  });
});
