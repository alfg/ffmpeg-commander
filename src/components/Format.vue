<template>
  <div>
    <b-form-group label="Container:" label-for="container">
      <b-form-select
        class="u-full-width"
        :value="value"
        @input="update"
      >
        <option :value="null" disabled>-- Please select an option --</option>
        <optgroup v-for="(o, i) in containers" :label="i" v-bind:key="i">
          <option v-for="item in o" :key="item.id" :value="item.value">{{item.name}}</option>
        </optgroup>
      </b-form-select>
    </b-form-group>
   </div>
</template>

<script>
import config from '@/config';

const {
  containers,
} = config;

export default {
  name: 'Format',
  props: ['value'],
  data() {
    return {
      containers,
    };
  },
  methods: {
    update(val) {
      this.$emit('input', val);
    },
  },
};
</script>
