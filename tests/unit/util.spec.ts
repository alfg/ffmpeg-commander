import util from '@/util';
import { makeForm } from './fixtures/form';

// Characterization tests for the URL query-param contract.
//
// transformToQueryParams / transformFromQueryParams round-trip the whole form
// through the URL. The recipe pages on video-commander.com are planned to deep
// link into this app using these exact param names, so treat every key asserted
// here as public API: renaming one without an alias breaks inbound links.
//
// Assertions marked KNOWN BUG pin current wrong behavior on purpose.

describe('util.transformToQueryParams', () => {
  it('emits nothing for a default form, keeping the canonical URL clean', () => {
    expect(util.transformToQueryParams(makeForm())).toEqual({});
  });

  it('emits the full documented key set for a non-default form', () => {
    const params = util.transformToQueryParams(makeForm({
      format: {
        container: 'mkv', clip: true, startTime: '00:00:05', stopTime: '00:00:10',
      },
      video: {
        codec: 'x265',
        preset: 'slow',
        pass: 'crf',
        crf: 18,
        bitrate: '3000k',
        minrate: '1000k',
        maxrate: '5000k',
        bufsize: '6000k',
        gopsize: '72',
        pixel_format: 'yuv420p',
        frame_rate: '30',
        speed: '2*PTS',
        tune: 'film',
        profile: 'high',
        level: '4.2',
        faststart: true,
        size: 'custom',
        width: '640',
        height: '480',
        format: 'fullscreen',
        aspect: '16:9',
        scaling: 'lanczos',
        codec_options: 'crf=20',
      },
      audio: {
        codec: 'aac', channel: '2', quality: '128k', sampleRate: '48000', volume: 50,
      },
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
        acontrast: 50,
      },
    }));

    expect(params).toEqual({
      'format.container': 'mkv',
      'format.clip': 'true',
      'format.startTime': '00:00:05',
      'format.stopTime': '00:00:10',
      'video.codec': 'x265',
      'video.preset': 'slow',
      'video.pass': 'crf',
      'video.crf': 18,
      'video.bitrate': '3000k',
      'video.minrate': '1000k',
      'video.maxrate': '5000k',
      'video.bufsize': '6000k',
      'video.gopsize': '72',
      'video.pixel_format': 'yuv420p',
      'video.frame_rate': '30',
      'video.speed': '2*PTS',
      'video.tune': 'film',
      'video.profile': 'high',
      'video.level': '4.2',
      'video.faststart': 'true',
      'video.size': 'custom',
      'video.width': '640',
      'video.height': '480',
      'video.format': 'fullscreen',
      'video.aspect': '16:9',
      'video.scaling': 'lanczos',
      'video.codec_options': 'Y3JmPTIw',
      'audio.codec': 'aac',
      'audio.channel': '2',
      'audio.quality': '128k',
      'audio.sample_rate': '48000',
      'audio.volume': 50,
      'filters.deband': 'true',
      'filters.deshake': 'true',
      'filters.deflicker': 'true',
      'filters.dejudder': 'true',
      'filters.denoise': 'heavy',
      'filters.deinterlace': 'field',
      'filters.brightness': 10,
      'filters.contrast': 20,
      'filters.saturation': 2,
      'filters.gamma': 15,
      'filters.acontrast': 50,
    });
  });

  it('base64-encodes codec options', () => {
    const params = util.transformToQueryParams(makeForm({
      video: { codec_options: 'scenecut=0:open_gop=0:min-keyint=72:keyint=72' },
    })) as Record<string, string>;
    expect(params['video.codec_options'])
      .toBe('c2NlbmVjdXQ9MDpvcGVuX2dvcD0wOm1pbi1rZXlpbnQ9NzI6a2V5aW50PTcy');
    expect(atob(params['video.codec_options']))
      .toBe('scenecut=0:open_gop=0:min-keyint=72:keyint=72');
  });

  it('uses the snake_case key "audio.sample_rate" for the camelCase field', () => {
    // The one key whose name does not match its form field. Easy to "tidy up"
    // during the port and silently break inbound links.
    const params = util.transformToQueryParams(makeForm({ audio: { sampleRate: '48000' } }));
    expect(params).toHaveProperty(['audio.sample_rate'], '48000');
    expect(params).not.toHaveProperty(['audio.sampleRate']);
  });

  it('omits crf unless pass is "crf"', () => {
    expect(util.transformToQueryParams(makeForm({ video: { pass: '1', crf: 18 } })))
      .not.toHaveProperty(['video.crf']);
    expect(util.transformToQueryParams(makeForm({ video: { pass: 'crf', crf: 18 } })))
      .toHaveProperty(['video.crf'], 18);
  });

  it('omits width/height unless size is "custom"', () => {
    const sized = util.transformToQueryParams(makeForm({ video: { size: '1280', width: '640', height: '480' } }));
    expect(sized).not.toHaveProperty(['video.width']);
    expect(sized).not.toHaveProperty(['video.height']);

    const custom = util.transformToQueryParams(makeForm({ video: { size: 'custom', width: '640', height: '480' } }));
    expect(custom).toHaveProperty(['video.width'], '640');
    expect(custom).toHaveProperty(['video.height'], '480');
  });

  it('never emits audio.bitrate, which is not part of the URL contract', () => {
    // audio.bitrate backs the "custom" quality field but has no query param on
    // either side, so a custom audio bitrate is lost across a page reload.
    expect(util.transformToQueryParams(makeForm({ audio: { quality: 'custom', bitrate: '333k' } })))
      .not.toHaveProperty(['audio.bitrate']);
  });
});

describe('util.transformFromQueryParams', () => {
  it('leaves the form untouched for an empty query', () => {
    const form = makeForm();
    util.transformFromQueryParams(form, {});
    expect(form).toEqual(makeForm());
  });

  it('reads every string-valued param', () => {
    const form = makeForm();
    util.transformFromQueryParams(form, {
      'format.container': 'mkv',
      'format.startTime': '00:00:05',
      'format.stopTime': '00:00:10',
      'video.codec': 'x265',
      'video.preset': 'slow',
      'video.pass': 'crf',
      'video.crf': '18',
      'video.maxrate': '5000k',
      'video.bufsize': '6000k',
      'video.gopsize': '72',
      'video.pixel_format': 'yuv420p',
      'video.frame_rate': '30',
      'video.speed': '2*PTS',
      'video.tune': 'film',
      'video.profile': 'high',
      'video.level': '4.2',
      'video.size': 'custom',
      'video.width': '640',
      'video.height': '480',
      'video.format': 'fullscreen',
      'video.aspect': '16:9',
      'video.scaling': 'lanczos',
      'audio.codec': 'aac',
      'audio.channel': '2',
      'audio.quality': '128k',
      'audio.sample_rate': '48000',
      'audio.volume': '50',
      'filters.denoise': 'heavy',
      'filters.deinterlace': 'field',
      'filters.brightness': '10',
      'filters.contrast': '20',
      'filters.saturation': '2',
      'filters.gamma': '15',
      'filters.acontrast': '50',
    });

    expect(form.format).toMatchObject({ container: 'mkv', startTime: '00:00:05', stopTime: '00:00:10' });
    expect(form.video).toMatchObject({
      codec: 'x265',
      preset: 'slow',
      pass: 'crf',
      crf: '18',
      maxrate: '5000k',
      bufsize: '6000k',
      gopsize: '72',
      pixel_format: 'yuv420p',
      frame_rate: '30',
      speed: '2*PTS',
      tune: 'film',
      profile: 'high',
      level: '4.2',
      size: 'custom',
      width: '640',
      height: '480',
      format: 'fullscreen',
      aspect: '16:9',
      scaling: 'lanczos',
    });
    expect(form.audio).toMatchObject({
      codec: 'aac', channel: '2', quality: '128k', sampleRate: '48000', volume: '50',
    });
    expect(form.filters).toMatchObject({
      denoise: 'heavy',
      deinterlace: 'field',
      brightness: '10',
      contrast: '20',
      saturation: '2',
      gamma: '15',
      acontrast: '50',
    });
  });

  it('base64-decodes codec options', () => {
    const form = makeForm();
    util.transformFromQueryParams(form, { 'video.codec_options': 'Y3JmPTIw' });
    expect(form.video.codec_options).toBe('crf=20');
  });

  it.each([
    ['format.clip', 'format', 'clip'],
    ['video.faststart', 'video', 'faststart'],
    ['filters.deband', 'filters', 'deband'],
    ['filters.deflicker', 'filters', 'deflicker'],
    ['filters.deshake', 'filters', 'deshake'],
    ['filters.dejudder', 'filters', 'dejudder'],
  ])('reads %s from the string "true"', (param, section, key) => {
    const form = makeForm();
    util.transformFromQueryParams(form, { [param]: 'true' });
    expect((form as never as Record<string, Record<string, unknown>>)[section][key]).toBe(true);
  });

  it.each([
    ['format.clip', 'format', 'clip'],
    ['video.faststart', 'video', 'faststart'],
    ['filters.deband', 'filters', 'deband'],
  ])('%s only accepts the string "true", never a boolean', (param, section, key) => {
    // Query params are strings by definition, so the read side compares against
    // 'true'. transformToQueryParams now emits 'true' to match, which makes the
    // two functions real inverses in memory as well as through a URL.
    const form = makeForm();
    util.transformFromQueryParams(form, { [param]: true } as never);
    expect((form as never as Record<string, Record<string, unknown>>)[section][key]).toBe(false);
  });

  it('reads video.minrate from its own param, independently of bitrate', () => {
    const form = makeForm();
    util.transformFromQueryParams(form, { 'video.minrate': '1000k' });
    expect(form.video.minrate).toBe('1000k');

    const other = makeForm();
    util.transformFromQueryParams(other, { 'video.bitrate': '3000k' });
    expect(other.video.bitrate).toBe('3000k');
    expect(other.video.minrate).toBeNull();
  });

  it('KNOWN BUG: a "false" param cannot switch off a field that defaults to true', () => {
    // `(query[k] === 'true') || existing` means the query can only ever turn a
    // boolean on. Harmless while every boolean defaults to false, but it makes
    // the contract un-invertible if a default ever flips.
    const form = makeForm({ filters: { deband: true } });
    util.transformFromQueryParams(form, { 'filters.deband': 'false' });
    expect(form.filters.deband).toBe(true);
  });
});

describe('URL round trip', () => {
  // Mirrors what the browser does: query values always arrive as strings.
  const asQuery = (params: Record<string, unknown>) => Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  );

  it('round-trips a rich form through stringified params', () => {
    const original = makeForm({
      format: {
        container: 'mkv', clip: true, startTime: '00:00:05', stopTime: '00:00:10',
      },
      video: {
        codec: 'x265',
        preset: 'slow',
        pass: 'crf',
        crf: '18',
        bitrate: '3000k',
        maxrate: '5000k',
        faststart: true,
        size: 'custom',
        width: '640',
        height: '480',
        codec_options: 'crf=20',
      },
      audio: {
        codec: 'aac', channel: '2', quality: '128k', sampleRate: '48000', volume: '50',
      },
      filters: { deband: true, denoise: 'heavy', contrast: '20' },
    });

    const restored = makeForm();
    util.transformFromQueryParams(restored, asQuery(util.transformToQueryParams(original)));

    // minrate is excluded: it is corrupted by the src/util.ts:149 bug pinned above.
    const withoutMinrate = (video: typeof original.video) => Object.fromEntries(
      Object.entries(video).filter(([k]) => k !== 'minrate'),
    );

    expect(restored.format).toEqual(original.format);
    expect(restored.audio).toEqual(original.audio);
    expect(restored.filters).toEqual(original.filters);
    expect(withoutMinrate(restored.video)).toEqual(withoutMinrate(original.video));
  });
});

describe('util.transform', () => {
  it('maps form fields onto ffmpeg option names', () => {
    const opt = util.transform(makeForm({
      video: { codec: 'x265', pixel_format: 'yuv420p', frame_rate: '30' },
      audio: { codec: 'aac', bitrate: '333k' },
    }));
    expect(opt).toMatchObject({
      vcodec: 'libx265',
      acodec: 'aac',
      pixelFormat: 'yuv420p',
      frameRate: '30',
      audioBitrate: '333k',
      codecOptions: '',
    });
  });
});

describe('util.transformToJSON', () => {
  it('scales the eq filter values into ffmpeg units', () => {
    const json = util.transformToJSON(makeForm({
      filters: {
        brightness: '10', contrast: '20', saturation: '2', gamma: '15', acontrast: '50',
      },
    }));
    expect(json.filter).toEqual({
      deband: false,
      deshake: false,
      deflicker: false,
      dejudder: false,
      denoise: 'none',
      deinterlace: 'none',
      brightness: '0.1',
      contrast: '1.2',
      saturation: '2',
      gamma: '1.5',
      acontrast: '50',
    });
  });

  it('resolves codec slugs to ffmpeg encoder names', () => {
    const json = util.transformToJSON(makeForm({ video: { codec: 'vp9' }, audio: { codec: 'opus' } }));
    expect(json.video.codec).toBe('libvpx-vp9');
    expect(json.audio.codec).toBe('libopus');
  });

  it.each([
    ['lame', 'libmp3lame'],
    ['flac', 'flac'],
    ['pcm', 'pcm_s16le'],
  ])('sends a real encoder name for audio codec "%s"', (codec, encoder) => {
    // These four used to resolve to `undefined`, so the ffmpegd payload carried
    // no audio codec at all and the daemon fell back to its own default.
    expect(util.transformToJSON(makeForm({ audio: { codec } })).audio.codec).toBe(encoder);
  });

  it('sends codec "none" for a disabled audio track', () => {
    // Behaviour change for the ffmpegd protocol: the payload previously omitted
    // the key entirely for "None". The command side emits -an.
    expect(util.transformToJSON(makeForm({ audio: { codec: 'none' } })).audio.codec).toBe('none');
  });

  it('defaults contrast to "1", not "0"', () => {
    // (0 / 100) + 1. The ffmpegd payload differs from the form value here.
    expect(util.transformToJSON(makeForm()).filter.contrast).toBe('1');
  });
});

describe('util.extname', () => {
  it.each([
    ['movie.mp4', '.mp4'],
    ['archive.tar.gz', '.gz'],
    ['noextension', ''],
    ['.bashrc', '.bashrc'],
    // lastIndexOf('.') is not path-aware, so a dot in a directory name wins.
    ['dir.name/file', '.name/file'],
  ])('extname(%s) === %s', (input, expected) => {
    expect(util.extname(input)).toBe(expected);
  });
});
