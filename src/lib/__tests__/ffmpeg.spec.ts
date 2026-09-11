import { describe, it, expect } from 'vitest';
import util from '@/lib/util';
import ffmpeg from '@/lib/ffmpeg';
import form from '@/lib/form';
import codecs from '@/lib/codecs';
import { makeForm } from './fixtures/form';

// Characterization tests for command generation.
//
// These pin what the Vue app produces TODAY, so the React port can be proven
// byte-identical. Assertions marked KNOWN BUG encode current wrong behavior on
// purpose: they must fail loudly when the bug is fixed, so the fix shows up as
// a deliberate diff rather than an accidental regression during the port.

// Builds the command the way Editor.generateCommand() does.
const build = (overrides = {}) => ffmpeg.build(util.transform(makeForm(overrides)) as never);

describe('ffmpeg.build', () => {
  it('builds the default command', () => {
    expect(build()).toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
  });

  it('honours input and output filenames', () => {
    expect(build({ io: { input: 'in.mov', output: 'out.mkv' } }))
      .toBe('ffmpeg -i in.mov -c:v libx264 -c:a copy out.mkv');
  });

  describe('clip / format flags', () => {
    it('emits -ss and -to when clip is enabled', () => {
      expect(build({ format: { clip: true, startTime: '00:00:05', stopTime: '00:00:10' } }))
        .toBe('ffmpeg -i input.mp4 -ss 00:00:05 -to 00:00:10 -c:v libx264 -c:a copy output.mp4');
    });

    it('ignores start/stop times when clip is disabled', () => {
      expect(build({ format: { clip: false, startTime: '00:00:05', stopTime: '00:00:10' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
    });
  });

  describe('rate control', () => {
    it('emits -crf only when pass is "crf"', () => {
      expect(build({ video: { pass: 'crf', crf: 18 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -crf 18 -c:a copy output.mp4');
    });

    it('drops -crf when pass is not "crf", even if a crf value is set', () => {
      // This is what silently disables -crf in six of the twelve bundled
      // presets: they set video.crf but never set video.pass.
      expect(build({ video: { pass: '1', crf: 18 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
    });

    it('emits bitrate flags', () => {
      expect(build({
        video: {
          bitrate: '3000k', minrate: '1000k', maxrate: '5000k', bufsize: '6000k', gopsize: '72',
        },
      })).toBe('ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -minrate 1000k -maxrate 5000k '
        + '-bufsize 6000k -g 72 -c:a copy output.mp4');
    });
  });

  describe('two pass', () => {
    // Pass 1 needs -f null: ffmpeg cannot infer a muxer from /dev/null (#54).
    it('splits into two commands, discarding pass 1 through the null muxer', () => {
      expect(build({ video: { pass: '2', bitrate: '3000k' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -c:a copy -pass 1 -an -f null /dev/null && '
          + 'ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -c:a copy -pass 2 output.mp4');
    });

    it('uses -x265-params for x265', () => {
      expect(build({ video: { codec: 'x265', pass: '2', bitrate: '3000k' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx265 -b:v 3000k -c:a copy -x265-params pass=1 -an -f null /dev/null && '
          + 'ffmpeg -i input.mp4 -c:v libx265 -b:v 3000k -c:a copy -x265-params pass=2 output.mp4');
    });

    it('folds the pass number into existing x265 codec options', () => {
      expect(build({
        video: {
          codec: 'x265', pass: '2', bitrate: '3000k', codec_options: 'crf=20',
        },
      })).toBe('ffmpeg -i input.mp4 -c:v libx265 -b:v 3000k -x265-params crf=20:pass=1 -c:a copy '
        + '-an -f null /dev/null && '
        + 'ffmpeg -i input.mp4 -c:v libx265 -b:v 3000k -x265-params crf=20:pass=2 -c:a copy output.mp4');
    });

    it('does not repeat -an when audio is already disabled', () => {
      expect(build({ video: { pass: '2', bitrate: '3000k' }, audio: { codec: 'none' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -an -pass 1 -f null /dev/null && '
          + 'ffmpeg -i input.mp4 -c:v libx264 -b:v 3000k -an -pass 2 output.mp4');
    });
  });

  describe('file name quoting (#40)', () => {
    it('quotes input and output paths containing spaces', () => {
      expect(build({ io: { input: 'my clip.mp4', output: 'my clip out.mp4' } }))
        .toBe('ffmpeg -i "my clip.mp4" -c:v libx264 -c:a copy "my clip out.mp4"');
    });

    it('escapes characters the shell would expand inside double quotes', () => {
      expect(build({ io: { input: 'a "b" $c.mp4' } }))
        .toBe('ffmpeg -i "a \\"b\\" \\$c.mp4" -c:v libx264 -c:a copy output.mp4');
    });

    it('leaves a path the user already quoted as typed', () => {
      expect(build({ io: { input: '"my clip.mp4"' } }))
        .toBe('ffmpeg -i "my clip.mp4" -c:v libx264 -c:a copy output.mp4');
    });

    it('quotes both commands of a two-pass encode', () => {
      expect(build({ io: { input: 'my clip.mp4' }, video: { pass: '2', bitrate: '3000k' } }))
        .toBe('ffmpeg -i "my clip.mp4" -c:v libx264 -b:v 3000k -c:a copy -pass 1 -an -f null /dev/null && '
          + 'ffmpeg -i "my clip.mp4" -c:v libx264 -b:v 3000k -c:a copy -pass 2 output.mp4');
    });
  });

  describe('fit inside a box (#46)', () => {
    it('keeps the aspect ratio when fit is enabled for a custom size', () => {
      expect(build({ video: { size: 'custom', width: '1280', height: '720', fit: true } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 '
          + '-vf "scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2" -c:a copy output.mp4');
    });

    it('stretches to the exact size when fit is off', () => {
      expect(build({ video: { size: 'custom', width: '1280', height: '720' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=1280:720" -c:a copy output.mp4');
    });

    it('ignores fit for the preset sizes', () => {
      expect(build({ video: { size: '1280', fit: true } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=1280:-1" -c:a copy output.mp4');
    });
  });

  describe('audio delay (#38)', () => {
    it('delays every channel with adelay', () => {
      expect(build({ filters: { adelay: 150 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -af "adelay=delays=150:all=1" output.mp4');
    });

    it('chains after the other audio filters', () => {
      expect(build({ audio: { volume: 50 }, filters: { adelay: '150' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -af "volume=0.5,adelay=delays=150:all=1" output.mp4');
    });

    it.each([0, '', '-20'])('emits nothing for %j', (adelay) => {
      expect(build({ filters: { adelay } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
    });
  });

  describe('VideoToolbox encoders (#49)', () => {
    it.each(['h264_videotoolbox', 'hevc_videotoolbox'])('emits %s', (codec) => {
      expect(build({ video: { codec } }))
        .toBe(`ffmpeg -i input.mp4 -c:v ${codec} -c:a copy output.mp4`);
    });
  });

  describe('codec options', () => {
    it('emits -x264-params for x264', () => {
      expect(build({ video: { codec_options: 'keyint=72' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -x264-params keyint=72 -c:a copy output.mp4');
    });

    it('emits -x265-params for x265', () => {
      expect(build({ video: { codec: 'x265', codec_options: 'keyint=72' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx265 -x265-params keyint=72 -c:a copy output.mp4');
    });

    it('drops codec options for codecs other than x264/x265', () => {
      expect(build({ video: { codec: 'vp9', codec_options: 'keyint=72' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libvpx-vp9 -c:a copy output.mp4');
    });
  });

  describe('scaling', () => {
    it('scales by width for widescreen', () => {
      expect(build({ video: { size: '1280' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=1280:-1" -c:a copy output.mp4');
    });

    it('scales by height for fullscreen', () => {
      expect(build({ video: { size: '1280', format: 'fullscreen' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=-1:1280" -c:a copy output.mp4');
    });

    it('uses explicit width:height for custom size', () => {
      expect(build({ video: { size: 'custom', width: '640', height: '480' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=640:480" -c:a copy output.mp4');
    });

    it('appends the scaling algorithm to the scale filter', () => {
      expect(build({ video: { size: '1280', scaling: 'lanczos' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "scale=1280:-1:flags=lanczos" -c:a copy output.mp4');
    });

    it('drops the scaling algorithm when there is nothing to scale', () => {
      // `flags` is an option of the scale filter, not a filter in its own right,
      // so emitting it alone would produce a chain ffmpeg rejects.
      expect(build({ video: { scaling: 'lanczos' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
    });
  });

  describe('video filters', () => {
    it('orders every filter and folds the eq filters last', () => {
      expect(build({
        filters: {
          deband: true,
          deshake: true,
          deflicker: true,
          dejudder: true,
          denoise: 'heavy',
          deinterlace: 'field',
          brightness: 10,
          contrast: 20,
          saturation: 2,
          gamma: 15,
        },
      })).toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "deband,deshake,deflicker,dejudder,'
        + 'vaguedenoiser=threshold=6:method=soft:nsteps=5,yadif=1:-1:0,'
        + 'eq=contrast=1.2:brightness=0.1:saturation=2:gamma=1.5" -c:a copy output.mp4');
    });

    it.each([
      ['default', 'removegrain=0'],
      ['light', 'removegrain=22'],
      ['medium', 'vaguedenoiser=threshold=3:method=soft:nsteps=5'],
      ['heavy', 'vaguedenoiser=threshold=6:method=soft:nsteps=5'],
    ])('maps denoise "%s" to %s', (denoise, expected) => {
      expect(build({ filters: { denoise } })).toContain(`-vf "${expected}"`);
    });

    it.each([
      ['frame', 'yadif=0:-1:0'],
      ['field', 'yadif=1:-1:0'],
      ['frame_nospatial', 'yadif=2:-1:0'],
      ['field_nospatial', 'yadif=3:-1:0'],
    ])('maps deinterlace "%s" to %s', (deinterlace, expected) => {
      expect(build({ filters: { deinterlace } })).toContain(`-vf "${expected}"`);
    });

    it('applies playback speed via setpts', () => {
      expect(build({ video: { speed: '2*PTS' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -vf "setpts=2*PTS" -c:a copy output.mp4');
    });
  });

  describe('audio', () => {
    it('emits codec, sample rate, channel and quality flags', () => {
      expect(build({
        audio: {
          codec: 'aac', channel: '2', quality: '128k', sampleRate: '48000', volume: 50,
        },
      })).toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a aac -ar 48000 -rematrix_maxval 1.0 -ac 2 '
        + '-b:a 128k -af "volume=0.5" output.mp4');
    });

    it('uses the custom bitrate when quality is "custom"', () => {
      expect(build({ audio: { codec: 'aac', quality: 'custom', bitrate: '333k' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a aac -b:a 333k output.mp4');
    });

    it('emits acontrast when moved off its default of 33', () => {
      expect(build({ filters: { acontrast: 50 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -af "acontrast=0.5" output.mp4');
    });

    it.each([
      ['lame', 'libmp3lame'],
      ['flac', 'flac'],
      ['pcm', 'pcm_s16le'],
    ])('maps audio codec "%s" to %s', (codec, encoder) => {
      expect(build({ audio: { codec } }))
        .toBe(`ffmpeg -i input.mp4 -c:v libx264 -c:a ${encoder} output.mp4`);
    });

    it('emits -an for the "None" audio codec', () => {
      expect(build({ audio: { codec: 'none' } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -an output.mp4');
    });

    it('drops every other audio flag and filter when audio is disabled', () => {
      expect(build({
        audio: {
          codec: 'none', channel: '2', quality: '128k', sampleRate: '48000', volume: 50,
        },
        filters: { acontrast: 50 },
      })).toBe('ffmpeg -i input.mp4 -c:v libx264 -an output.mp4');
    });

    it('maps every audio codec offered in the UI', () => {
      const unmapped = form.codecs.audio
        .map((c) => c.value)
        .filter((v) => !(v in codecs));
      expect(unmapped).toEqual([]);
    });

    it('maps every video codec offered in the UI', () => {
      const unmapped = form.codecs.video
        .map((c) => c.value)
        .filter((v) => !(v in codecs));
      expect(unmapped).toEqual([]);
    });
  });

  describe('extra options', () => {
    it('emits every extra flag and the loglevel, in order, before the output', () => {
      expect(build({
        options: {
          extra: ['f', 'y', 'progress', 'hide_banner', 'report'],
          loglevel: 'debug',
        },
      })).toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -f mp4 -y -progress pipe:1 '
        + '-hide_banner -report -loglevel debug output.mp4');
    });

    it('emits -n', () => {
      expect(build({ options: { extra: ['n'] } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -n output.mp4');
    });

    it('emits -movflags faststart', () => {
      expect(build({ video: { faststart: true } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -movflags faststart -c:a copy output.mp4');
    });

    it('uses the container for -f', () => {
      expect(build({ format: { container: 'mkv' }, options: { extra: ['f'] } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy -f mkv output.mp4');
    });
  });

  describe('"none" and "auto" sentinels', () => {
    it.each(['preset', 'tune', 'profile', 'level'])('drops %s when set to "none"', (key) => {
      expect(build({ video: { [key]: 'none' } })).toBe(build());
    });

    it.each(['pixel_format', 'frame_rate', 'aspect'])('drops %s when set to "auto"', (key) => {
      expect(build({ video: { [key]: 'auto' } })).toBe(build());
    });
  });

  describe('zero and empty values', () => {
    it('emits a numeric option set to 0', () => {
      // The guard was a truthiness test, which swallowed 0. VP9 profile 0 is
      // the case that surfaced it, but it applied to every mapped option.
      expect(build({ video: { profile: 0 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -profile:v 0 -c:a copy output.mp4');
      expect(build({ video: { gopsize: 0 } }))
        .toBe('ffmpeg -i input.mp4 -c:v libx264 -g 0 -c:a copy output.mp4');
    });

    it.each([
      ['null', null],
      ['undefined', undefined],
      ['an empty string', ''],
    ])('still drops an option set to %s', (_label, value) => {
      expect(build({ video: { bitrate: value } })).toBe(build());
    });
  });
});
