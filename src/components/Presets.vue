<template>
  <div class="presets">
    <b-form-row>
      <b-col cols="6">
        <b-form-group label="Preset: " label-for="preset">
          <b-form-select
            class="u-full-width"
            v-model="id"
            @change="update('id', $event)"
          >
            <optgroup v-for="(o, i) in presets" :label="o.name" v-bind:key="i">
              <option
                v-for="item in o.data"
                :key="item.id"
                :value="item.value">{{item.name}}</option>
            </optgroup>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group
          label="Preset Name:"
          label-for="preset-name"
          v-if="value.name"
          >
          <b-form-input
            v-model="name"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import presets from '@/presets';

export default {
  name: 'Presets',
  props: ['value'],
  data() {
    return {
      presets: presets.getPresetOptions(),
      id: 'custom',
      name: '',
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
