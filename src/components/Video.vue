<template>
  <div>
    <b-form-row>
      <b-col>
        <b-form-group label="Codec:" label-for="codec">
          <b-form-select
            class="u-full-width"
            :value="value.codec"
            @input="update('codec', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in filteredVideoCodecs"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Preset:" label-for="preset">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.preset"
            @input="update('preset', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in presets"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Hardware Acceleration:" label-for="hw-accel">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.hardware_acceleration_option"
            @input="update('hardware_acceleration_option', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in hardwareAccelerationOptions"
              :key="o.id"
              :value="o.value"
            >{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Pass:" label-for="pass">
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
        </b-form-group>
      </b-col>
    </b-form-row>

    <div v-if="value.pass == 'crf'">
      <b-form-group :label="'CRF:' + value.crf" label-for="crf">
        <b-form-input
          id="crf"
          v-bind:value="value.crf"
          @input="update('crf', $event)"
          type="range" min="0" max="51"></b-form-input>
      </b-form-group>
    </div>

    <b-form-row>
      <b-col>
        <b-form-group label="Bitrate:" label-for="bitrate">
          <b-form-input
            v-bind:value="value.bitrate"
            @input="update('bitrate', $event)"
            placeholder="Bitrate"
            :formatter="formatBitrate"
            lazy-formatter></b-form-input>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Min Rate:" label-for="minrate">
          <b-form-input
            v-bind:value="value.minrate"
            @input="update('minrate', $event)"
            placeholder="Bitrate"
            :formatter="formatBitrate"
            lazy-formatter></b-form-input>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Max Rate:" label-for="maxrate">
          <b-form-input
            v-bind:value="value.maxrate"
            @input="update('maxrate', $event)"
            placeholder="Bitrate"
            :formatter="formatBitrate"
            lazy-formatter></b-form-input>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Buffer Size:" label-for="bufsize">
          <b-form-input
            v-bind:value="value.bufsize"
            @input="update('bufsize', $event)"
            placeholder="Buffer Size"
            :formatter="formatBitrate"
            lazy-formatter></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group label="Pixel Format:" label-for="pixel_format">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.pixel_format"
            @input="update('pixel_format', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in pixelFormats" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Frame Rate:" label-for="frame_rate">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.frame_rate"
            @input="update('frame_rate', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in frameRates" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Speed:" label-for="speed">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.speed"
            @input="update('speed', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in speeds" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Tune:" label-for="tune">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.tune"
            @input="update('tune', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in tunes" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Profile:" label-for="profile">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.profile"
            @input="update('profile', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in profiles" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Level:" label-for="level">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.level"
            @input="update('level', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in levels" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import config from '@/config';

const {
  codecs,
  presets,
  hardwareAccelerationOptions,
  passOptions,
  pixelFormats,
  frameRates,
  speeds,
  tunes,
  profiles,
  levels,
} = config;

export default {
  name: 'Video',
  props: ['value', 'container'],
  data() {
    return {
      codecs,
      presets,
      hardwareAccelerationOptions,
      passOptions,
      pixelFormats,
      frameRates,
      speeds,
      tunes,
      profiles,
      levels,
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
