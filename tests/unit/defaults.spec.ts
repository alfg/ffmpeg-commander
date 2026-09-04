import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import Editor from '@/components/Editor.vue';
import createDefaultForm from '@/defaults';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const mountEditor = (query = {}) => shallowMount(Editor, {
  localVue,
  mocks: {
    $route: { query },
    $router: { push: () => Promise.resolve() },
  },
});

// The defaults used to be declared inline in Editor.vue, which meant the test
// suite worked from a hand-kept copy. They now live in src/defaults.ts and both
// sides import them; these tests hold the component to that single source.

describe('form defaults', () => {
  it('hands out a fresh object each call, so callers cannot share state', () => {
    const a = createDefaultForm();
    const b = createDefaultForm();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
    expect(a.video).not.toBe(b.video);

    a.video.codec = 'x265';
    expect(b.video.codec).toBe('x264');
  });

  it('initialises the editor form from the shared defaults', () => {
    expect(mountEditor().vm.$data.form).toEqual(createDefaultForm());
  });

  it('snapshots the same defaults for reset()', () => {
    expect(mountEditor().vm.$data.default).toEqual(createDefaultForm());
  });

  it('still applies query params over the defaults on load', () => {
    const wrapper = mountEditor({ 'video.codec': 'x265', 'format.container': 'mkv' });
    expect(wrapper.vm.$data.form.video.codec).toBe('x265');
    expect(wrapper.vm.$data.form.format.container).toBe('mkv');
    expect(wrapper.vm.$data.form.video.preset).toBe('none');
  });

  it('reset() restores the form to the defaults', () => {
    const wrapper = mountEditor();
    wrapper.vm.$data.form.video.codec = 'vp9';
    wrapper.vm.$data.form.filters.denoise = 'heavy';

    (wrapper.vm as unknown as { reset: () => void }).reset();

    expect(wrapper.vm.$data.form).toEqual(createDefaultForm());
    expect(wrapper.vm.$data.preset.id).toBe('custom');
  });

  it('KNOWN BUG: reset() does not clear the extra options checkboxes', () => {
    // reset() is `merge(this.form, this.default)`, and lodash.merge walks arrays
    // index-wise: merging the default `[]` over `['f', 'y']` leaves both entries
    // in place. So "Reset" visibly clears every other field but leaves the Extra
    // Options checkboxes ticked, and -y stays in the generated command.
    // One-line fix: `this.form = createDefaultForm();`.
    const wrapper = mountEditor();
    wrapper.vm.$data.form.options.extra = ['f', 'y'];
    wrapper.vm.$data.form.video.bitrate = '3000k';

    (wrapper.vm as unknown as { reset: () => void }).reset();

    expect(wrapper.vm.$data.form.video.bitrate).toBeNull();
    expect(wrapper.vm.$data.form.options.extra).toEqual(['f', 'y']);
  });

  it('builds the default command on creation', () => {
    expect(mountEditor().vm.$data.cmd)
      .toBe('ffmpeg -i input.mp4 -c:v libx264 -c:a copy output.mp4');
  });
});
