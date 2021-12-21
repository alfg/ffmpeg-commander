<template>
  <div class="output">
    <b-form-group label="Output:" label-for="output">
      <b-input-group>
        <b-form-select
          v-if="!$store.state.ffmpegdEnabled"
          class="protocol"
          v-model="protocolOutput"
          @change="update('name', $event)"
        >
          <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
        </b-form-select>

        <b-form-input
          v-model="value.name"
          :state="Boolean(value.name)"
          placeholder="Example: output.mp4"
        ></b-form-input>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import form from '@/form';

const {
  protocols,
} = form;

export default {
  name: 'Output',
  components: {},
  props: ['value'],
  data() {
    return {
      protocolOutput: 'movie.mp4',
      protocols,
    };
  },
  methods: {
    update(key, value) {
      console.log(key, value);
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>

<style scoped>
.protocol {
  flex: 0 0 20% !important;
}
</style>
