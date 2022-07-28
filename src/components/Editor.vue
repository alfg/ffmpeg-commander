<template>
  <div class="editor">

    <!-- User can load pre-defined presets and can also access their
    custom saved presets here. -->
    <Presets v-model="preset" />

    <!-- Input and Output protocol and filenames. -->
    <FileIO v-model="form.io" />

    <!-- Tabs for each command building component.
    Format, Video, Audio, Filters and Options -->
    <b-tabs class="mt-4">
      <b-tab title="Format" class="mt-2">
        <Format v-model="form.format" />
      </b-tab>

      <b-tab title="Video" class="mt-2">
        <Video :container="form.format.container" v-model="form.video" />
      </b-tab>

      <b-tab title="Audio" class="mt-2">
        <Audio :container="form.format.container" v-model="form.audio" />
      </b-tab>

      <b-tab title="Filters" class="mt-2">
        <Filters v-model="form.filters" />
      </b-tab>

      <b-tab title="Options" class="mt-2">
        <Options v-model="form.options" />
      </b-tab>
    </b-tabs>
    <hr />

    <!-- FFmpeg generated command output with tooltips. -->
    <Command :cmd="cmd" />
    <p class="disclaimer">
      *Generated options may vary based on your FFmpeg version and build configuration.
      Tested on version 4.3.1.</p>

    <!-- Hidden textarea so we can use the browser copy function. -->
    <div class="hidden-cmd">
      <b-form-textarea
        ref="code"
        v-model="cmd"
        rows="0"
        max-rows="0"
        plaintext
      ></b-form-textarea>
    </div>

    <!-- Toolbar is the set of controls for copying the command output,
    saving and deleting presets. -->
    <Toolbar
      :preset="preset"
      v-model="controls"
      v-on:reset="reset"
      v-on:save="save"
      v-on:encode="encode"
      v-on:toggleJSON="toggleJSON"
    />

    <!-- JSON formatted viewer so the user can view or copy the configured
    JSON output for their generated commands. -->
    <JsonViewer :show="controls.showJSON" :form="form" />
  </div>
</template>

<script>
import merge from 'lodash.merge';
import clone from 'lodash.clonedeep';
import form from '@/form';
import presets from '@/presets';
import ffmpeg from '@/ffmpeg';
import util from '@/util';
import storage from '@/storage';

import Presets from './Presets.vue';
import FileIO from './FileIO.vue';
import Format from './Format.vue';
import Video from './Video.vue';
import Audio from './Audio.vue';
import Filters from './Filters.vue';
import Options from './Options.vue';
import Command from './Command.vue';
import Toolbar from './Toolbar.vue';
import JsonViewer from './JsonViewer.vue';

const {
  protocols,
  containers,
  codecs,
} = form;

export default {
  name: 'Editor',
  components: {
    Presets,
    FileIO,
    Format,
    Video,
    Audio,
    Filters,
    Options,
    Command,
    Toolbar,
    JsonViewer,
  },
  props: {},
  data() {
    return {
      default: {},
      preset: {
        id: 'custom',
        name: null,
      },
      form: {
        io: {
          input: 'input.mp4',
          output: 'output.mp4',
        },
        format: {
          container: 'mp4',
          clip: false,
          startTime: null,
          stopTime: null,
        },
        video: {
          codec: 'x264',
          preset: 'none',
          pass: '1',
          crf: 23,
          bitrate: null,
          minrate: null,
          maxrate: null,
          bufsize: null,
          gopsize: null,
          pixel_format: 'auto',
          frame_rate: 'auto',
          speed: 'auto',
          tune: 'none',
          profile: 'none',
          level: 'none',
          faststart: false,
          size: 'source',
          width: '1080',
          height: '1920',
          format: 'widescreen',
          aspect: 'auto',
          scaling: 'auto',
          codec_options: '',
        },
        audio: {
          codec: 'copy',
          channel: 'source',
          quality: 'auto',
          sampleRate: 'auto',
          volume: 100,
        },
        filters: {
          deband: false,
          deshake: false,
          deflicker: false,
          dejudder: false,
          denoise: 'none',
          deinterlace: 'none',
          brightness: 0,
          contrast: 0,
          saturation: 0,
          gamma: 0,

          acontrast: 33,
        },
        options: {
          extra: [],
          loglevel: 'none',
        },
      },
      protocols,
      containers,
      codecs,
      cmd: null,
      controls: {
        showJSON: false,
      },
      showFileBrowser: false,
    };
  },
  created() {
    this.generateCommand();
    this.default = clone(this.form); // Make copy of initial form as defaults.

    this.setDataFromQueryParams();
  },
  watch: {
    form: {
      handler() {
        // Update the output filename.
        this.updateOutput();

        // Generates the FFmpeg command.
        this.generateCommand();

        // Update all non-default form options to query parameters.
        this.updateQueryParams();
      },
      deep: true,
    },
    preset: {
      handler() {
        if (this.preset.id.startsWith('preset-')) {
          const preset = presets.getPresetFromLocalStorage(this.preset.id);
          this.form = merge(this.form, preset.data);
          this.preset.name = preset.name;
        } else if (this.preset.id !== 'custom' && !this.preset.id.startsWith('preset-')) {
          this.setPreset(this.preset.id);
          this.preset.name = null;
        }
      },
    },
  },
  methods: {
    setPreset(value) {
      this.reset();
      const preset = presets.getPreset(value);
      this.form = merge(this.form, preset);
      this.preset.id = value;
    },
    generateCommand() {
      const opt = util.transform(this.form);
      this.cmd = ffmpeg.build(opt);
    },
    updateOutput() {
      // This is a bit of a hack to update the output filename extension
      // in the form.io.output field, which is mutating a property.
      if (this.form.io.output) {
        const { format, io } = this.form;
        const ext = util.extname(io.output);
        if (ext) {
          this.form.io.output = `${io.output.replace(ext, `.${format.container}`)}`;
        }
      }
    },
    setDataFromQueryParams() {
      const { query } = this.$route;
      util.transformFromQueryParams(this.form, query);
    },
    updateQueryParams() {
      const params = util.transformToQueryParams(this.form);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      this.$router.push({ query: params }).catch(() => {});
    },
    reset() {
      // Restore form from default copy.
      this.form = merge(this.form, this.default);
      this.preset.id = 'custom';
      this.preset.name = null;
    },
    save(saveNew = false) {
      if (saveNew) {
        this.preset.name = null;
      }

      // Save the preset name and reload the presets list.
      const presetName = presets
        .savePresetToLocalStorage(this.preset.id, this.preset.name, this.form);
      this.presets = presets.getPresetOptions();
      this.preset.id = presetName;
      this.preset.name = this.preset.name || this.preset.id;
    },
    encode() {
      const { input, output } = this.form.io;
      const json = util.transformToJSON(this.form);
      storage.add('queue', {
        id: Date.now(),
        type: 'encode',
        payload: json,
        status: 'queued',
        input,
        output,
        _showDetails: false,
      });
      this.$emit('onEncode');
    },
    toggleJSON() {
      this.controls.showJSON = !this.controls.showJSON;
    },
  },
};
</script>

<style scoped>
.disclaimer {
  font-style: italic;
  font-size: 0.8em;
  padding-top: 6px;
}
.protocol {
  flex: 0 0 20% !important;
}
.hidden-cmd {
  opacity: 0;
  height: 0;
}
.hidden-cmd textarea {
  height: 0;
}
</style>
