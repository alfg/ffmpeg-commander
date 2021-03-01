<!--
Component Layout:

App
  GithubCorner          Github Badge and link to repository.
  Editor                Container component.
    Presets             Pre-defined and user-saved presets.
    Format              FFmpeg Format Options
    Video               FFmpeg Video Options
    Audio               FFmpeg Audio Options
    Filters             FFmpeg Filter Options
    Options             FFmpeg General Options and Logging. Saves to localstorage.
    Command             Command building and rendering logic.
      CommandFragment   Builds command fragments with tooltips.
    Toolbar             User controls for copying command output and managing presets.
    JsonViewer          View JSON formatted options.
-->
<template>
  <div>
    <b-navbar type="dark" variant="dark">
      <div class="container">
        <b-navbar-nav>
          <b-nav-item href="#">
            <img src="../public/ffmpeg.svg" height="25" width="25" alt="FFmpeg Commander" />
            FFmpeg Commander
          </b-nav-item>
        </b-navbar-nav>
      </div>
    </b-navbar>

    <GitHubCorner />

    <div id="app" class="container">
      <b-tabs align="right" content-class="mt-4">
        <b-tab title="Builder">
          <router-view />
        </b-tab>
        <b-tab title="Queue" v-if="wsReady">
          <template #title>
            <b-spinner small v-if="isEncoding"></b-spinner> Queue
          </template>
          <Queue />
        </b-tab>
        <b-tab v-if="wsReady" disabled>
          <template #title>
            <code>✅ ffmpegd connected</code>
          </template>
        </b-tab>
      </b-tabs>
    </div>

    <footer class="container mt-4 text-center">
      <hr />
      <div class="text-muted">
        <ul>
          <li>{{ name }}-{{ version }}</li>
          <li><a href="https://github.com/alfg/ffmpeg-commander/issues">Report a Bug</a></li>
          <li><a href="https://ffmpeg.org/ffmpeg.html">FFmpeg Documentation</a></li>
          <li class="float-right">Built with ❤ by <a href="https://github.com/alfg">alfg</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script>
import { name, version } from '../package.json';
import GitHubCorner from './components/GitHubCorner.vue';
import Queue from './components/Queue.vue';

export default {
  name: 'app',
  components: {
    GitHubCorner,
    Queue,
  },
  computed: {
    wsReady() {
      return this.$store.state.wsConnected;
    },
    isEncoding() {
      return this.$store.state.isEncoding;
    },
  },
  data() {
    return {
      name,
      version,
    };
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

#app a.router-link-exact-active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
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
