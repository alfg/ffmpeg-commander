<template>
  <div class="input">
    <b-form-group label="Input:" label-for="input">
      <b-input-group>
        <b-form-select
          v-if="!$store.state.ffmpegdEnabled || !$store.state.wsConnected"
          class="protocol"
          v-model="protocolInput"
          @change="update('name', $event)"
        >
          <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
        </b-form-select>

        <b-form-input
          v-if="!$store.state.ffmpegdEnabled || !$store.state.wsConnected"
          v-model="value.name"
          :state="Boolean(value.name)"
          placeholder="Example: input.mp4"
        ></b-form-input>

        <b-form-input
          v-else
          v-model="value"
          placeholder=""
          @focus="onFileFocus"
        ></b-form-input>

        <div v-if="showFileBrowser">
          <FileBrowser v-on:file="onFileSelect" v-on:close="onClose" />
        </div>
      </b-input-group>
    </b-form-group>
  </div>
</template>

<script>
import form from '@/form';

import FileBrowser from '@/components/FileBrowser.vue';

const {
  protocols,
} = form;

export default {
  name: 'Input',
  components: {
    FileBrowser,
  },
  props: ['value'],
  data() {
    return {
      protocolInput: 'movie.mp4',
      protocols,
      showFileBrowser: false,
    };
  },
  methods: {
    update(key, value) {
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
