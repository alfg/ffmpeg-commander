<template>
  <div>
    <!-- 1st Row: Codec and Preset options -->
    <b-form-row>
      <b-col v-for="item in items" :key="item.name">
        <b-form-group :label="`${item.name.replaceAll('_', ' ')}:`" :label-for="item.name">
          <b-form-select
            class="u-full-width"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in filtered(item.name)"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <!-- CRF slider if CRF enabled -->
    <div v-if="value.pass == 'crf'">
      <b-form-group :label="'CRF:' + value.crf" label-for="crf">
        <b-form-input
          id="crf"
          v-bind:value="value.crf"
          @input="update('crf', $event)"
          type="range" min="0" max="51"></b-form-input>
      </b-form-group>
    </div>
    <hr />

    <!-- 2nd Row: Bit rate options -->
    <b-form-row>
      <b-col v-for="item in bitrateItems" :key="item.value">
        <b-form-group :label="`${item.name}:`" :label-for="item.value">
          <b-form-input
            v-bind:value="value[item.value]"
            @input="update(item.value, $event)"
            :placeholder="item.name"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>
    <hr />

    <!-- 3rd Row: Video editing options -->
    <b-form-row>
      <b-col v-for="item in videoEditItems" :key="item.name">
        <b-form-group :label="`${item.name.replaceAll('_', ' ')}:`" :label-for="item.name">
          <b-form-select
            class="u-full-width"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in item.config"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>
    <hr />

    <!-- 4th Row: Video scaling options -->
    <b-form-row>
      <b-col v-for="item in videoSizeItems" :key="item.name">
        <b-form-group :label="`${item.name.replaceAll('_', ' ')}:`" :label-for="item.name">
          <b-form-select
            class="u-full-width"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in item.config"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <!-- Width and Height inputs if Custom Size is enabled -->
    <b-form-row>
      <b-col v-if="value.size == 'custom'">
        <b-form-group label="Width:" label-for="width">
          <b-form-input
            v-bind:value="value.width"
            @input="update('width', $event)"
            placeholder="Width"
          ></b-form-input>
        </b-form-group>
      </b-col>

      <b-col v-if="value.size == 'custom'">
        <b-form-group label="Height:" label-for="height">
          <b-form-input
            v-bind:value="value.height"
            @input="update('height', $event)"
            placeholder="Height"
          ></b-form-input>
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
  fastStart,
  sizes,
  formats,
  aspects,
  scalings,
} = config;

export default {
  name: 'Video',
  props: ['value', 'container'],
  data() {
    return {
      items: [
        { name: 'codec', config: codecs },
        { name: 'preset', config: presets },
        { name: 'hardware_acceleration_option', config: hardwareAccelerationOptions },
        { name: 'pass', config: passOptions },
      ],
      bitrateItems: [
        { name: 'Bit Rate', value: 'bitrate' },
        { name: 'Min Rate', value: 'minrate' },
        { name: 'Max Rate', value: 'maxrate' },
        { name: 'Buffer Size', value: 'bufsize' },
      ],
      videoEditItems: [
        { name: 'pixel_format', config: pixelFormats },
        { name: 'frame_rate', config: frameRates },
        { name: 'speed', config: speeds },
        { name: 'tune', config: tunes },
        { name: 'profile', config: profiles },
        { name: 'level', config: levels },
      ],
      videoSizeItems: [
        { name: 'faststart', config: fastStart },
        { name: 'size', config: sizes },
        { name: 'format', config: formats },
        { name: 'aspect', config: aspects },
        { name: 'scaling', config: scalings },
      ],
      codecs,
    };
  },
  methods: {
    filtered(name) {
      if (name === 'codec') {
        return this.codecs.video.filter(
          o => !o.supported || o.supported.includes(this.container),
        );
      }
      return this.items.find(o => o.name === name).config;
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
