<template>
  <div class="editor">

    <label>Input</label>
    <b-form-file
      v-model="form.input"
      :state="Boolean(form.input)"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..."
    ></b-form-file>

    <label>Output</label>
    <b-form-file
      v-model="form.output"
      :state="Boolean(form.output)"
      placeholder="Choose a file or drop it here..."
      drop-placeholder="Drop file here..."
    ></b-form-file>

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

    <b-card class="mt-3" header="Form Data Result">
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
      },
      containers,
      codecs,
      videoSpeeds,
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
      } = this.form;

      const options = {
        input: input.name,
        output: output.name,
        container,
        vcodec: codecMap[videoCodec],
        acodec: codecMap[audioCodec],
        videoSpeed,
      };
      this.cmd = ffmpeg.build(options);
    },
    copyToClipboard() {
      const copyText = this.$refs.code;
      copyText.select();
      document.execCommand('copy');
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
