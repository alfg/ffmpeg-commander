<template>
  <div>
    <h4>Video</h4>
    <hr />
    <b-form-row>
      <b-col v-for="item in items" :key="item.name">
        <b-form-group class="label" :label="`${item.name}:`" :label-for="item.name">
          <b-form-select
            class="u-full-width"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in item.config" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col v-for="item in eq" :key="item.name">
        <b-form-group
          class="label"
          :label="`${item.name}: ${value[item.name]}`"
          :label-for="item.name"
        >
          <b-form-input
            :id="item.name"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
            type="range" :min="item.min" :max="item.max"></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

    <h4>Audio</h4>
    <hr />
    <b-form-row>
      <b-col v-for="item in dynamics" :key="item.name">
        <b-form-group
          class="label"
          :label="`${item.name}: ${value[item.name]}`"
          :label-for="item.name"
        >
          <b-form-input
            :id="item.name"
            v-bind:value="value[item.name]"
            @input="update(item.name, $event)"
            type="range" :min="item.min" :max="item.max"></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>

  </div>
</template>

<script>
import form from '@/form';

const {
  deband,
  deshake,
  deflicker,
  dejudder,
  denoise,
  deinterlace,
} = form;

export default {
  name: 'Filters',
  props: ['value'],
  data() {
    return {
      items: [
        { name: 'deband', config: deband },
        { name: 'deflicker', config: deflicker },
        { name: 'deshake', config: deshake },
        { name: 'dejudder', config: dejudder },
        { name: 'denoise', config: denoise },
        { name: 'deinterlace', config: deinterlace },
      ],
      eq: [
        { name: 'contrast', min: -100, max: 100 },
        { name: 'brightness', min: -100, max: 100 },
        { name: 'saturation', min: 0, max: 300 },
        { name: 'gamma', min: 0, max: 100 },
      ],
      dynamics: [
        { name: 'acontrast', min: 0, max: 100 },
      ],
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
