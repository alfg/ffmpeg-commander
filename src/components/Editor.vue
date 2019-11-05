<template>
  <div class="editor">

    <label>Input</label>
    <b-form-file
      class="mb-2"
      v-model="form.input"
      :state="Boolean(form.input)"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..."
    ></b-form-file>

    <label>Output</label>
    <b-form-input
      v-model="form.output"
      :state="Boolean(form.output)"
      placeholder="Example: output.mp4"
    ></b-form-input>

    <b-tabs class="mt-4">
      <b-tab title="Format" class="mt-2">
        <label for="player">Container</label>
        <b-form-select
          class="u-full-width"
          v-model="form.container"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <optgroup v-for="(o, i) in containers" :label="i" v-bind:key="i">
            <option v-for="item in o" :key="item.id" :value="item.value">{{item.name}}</option>
          </optgroup>
        </b-form-select>
      </b-tab>
      <b-tab title="Video" class="mt-2">
        <label for="codec">Codec</label>
        <b-form-select
          class="u-full-width"
          v-model="form.videoCodec"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <option v-for="o in filteredVideoCodecs" :key="o.id" :value="o.value">{{o.name}}</option>
        </b-form-select>

        <label for="speed">Speed</label>
        <b-form-select
          class="u-full-width"
          v-model="form.videoSpeed"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <option v-for="o in videoSpeeds" :key="o.id" :value="o.value">{{o.name}}</option>
        </b-form-select>

        <label for="hw-accel">Hardware Acceleration</label>
        <b-form-select
          class="u-full-width"
          v-model="form.hardwareAccelerationOption"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <option
            v-for="o in hardwareAccelerationOptions"
            :key="o.id"
            :value="o.value"
          >{{o.name}}</option>
        </b-form-select>

        <label for="pass">Pass</label>
        <b-form-select
          class="u-full-width mb-2"
          v-model="form.pass"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <option
            v-for="o in passOptions"
            :key="o.id"
            :value="o.value"
          >{{o.name}}</option>
        </b-form-select>

        <div v-if="form.pass == 'crf'">
          <label for="crf">CRF: {{ form.crf }}</label>
          <b-form-input
            id="crf"
            v-model="form.crf"
            type="range" min="0" max="51"></b-form-input>
        </div>

        <label for="bitrate">Bitrate</label>
        <b-form-input
          v-model="form.bitrate"
          placeholder="Bitrate"
          :formatter="formatBitrate"
          lazy-formatter></b-form-input>
      </b-tab>
      <b-tab title="Audio">
        <label for="player">Codec</label>
        <b-form-select
          class="u-full-width"
          v-model="form.audioCodec"
        >
          <option :value="null" disabled>-- Please select an option --</option>
          <option v-for="o in filteredAudioCodecs" :key="o.id" :value="o.value">{{o.name}}</option>
        </b-form-select>
      </b-tab>
      <!-- <b-tab title="Filters"></b-tab>
      <b-tab title="Settings"></b-tab> -->
    </b-tabs>

    <div class="code">
      <b-form-textarea
        ref="code"
        placeholder="FFmpeg command will be generated here!"
        v-model="cmd"
        rows="3"
        max-rows="6"
        plaintext
      ></b-form-textarea>
    </div>

    <div class="mt-4">
      <b-button @click="copyToClipboard">Copy</b-button>
    </div>

    <b-card class="mt-3" header="Form Options">
      <pre class="m-0">{{ form }}</pre>
    </b-card>
  </div>
</template>

<script>
import config from '@/config';
import codecMap from '@/codecs';
import ffmpeg from '@/ffmpeg';

const {
  containers,
  codecs,
  videoSpeeds,
  hardwareAccelerationOptions,
  passOptions,
} = config;

export default {
  name: 'Editor',
  props: {},
  data() {
    return {
      form: {
        input: '',
        output: '',
        container: null,
        videoCodec: null,
        videoSpeed: null,
        audioCodec: null,
        hardwareAccelerationOption: 'off',
        pass: 'crf',
        crf: 23,
        bitrate: null,
      },
      containers,
      codecs,
      videoSpeeds,
      hardwareAccelerationOptions,
      passOptions,
      cmd: null,
    };
  },
  watch: {
    form: {
      handler() {
        this.generateCommand();
      },
      deep: true,
    },
  },
  computed: {
    filteredVideoCodecs() {
      return this.codecs.video.filter(
        o => !o.supported || o.supported.includes(this.form.container),
      );
    },
    filteredAudioCodecs() {
      return this.codecs.audio.filter(
        o => !o.supported || o.supported.includes(this.form.container),
      );
    },
  },
  methods: {
    generateCommand() {
      const {
        input, output, container, videoCodec, audioCodec, videoSpeed,
        hardwareAccelerationOption, pass, crf, bitrate,
      } = this.form;

      const options = {
        input: input.name,
        output,
        container,
        vcodec: codecMap[videoCodec],
        acodec: codecMap[audioCodec],
        videoSpeed,
        hardwareAccelerationOption,
        pass,
        crf,
        bitrate,
      };
      this.cmd = ffmpeg.build(options);
    },
    copyToClipboard() {
      const copyText = this.$refs.code;
      copyText.select();
      document.execCommand('copy');
    },
    formatBitrate(value) {
      return `${parseInt(value, 10)}K`;
    },
  },
};
</script>

<style scoped>
.code {
  background-color: #f4f4f4;
  border: 1px solid #aaa;
  color: #000;
  font-family: monospace;
  margin-top: 10px;
  padding: 5px;
}
</style>
