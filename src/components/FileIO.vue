<template>
  <div class="input">
    <b-form-row>
      <!-- Input -->
      <b-col>
        <b-form-group label="Input:" label-for="input">
          <b-input-group>
            <b-form-select
              v-if="!$store.state.ffmpegdEnabled || !$store.state.wsConnected"
              class="protocol"
              v-model="protocolInput"
              @change="update('input', $event)"
            >
              <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
            </b-form-select>

            <b-form-input
              v-if="!$store.state.ffmpegdEnabled || !$store.state.wsConnected"
              v-model="value.input"
              :state="Boolean(value.input)"
              placeholder="Example: input.mp4"
              @input="update('input', $event)"
            ></b-form-input>

            <b-form-input
              v-else
              v-model="value.input"
              placeholder=""
              @focus="onFileFocus"
              @input="update('input', $event)"
            ></b-form-input>

            <div v-if="showFileBrowser">
              <FileBrowser v-on:file="onFileSelect" v-on:close="onClose" />
            </div>
          </b-input-group>
        </b-form-group>
      </b-col>

      <!-- Output -->
      <b-col>
        <b-form-group label="Output:" label-for="output">
          <b-input-group>
            <b-form-select
              v-if="!$store.state.ffmpegdEnabled"
              class="protocol"
              v-model="protocolOutput"
              @input="update('output', $event)"
            >
              <option v-for="o in protocols" :key="o.id" :value="o.value">{{o.name}}</option>
            </b-form-select>

            <b-form-input
              v-model="value.output"
              :state="Boolean(value.output)"
              placeholder="Example: output.mp4"
              @input="update('output', $event)"
            ></b-form-input>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-form-row>
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
      protocols,
      protocolInput: 'movie.mp4',
      protocolOutput: 'movie.mp4',
      showFileBrowser: false,
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
    onFileSelect(file) {
      this.update('input', file);
      this.showFileBrowser = false;
    },
    onFileFocus() {
      this.showFileBrowser = true;
    },
    onClose() {
      this.showFileBrowser = false;
    },
    // addInput() {
    //   this.inputs += 1;
    // },
    // removeInput() {
    //   this.inputs -= 1;
    // },
  },
};
</script>

<style scoped>
.protocol {
  flex: 0 0 20% !important;
}
</style>
