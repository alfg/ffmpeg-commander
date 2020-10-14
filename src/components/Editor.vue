<template>
  <div class="editor">
    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Preset: " label-for="preset">
          <b-form-select
            class="u-full-width"
            v-model="preset"
            @change="update('preset', $event)"
          >
            <optgroup v-for="(o, i) in presets" :label="i" v-bind:key="i">
              <option v-for="item in o" :key="item.id" :value="item.value">{{item.name}}</option>
            </optgroup>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group
          label="Preset Name:"
          label-for="preset-name"
          v-if="presetName"
          >
          <b-form-input
            v-model="presetName"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

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
        </b-dropdown>
      </b-button-group>
    </div>

    <b-card v-if="showJSON" no-body class="mt-3" header="JSON Format">
      <pre class="m-0" v-highlightjs="formString"><code></code></pre>
    </b-card>
  </div>
</template>

<script>
import path from 'path';
import merge from 'lodash.merge';
import clone from 'lodash.clonedeep';
import form from '@/form';
import presets from '@/presets';
import codecMap from '@/codecs';
import ffmpeg from '@/ffmpeg';

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
      preset: 'custom',
      presetName: null,
      presets: presets.getPresetOptions(),
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
        if (this.preset.startsWith('preset-')) {
          const preset = presets.getPresetFromLocalStorage(this.preset);
          this.form = merge(this.form, preset.data);
          this.presetName = preset.name;
        } else if (this.preset !== 'custom' && !this.preset.startsWith('preset-')) {
          this.setPreset(this.preset);
          this.presetName = null;
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
      this.preset = value;
    },
    generateCommand() {
      const {
        protocol, input, output, format, video, audio, filters, options,
      } = this.form;

      const opt = {
        protocol,
        input,
        output,

        // Format.
        container: format.container,
        clip: format.clip,
        startTime: format.startTime,
        stopTime: format.stopTime,

        // Video.
        vcodec: codecMap[video.codec],
        preset: video.preset,
        hardwareAccelerationOption: video.hardware_acceleration_option,
        pass: video.pass,
        crf: video.crf,
        bitrate: video.bitrate,
        minrate: video.minrate,
        maxrate: video.maxrate,
        bufsize: video.bufsize,
        gopsize: video.gopsize,
        pixelFormat: video.pixel_format,
        frameRate: video.frame_rate,
        speed: video.speed,
        tune: video.tune,
        profile: video.profile,
        level: video.level,
        faststart: video.faststart,
        size: video.size,
        width: video.width,
        height: video.height,
        format: video.format,
        aspect: video.aspect,
        scaling: video.scaling,
        codecOptions: video.codec_options,

        // Audio.
        acodec: codecMap[audio.codec],
        channel: audio.channel,
        quality: audio.quality,
        audioBitrate: audio.bitrate,
        sampleRate: audio.sampleRate,
        volume: audio.volume,

        // Filters.
        deband: filters.deband,
        deshake: filters.deshake,
        deflicker: filters.deflicker,
        dejudder: filters.dejudder,
        denoise: filters.denoise,
        deinterlace: filters.deinterlace,
        brightness: filters.brightness,
        contrast: filters.contrast,
        saturation: filters.saturation,
        gamma: filters.gamma,
        acontrast: filters.acontrast,

        // Options.
        extra: options.extra,
        loglevel: options.loglevel,
      };
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
      const {
        format, video, audio, filters,
      } = formData;

      const json = {
        format: {
          container: format.container,
          clip: format.clip,
          startTime: format.startTime,
          stopTime: format.stopTime,
        },
        video: {
          codec: codecMap[video.codec],
          preset: video.preset,
          hardware_acceleration_option: video.hardware_acceleration_option,
          pass: video.pass,
          crf: video.crf,
          bitrate: video.bitrate,
          minrate: video.minrate,
          maxrate: video.maxrate,
          bufsize: video.bufsize,
          gopsize: video.gopsize,
          pixel_format: video.pixel_format,
          frame_rate: video.frame_rate,
          speed: video.speed,
          tune: video.tune,
          profile: video.profile,
          level: video.level,
          faststart: video.faststart,
          size: video.size,
          width: video.width,
          height: video.height,
          format: video.format,
          aspect: video.aspect,
          scaling: video.scaling,
          codec_options: video.codec_options,
        },
        audio: {
          codec: codecMap[audio.codec],
          channel: audio.channel,
          quality: audio.quality,
          bitrate: audio.bitrate,
          sampleRate: audio.sampleRate,
          volume: audio.volume,
        },
        filter: {
          deband: filters.deband,
          deshake: filters.deshake,
          deflicker: filters.deflicker,
          dejudder: filters.dejudder,
          denoise: filters.denoise,
          deinterlace: filters.deinterlace,
          brightness: filters.brightness,
          contrast: filters.contrast,
          saturation: filters.saturation,
          gamma: filters.gamma,
          acontrast: filters.acontrast,
        },
      };
      return json;
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
    reset() {
      // Restore form from default copy.
      this.form = merge(this.form, this.default);
      this.preset = 'custom';
      this.presetName = null;
    },
    save(saveNew = false) {
      if (saveNew) {
        this.presetName = null;
      }

      // Save the preset name and reload the presets list.
      this.saving = true;
      const presetName = presets.savePresetToLocalStorage(this.preset, this.presetName, this.form);
      this.presets = presets.getPresetOptions();
      this.preset = presetName;

      setTimeout(() => {
        this.saving = false;
      }, 1000);
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
