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
        <Format v-model="form.container" />
      </b-tab>

      <b-tab title="Video" class="mt-2">
        <Video :container="form.container" v-model="form.video" />
      </b-tab>

      <b-tab title="Audio">
        <Audio :container="form.container" v-model="form.audio" />
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

    <b-card no-body class="mt-3" header="JSON Format">
      <pre class="m-0" v-highlightjs><code>{{ form }}</code></pre>
    </b-card>
  </div>
</template>

<script>
import path from 'path';
import config from '@/config';
import codecMap from '@/codecs';
import ffmpeg from '@/ffmpeg';

import Format from './Format.vue';
import Video from './Video.vue';
import Audio from './Audio.vue';

const {
  containers,
  codecs,
} = config;

export default {
  name: 'Editor',
  components: {
    Format,
    Video,
    Audio,
  },
  props: {},
  data() {
    return {
      form: {
        input: null,
        output: '',
        container: 'mp4',
        video: {
          videoCodec: null,
          videoSpeed: null,
          audioCodec: null,
          hardwareAccelerationOption: 'off',
          pass: 'crf',
          crf: 23,
          bitrate: null,
          minrate: null,
          maxrate: null,
          bufsize: null,
          pixelFormat: 'yuv420p',
          frameRate: null,
          speed: null,
          tune: null,
          profile: null,
          level: null,
        },
        audio: {
          audioCodec: null,
        },
      },
      containers,
      codecs,
      cmd: null,
    };
  },
  watch: {
    form: {
      handler() {
        this.updateOutput();
        this.generateCommand();
      },
      deep: true,
    },
  },
  methods: {
    generateCommand() {
      const {
        input, output, container, video, audio,
      } = this.form;

      const options = {
        input: input.name,
        output,
        container,
        vcodec: codecMap[video.videoCodec],
        acodec: codecMap[audio.audioCodec],
        videoSpeed: video.videoSpeed,
        hardwareAccelerationOption: video.hardwareAccelerationOption,
        pass: video.pass,
        crf: video.crf,
        bitrate: video.bitrate,
        minrate: video.minrate,
        maxrate: video.maxrate,
        bufsize: video.bufsize,
        pixelFormat: video.pixelFormat,
        frameRate: video.frameRate,
        speed: video.speed,
        tune: video.tune,
        profile: video.profile,
        level: video.level,
      };
      this.cmd = ffmpeg.build(options);
    },
    updateOutput() {
      if (this.form.input && this.form.input.name) {
        const { input, container } = this.form;
        const ext = path.extname(input.name);
        const outfile = `${input.name.replace(ext, `.out.${container}`)}`;
        this.form.output = outfile;
      }
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
