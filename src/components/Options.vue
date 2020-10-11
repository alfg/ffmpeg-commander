<template>
  <div>
    <b-form-row>
      <b-col>
        <b-form-group label="Extra Flags:">
          <b-form-checkbox
            v-for="option in extraOptions"
            v-model="extra"
            :key="option.value"
            :value="option.value"
            @input="update('extra', $event)"
            switch
          >
            <span class="desc">{{ option.text }}</span>
          </b-form-checkbox>
        </b-form-group>
      </b-col>
    </b-form-row>

    <b-form-row>
      <b-col cols="4">
        <b-form-group label="Log Level: " label-for="loglevel">
          <b-form-select
            class="u-full-width"
            v-model="loglevel"
            @change="update('loglevel', $event)"
          >
            <option :value="null" disabled>-- Please select an option --</option>
            <option v-for="o in logLevels" :key="o.id" :value="o.value">{{o.name}}</option>
          </b-form-select>
        </b-form-group>
      </b-col>
    </b-form-row>
  </div>
</template>

<script>
import form from '@/form';

const {
  extraOptions,
  logLevels,
} = form;

export default {
  name: 'Filters',
  props: ['value'],
  data() {
    return {
      extra: [],
      loglevel: 'none',
      extraOptions,
      logLevels,
    };
  },
  async created() {
    this.extra = JSON.parse(window.localStorage.getItem('options')) || [];
    this.loglevel = JSON.parse(window.localStorage.getItem('loglevel')) || 'none';
    await this.update('extra', this.extra);
    await this.update('loglevel', this.loglevel);
  },
  methods: {
    setSettingsStorage() {
      window.localStorage.setItem('options', JSON.stringify(this.extra));
      window.localStorage.setItem('loglevel', JSON.stringify(this.loglevel));
    },
    update(key, value) {
      this.setSettingsStorage();
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>

<style scoped>
.desc {
  text-transform: none !important;
}
</style>
