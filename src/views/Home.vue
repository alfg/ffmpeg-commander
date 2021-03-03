<template>
  <div class="home">
    <Editor @onEncode="onEncode" />
  </div>
</template>

<script>
import Editor from '@/components/Editor.vue';

export default {
  name: 'Home',
  components: {
    Editor,
  },
  methods: {
    onEncode() {
      this.$emit('onEncode');
    },
  },
};
</script>
