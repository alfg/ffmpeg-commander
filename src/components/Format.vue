<template>
  <div>
    <b-form-row>
      <b-col>
        <b-form-group label="Container:" label-for="container">
          <b-form-select
            class="u-full-width"
            :value="value.container"
            @input="update('container', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <optgroup v-for="(o, i) in containers" :label="i" v-bind:key="i">
              <option v-for="item in o" :key="item.id" :value="item.value">{{item.name}}</option>
            </optgroup>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group label="Clip:" label-for="clip">
          <b-form-select
            class="u-full-width"
            v-bind:value="value.clip"
            @input="update('clip', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in clip" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>

      <b-col v-if="value.clip">
        <b-form-group label="Start Time:" label-for="start-time">
          <b-form-input
            v-bind:value="value.startTime"
            @input="update('startTime', $event)"
            placeholder="00:00:00.000"
          ></b-form-input>
        </b-form-group>
      </b-col>

      <b-col v-if="value.clip">
        <b-form-group label="Stop Time:" label-for="stop-time">
          <b-form-input
            v-bind:value="value.stopTime"
            @input="update('stopTime', $event)"
            placeholder="00:00:00.000"
          ></b-form-input>
        </b-form-group>
      </b-col>
    </b-form-row>
   </div>
</template>

<script>
import form from '@/form';

const {
  containers,
  clip,
} = form;

export default {
  name: 'Format',
  props: ['value'],
  data() {
    return {
      containers,
      clip,
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
