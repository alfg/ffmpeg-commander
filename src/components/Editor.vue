<template>
  <div class="editor">

    <label>Input</label>
    <b-input
      v-model="form.input"
      class="u-full-width"
      type="text"
    />

    <label>Output</label>
    <b-form-input
      v-model="form.output"
      class="u-full-width"
      type="text"
    />

    <b-tabs class="mt-4">
      <b-tab title="Format">
        <label for="player">Container</label>
        <b-form-select
          class="u-full-width"
        >
          <option v-for="o in containers" :key="o.id" :value="o.name">{{o.name}}</option>
        </b-form-select>
      </b-tab>
      <b-tab title="Video"></b-tab>
      <b-tab title="Audio"></b-tab>
      <b-tab title="Filters"></b-tab>
      <b-tab title="Settings"></b-tab>
    </b-tabs>

    <div class="code">
      <code>
      ffmpeg -y
      -i tears-of-steel-1m.mp4
      -c:v libx264
      -preset medium -crf 16
      -pix_fmt yuv444p
      -r film
      -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"
      -profile:v baseline -level 3.0 -movflags +faststart
      -map 0:v:0? -map_chapters 0
      -c:s mov_text
      -map 0:s?
      -c:a aac
      -b:a 129k
      -map 0:a?
      -map_metadata 0
      -f mp4
      -threads 0
      tears-of-steel-1m-out.mp4
      </code>
    </div>

    <div class="mt-4">
      <b-button>Generate</b-button>
    </div>
  </div>
</template>

<script>
import config from '@/config';

const {
  containers,
} = config;

export default {
  name: 'Editor',
  props: {},
  data() {
    return {
      form: {
        input: '',
        output: '',
      },
      containers,
    };
  },
};
</script>

<style scoped>
.code {
  background-color: #f4f4f4;
  border: 1px solid #aaa;
  color: #000;
  font-family: monospace;
  height: 300px;
  margin-top: 10px;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 5px;
}
</style>
