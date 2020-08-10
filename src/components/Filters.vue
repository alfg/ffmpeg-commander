<template>
  <div>
  </div>
</template>

<script>
// import config from '@/config';

// const {
//   containers,
// } = config;

export default {
  name: 'Filters',
  props: ['value'],
  data() {
    return {
    };
  },
  methods: {
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
    },
  },
};
</script>
