<template>
  <div>
    <b-form-row>
      <b-col v-for="item in items" :key="item.name">
        <b-form-group class="label" :label="`${item.name}:`" :label-for="item.name">
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

      <b-col v-if="value.quality == 'custom'">
        <b-form-group class="label" label="Bitrate:" label-for="bitrate">
          <b-form-input
            v-bind:value="value.bitrate"
            @input="update('bitrate', $event)"
          ></b-form-input>
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
import form from '@/form';

const {
  codecs,
  audioChannels,
  audioQualities,
  sampleRates,
} = form;

export default {
  name: 'Audio',
  props: ['value', 'container'],
  data() {
    return {
      items: [
        { name: 'codec', config: codecs },
        { name: 'channel', config: audioChannels },
        { name: 'quality', config: audioQualities },
        { name: 'sampleRate', config: sampleRates },
      ],
      codecs,
    };
  },
  methods: {
    filtered(name) {
      if (name === 'codec') {
        return this.codecs.audio.filter(
          (o) => !o.supported || o.supported.includes(this.container),
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
