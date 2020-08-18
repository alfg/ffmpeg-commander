<template>
  <div>
    <b-navbar type="dark" variant="dark">
      <b-navbar-nav>
        <b-nav-item href="#">
          <img src="../public/ffmpeg.svg" height="25" width="25" alt="FFmpeg Commander" />
          FFmpeg Commander
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <GitHubCorner />

    <div id="app" class="container">
      <Editor />
    </div>

    <footer class="container mt-4 text-center">
      <hr />
      <div class="text-muted">
        <ul>
          <li><a href="https://github.com/alfg/ffmpeg-commander">GitHub</a></li>
          <li><a href="https://ffmpeg.org/ffmpeg.html">FFmpeg Docs</a></li>
          <li>Generated options may vary based on your FFmpeg version and build configuration.
            Tested on version 4.3.1.</li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script>
import GitHubCorner from './components/GitHubCorner.vue';
import Editor from './components/Editor.vue';

export default {
  name: 'app',
  components: {
    GitHubCorner,
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

label {
  text-transform: capitalize;
}

footer ul {
  display: inline-block;
  padding-left: 0;
  text-align: left;
  width: 100%;
}

footer ul li {
  display: inline;
  margin: 0 6px;
  list-style: none;
}
</style>
