<template>
  <div id="app" class="container">
    <h1>FFmpeg Commander</h1>
    <b-alert variant="warning" show>Currently a work in progress. Check back for updates.</b-alert>
    <Editor />
  </div>
</template>

<script>
import Editor from './components/Editor.vue';

export default {
  name: 'app',
  components: {
    Editor,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
