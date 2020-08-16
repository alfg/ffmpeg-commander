<template>
  <div>
    <h4>Video</h4>
    <hr />
    <b-form-row>
      <b-col>
        <b-form-group label="Deband:" label-for="deband">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.deband"
            @input="update('deband', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in deband" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Deshake:" label-for="deshake">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.deshake"
            @input="update('deshake', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in deshake" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Deflicker:" label-for="deflicker">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.deflicker"
            @input="update('deflicker', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in deflicker" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Dejudder:" label-for="dejudder">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.dejudder"
            @input="update('dejudder', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in dejudder" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Denoise:" label-for="denoise">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.denoise"
            @input="update('denoise', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in denoise" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Deinterlace:" label-for="deinterlace">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.deinterlace"
            @input="update('deinterlace', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in deinterlace" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col>
        <b-form-group :label="'Contrast: ' + value.contrast" label-for="contrast">
          <b-form-input
            id="contrast"
            v-bind:value="value.contrast"
            @input="update('contrast', $event)"
            type="range" min="-1000" max="1000"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group :label="'Brightness: ' + value.brightness" label-for="brightness">
          <b-form-input
            id="brightness"
            v-bind:value="value.brightness"
            @input="update('brightness', $event)"
            type="range" min="-100" max="100"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group :label="'Saturation: ' + value.saturation" label-for="saturation">
          <b-form-input
            id="saturation"
            v-bind:value="value.saturation"
            @input="update('saturation', $event)"
            type="range" min="0" max="300"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group :label="'Gamma: ' + value.gamma" label-for="gamma">
          <b-form-input
            id="gamma"
            v-bind:value="value.gamma"
            @input="update('gamma', $event)"
            type="range" min="1" max="100"></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

    <!-- <h4>Audio</h4>
    <hr /> -->

  </div>
</template>

<script>
import config from '@/config';

const {
  deband,
  deshake,
  deflicker,
  dejudder,
  denoise,
  deinterlace,
} = config;

export default {
  name: 'Filters',
  props: ['value'],
  data() {
    return {
      deband,
      deshake,
      deflicker,
      dejudder,
      denoise,
      deinterlace,
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
