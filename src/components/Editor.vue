<template>
  <div class="editor">

    <label>Input</label>
    <b-input
      v-model="form.input"
      class="u-full-width"
      type="text"
    />

    <label>Output</label>
    <b-form-input
      v-model="form.output"
      class="u-full-width"
      type="text"
    />

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
      <code>{{cmd}}</code>
    </div>

    <div class="mt-4">
      <b-button @click="generateCommand">Generate</b-button>
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
        input: 'input.mp4',
        output: 'output.mp4',
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
        input,
        output,
        container,
        vcodec: codecMap[videoCodec],
        acodec: codecMap[audioCodec],
        videoSpeed,
      };
      this.cmd = ffmpeg.build(options);
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
  height: 300px;
  margin-top: 10px;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 5px;
}
</style>
