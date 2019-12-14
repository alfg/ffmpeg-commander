<template>
  <div>
    <label for="codec">Codec</label>
    <b-form-select
      class="u-full-width"
      v-bind:value="value.audio_codec"
      @input="update('audio_codec', $event)"
    >
      <option :value="null" disabled>-- Please select an option --</option>
      <option v-for="o in filteredAudioCodecs" :key="o.id" :value="o.value">{{o.name}}</option>
    </b-form-select>
  </div>
</template>

<script>
import config from '@/config';

const {
  codecs,
} = config;

export default {
  name: 'Audio',
  props: ['value', 'container'],
  data() {
    return {
      codecs,
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
