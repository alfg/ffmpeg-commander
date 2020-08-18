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
  </div>
</template>

<script>
import config from '@/config';

const {
  extraOptions,
} = config;

export default {
  name: 'Filters',
  props: ['value'],
  data() {
    return {
      extra: [],
      extraOptions,
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
.desc {
  text-transform: none !important;
}
</style>
