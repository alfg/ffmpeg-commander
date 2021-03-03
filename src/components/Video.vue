<template>
  <div>
    <!-- 1st Row: Codec and Preset options -->
    <b-form-row>
      <b-col v-for="item in items" :key="item.name">
        <b-form-group
          class="label"
          :label="`${item.name.replaceAll('_', ' ')}:`"
          :label-for="item.name"
        >
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
      <b-form-group class="label" :label="'CRF:' + value.crf" label-for="crf">
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
      <b-col v-for="item in filteredBitrateItems" :key="item.value">
        <b-form-group class="label" :label="`${item.name}:`" :label-for="item.value">
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
        <b-form-group
          class="label"
          :label="`${item.name.replaceAll('_', ' ')}:`"
          :label-for="item.name"
        >
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
        <b-form-group
          class="label"
          :label="`${item.name.replaceAll('_', ' ')}:`"
          :label-for="item.name"
        >
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
    <hr />

    <!-- Optional Codec Params -->
    <b-form-group
      v-if="['x264', 'x265'].includes(value.codec)"
      label="Codec Options:"
      label-for="codec-options">
      <b-form-textarea
        id="codec-options"
        v-bind:value="value.codec_options"
        @input="update('codec_options', $event)"
        :placeholder="'Set optional -' + value.codec + '-params here to overwrite encoder options.'"
        rows="1"
        max-rows="6"
      ></b-form-textarea>
    </b-form-group>
  </div>
</template>

<script>
import form from '@/form';

const {
  codecs,
  presets,
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
} = form;

export default {
  name: 'Video',
  props: ['value', 'container'],
  data() {
    return {
      items: [
        { name: 'codec', config: codecs },
        { name: 'preset', config: presets },
        { name: 'pass', config: passOptions },
      ],
      bitrateItems: [
        { name: 'Bit Rate', value: 'bitrate' },
        { name: 'Min Rate', value: 'minrate' },
        { name: 'Max Rate', value: 'maxrate' },
        { name: 'Buffer Size', value: 'bufsize' },
        { name: 'GOP Size', value: 'gopsize', supported: ['x264', 'vp9'] },
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
      presets,
    };
  },
  computed: {
    filteredBitrateItems() {
      return this.bitrateItems.filter(
        (o) => !o.supported || (o.supported && o.supported.includes(this.value.codec)),
      );
    },
  },
  methods: {
    filtered(name) {
      if (name === 'codec') {
        return this.codecs.video.filter(
          (o) => !o.supported || o.supported.includes(this.container),
        );
      }
      if (name === 'preset') {
        return this.presets.filter(
          (o) => !o.supported || o.supported.includes(this.value.codec),
        );
      }
      return this.items.find((o) => o.name === name).config;
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
