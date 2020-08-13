<template>
  <div>
    <b-form-row>
      <b-col>
        <b-form-group label="Codec:" label-for="audio-codec">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.codec"
            @input="update('codec', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option
              v-for="o in filteredAudioCodecs"
              :key="o.id"
              :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Channel:" label-for="audio-channels">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.channel"
            @input="update('channel', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in audioChannels" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Quality:" label-for="audio-quality">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.quality"
            @input="update('quality', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in audioQualities" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col v-if="value.quality == 'custom'">
        <b-form-group label="Bitrate:" label-for="bitrate">
          <b-form-input
            v-bind:value="value.bitrate"
            @input="update('bitrate', $event)"
          ></b-form-input>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Sample Rate:" label-for="audio-sample-rate">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.sampleRate"
            @input="update('sampleRate', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in sampleRates" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Volume:" label-for="volume">
          <b-form-input
            v-bind:value="value.volume"
            @input="update('volume', $event)"
            type="number"
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
  audioChannels,
  audioQualities,
  sampleRates,
} = config;

export default {
  name: 'Audio',
  props: ['value', 'container'],
  data() {
    return {
      codecs,
      audioChannels,
      audioQualities,
      sampleRates,
    };
  },
  computed: {
    filteredAudioCodecs() {
      return this.codecs.audio.filter(
        o => !o.supported || o.supported.includes(this.container),
      );
    },
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
