<template>
  <div class="editor">
    <b-form-group label="Input:" label-for="input">
      <b-form-file
        class="mb-2"
        v-model="fileInput"
        :state="Boolean(form.input)"
        @input="updateFile"
        placeholder="Choose a file or drop it here..."
        drop-placeholder="Drop file here..."
      ></b-form-file>
    </b-form-group>

    <b-form-group label="Output:" label-for="output">
      <b-form-input
        v-model="form.output"
        :state="Boolean(form.output)"
        placeholder="Example: output.mp4"
      ></b-form-input>
    </b-form-group>

    <b-tabs class="mt-4">
      <b-tab title="Format" class="mt-2">
        <Format v-model="form.container" />
      </b-tab>

      <b-tab title="Video" class="mt-2">
        <Video :container="form.container" v-model="form.video" />
      </b-tab>

      <b-tab title="Audio" class="mt-2">
        <Audio :container="form.container" v-model="form.audio" />
      </b-tab>
      <b-tab title="Filters" class="mt-2" disabled></b-tab>
      <b-tab title="Settings" class="mt-2" disabled></b-tab>
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
      <b-button
        class="ml-2"
        @click="toggleJSON">{{ this.showJSON ? 'Hide' : 'Show' }} JSON</b-button>
    </div>

    <b-card v-if="showJSON" no-body class="mt-3" header="JSON Format">
      <pre class="m-0" v-highlightjs="formString"><code></code></pre>
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
      fileInput: null,
      form: {
        input: null,
        output: null,
        container: 'mp4',
        video: {
          video_codec: 'x264',
          video_speed: 'none',
          hardware_acceleration_option: 'off',
          pass: '1',
          crf: 23,
          bitrate: null,
          minrate: null,
          maxrate: null,
          bufsize: null,
          pixel_format: 'auto',
          frame_rate: 'auto',
          speed: 'auto',
          tune: 'none',
          profile: 'none',
          level: 'none',
        },
        audio: {
          audio_codec: 'copy',
        },
      },
      containers,
      codecs,
      cmd: null,
      showJSON: false,
    };
  },
  computed: {
    formString() {
      return JSON.stringify(this.form, null, 2);
    },
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
    updateFile(file) {
      this.form.input = file ? file.name : '';
      this.updateOutput();
      this.generateCommand();
    },
    generateCommand() {
      const {
        input, output, container, video, audio,
      } = this.form;

      const options = {
        input,
        output,
        container,
        vcodec: codecMap[video.video_codec],
        acodec: codecMap[audio.audio_codec],
        videoSpeed: video.video_speed,
        hardwareAccelerationOption: video.hardware_acceleration_option,
        pass: video.pass,
        crf: video.crf,
        bitrate: video.bitrate,
        minrate: video.minrate,
        maxrate: video.maxrate,
        bufsize: video.bufsize,
        pixelFormat: video.pixel_format,
        frameRate: video.frame_rate,
        speed: video.speed,
        tune: video.tune,
        profile: video.profile,
        level: video.level,
      };
      this.cmd = ffmpeg.build(options);
    },
    updateOutput() {
      if (this.fileInput && this.fileInput.name) {
        const { container } = this.form;
        const { name } = this.fileInput;
        const ext = path.extname(name);
        const outfile = `${name.replace(ext, `.out.${container}`)}`;
        this.form.output = outfile;
      }
    },
    copyToClipboard() {
      const copyText = this.$refs.code;
      copyText.select();
      document.execCommand('copy');
    },
    toggleJSON() {
      this.showJSON = !this.showJSON;
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
