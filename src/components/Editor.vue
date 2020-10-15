<template>
  <div class="editor">
    <Presets v-model="preset" />

    <b-form-row>
      <b-col>
        <b-form-group label="Input:" label-for="input">
          <b-input-group>
            <b-form-select
              class="protocol"
              v-model="protocolInput"
              @change="setProtocol('input', $event)"
            >
              <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
            </b-form-select>

            <b-form-input
              v-model="form.input"
              :state="Boolean(form.input)"
              placeholder="Example: output.mp4"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Output:" label-for="output">
          <b-input-group>
            <b-form-select
              class="protocol"
              v-model="protocolOutput"
              @change="setProtocol('output', $event)"
            >
              <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
            </b-form-select>

            <b-form-input
              v-model="form.output"
              :state="Boolean(form.output)"
              placeholder="Example: output.mp4"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-form-row>

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

    <!-- FFmpeg generated command output -->
    <Command :cmd="cmd" />
    <p class="disclaimer">
      *Generated options may vary based on your FFmpeg version and build configuration.
      Tested on version 4.3.1.</p>

    <!-- Hidden textarea so we can use the copy function -->
    <div class="hidden-cmd">
      <b-form-textarea
        ref="code"
        placeholder="FFmpeg command will be generated here!"
        v-model="cmd"
        rows="0"
        max-rows="0"
        plaintext
      ></b-form-textarea>
    </div>

    <!-- Button control group -->
    <div class="mt-4">
      <b-button-group>
        <b-dropdown
          variant="primary"
          split
          :text="copied ? 'Copied' : 'Copy'"
          @click="copyToClipboard">
          <b-dropdown-item @click="toggleJSON">
            {{ this.showJSON ? 'Hide' : 'Show' }} JSON
          </b-dropdown-item>
        </b-dropdown>
      </b-button-group>

      <b-button-group class="float-right">
        <b-button
          class="ml-2 float-right"
          variant="outline-danger"
          @click="reset">Reset</b-button>
        <b-dropdown
          variant="outline-primary"
          split
          :text="saving ? 'Saving...' : 'Save'" @click="save(false)">
          <b-dropdown-item @click="save(true)">
            Save New
          </b-dropdown-item>
          <b-dropdown-item v-if="preset.presetName" @click="deletePreset">
            Delete Preset
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item @click="deleteAllPresetsPrompt">
            Delete All Saved Presets
          </b-dropdown-item>
        </b-dropdown>
      </b-button-group>
    </div>

    <!-- JSON config -->
    <b-card v-if="showJSON" no-body class="mt-3" header="JSON Format">
      <pre class="m-0" v-highlightjs="formString"><code></code></pre>
    </b-card>

    <!-- Overlay prompt when deleting all saved presets. -->
    <b-overlay :show="showDeletePrompt" no-wrap @shown="onShown">
      <template v-slot:overlay>
      <div ref="dialog" class="text-center p-3">
       <p>Are you sure you want to delete all saved presets?</p>
        <div>
          <b-button class="mr-3" @click="onCancel">Cancel</b-button>
          <b-button variant="outline-danger" @click="onOK">Delete All Saved Presets</b-button>
        </div>
      </div>
      </template>
    </b-overlay>
  </div>
</template>

<script>
import path from 'path';
import merge from 'lodash.merge';
import clone from 'lodash.clonedeep';
import form from '@/form';
import presets from '@/presets';
import ffmpeg from '@/ffmpeg';
import util from '@/util';

import Presets from './Presets.vue';
import Format from './Format.vue';
import Video from './Video.vue';
import Audio from './Audio.vue';
import Filters from './Filters.vue';
import Options from './Options.vue';
import Command from './Command.vue';


const {
  protocols,
  containers,
  codecs,
} = form;

export default {
  name: 'Editor',
  components: {
    Presets,
    Format,
    Video,
    Audio,
    Filters,
    Options,
    Command,
  },
  props: {},
  data() {
    return {
      default: {},
      preset: {
        id: 'custom',
        name: null,
      },
      protocolInput: 'movie.mp4',
      protocolOutput: 'movie.mp4',
      form: {
        input: 'input.mp4',
        output: 'output.mp4',
        format: {
          container: 'mp4',
          clip: false,
          startTime: null,
          stopTime: null,
        },
        video: {
          codec: 'x264',
          preset: 'none',
          hardware_acceleration_option: 'off',
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
      showJSON: false,
      copied: false,
      saving: false,
      showDeletePrompt: false,
    };
  },
  computed: {
    formString() {
      const json = this.transformToJSON(this.form);

      // Only return non-null values in JSON string.
      const jsonStr = JSON.stringify(json, (k, v) => {
        if (v === null) return undefined;
        return v;
      }, 2);
      return jsonStr;
    },
  },
  created() {
    this.generateCommand();
    this.default = clone(this.form); // Make copy of initial form as defaults.
  },
  watch: {
    form: {
      handler() {
        this.updateOutput();
        this.generateCommand();
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
    setProtocol(type, value) {
      if (type === 'input') {
        this.form.input = value;
      } else if (type === 'output') {
        this.form.output = value;
      }
    },
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
      if (this.form.output) {
        const { format, output } = this.form;
        const ext = path.extname(output);
        if (ext) {
          this.form.output = `${output.replace(ext, `.${format.container}`)}`;
        }
      }
    },
    copyToClipboard() {
      const copyText = this.$refs.code;
      copyText.select();
      document.execCommand('copy');

      // Update copy button text.
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    },
    toggleJSON() {
      this.showJSON = !this.showJSON;
    },
    transformToJSON(formData) {
      const json = util.transformToJSON(formData);
      return json;
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
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
      this.saving = true;
      const presetName = presets.savePresetToLocalStorage(
        this.preset.id, this.preset.name, this.form,
      );
      this.presets = presets.getPresetOptions();
      this.preset.id = presetName;

      setTimeout(() => {
        this.saving = false;
      }, 1000);
    },
    deletePreset() {
      presets.deletePreset(this.preset.id);
      this.reset();
    },
    deleteAllPresetsPrompt() {
      this.showDeletePrompt = true;
    },
    deleteAllPresets() {
      presets.deleteAllPresets();
      this.reset();
    },
    onShown() {
      this.$refs.dialog.focus();
    },
    onCancel() {
      this.showDeletePrompt = false;
    },
    onOK() {
      this.deleteAllPresets();
      this.presets = presets.getPresetOptions();
      this.showDeletePrompt = false;
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
