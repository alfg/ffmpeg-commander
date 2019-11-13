<template>
  <div>
    <label for="codec">Codec</label>
    <b-form-select
      class="u-full-width"
      :value="value.videoCodec"
      @input="update('videoCodec', $event)"
    >
      <option :value="null" disabled>-- Please select an option --</option>
      <option v-for="o in filteredVideoCodecs" :key="o.id" :value="o.value">{{o.name}}</option>
    </b-form-select>

    <label for="speed">Speed</label>
    <b-form-select
      class="u-full-width"
      v-bind:value="value.videoSpeed"
      @input="update('videoSpeed', $event)"
    >
      <option :value="null" disabled>-- Please select an option --</option>
      <option v-for="o in videoSpeeds" :key="o.id" :value="o.value">{{o.name}}</option>
    </b-form-select>

    <label for="hw-accel">Hardware Acceleration</label>
    <b-form-select
      class="u-full-width"
      v-bind:value="value.hardwareAccelerationOption"
      @input="update('hardwareAccelerationOption', $event)"
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
      v-bind:value="value.pass"
      @input="update('pass', $event)"
    >
      <option :value="null" disabled>-- Please select an option --</option>
      <option
        v-for="o in passOptions"
        :key="o.id"
        :value="o.value"
      >{{o.name}}</option>
    </b-form-select>

    <div v-if="value.pass == 'crf'">
      <label for="crf">CRF: {{ value.crf }}</label>
      <b-form-input
        id="crf"
        v-bind:value="value.crf"
        @input="update('crf', $event)"
        type="range" min="0" max="51"></b-form-input>
    </div>

    <label for="bitrate">Bitrate</label>
    <b-form-input
      v-bind:value="value.bitrate"
      @input="update('bitrate', $event)"
      placeholder="Bitrate"
      :formatter="formatBitrate"
      lazy-formatter></b-form-input>

    <label for="minrate">Min Rate</label>
    <b-form-input
      v-bind:value="value.minrate"
      @input="update('minrate', $event)"
      placeholder="Bitrate"
      :formatter="formatBitrate"
      lazy-formatter></b-form-input>

    <label for="maxrate">Max Rate</label>
    <b-form-input
      v-bind:value="value.maxrate"
      @input="update('maxrate', $event)"
      placeholder="Bitrate"
      :formatter="formatBitrate"
      lazy-formatter></b-form-input>

    <label for="bufsize">Buffer Size</label>
    <b-form-input
      v-bind:value="value.bufsize"
      @input="update('bufsize', $event)"
      placeholder="Buffer Size"
      :formatter="formatBitrate"
      lazy-formatter></b-form-input>

    <label for="pixelFormat">Pixel Format</label>
    <b-form-select
      class="u-full-width"
      v-bind:value="value.pixelFormat"
      @input="update('pixelFormat', $event)"
    >
      <option :value="null" disabled>-- Please select an option --</option>
      <option v-for="o in pixelFormats" :key="o.id" :value="o.value">{{o.name}}</option>
    </b-form-select>
  </div>
</template>

<script>
import config from '@/config';

const {
  codecs,
  videoSpeeds,
  hardwareAccelerationOptions,
  passOptions,
  pixelFormats,
} = config;

export default {
  name: 'Video',
  props: ['value', 'container'],
  data() {
    return {
      codecs,
      videoSpeeds,
      hardwareAccelerationOptions,
      passOptions,
      pixelFormats,
    };
  },
  computed: {
    filteredVideoCodecs() {
      return this.codecs.video.filter(
        o => !o.supported || o.supported.includes(this.container),
      );
    },
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
    formatBitrate(value) {
      return `${parseInt(value, 10)}K`;
    },
  },
};
</script>
