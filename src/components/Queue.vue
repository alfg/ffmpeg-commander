<template>
  <div class="queue">
    <b-card bg-variant="white" header="Encode">
           <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Source:</b></b-col>
            <b-col>input.mp4</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Destination:</b></b-col>
            <b-col>output.mp4</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Encode Options:</b></b-col>
            <b-col>
              <div class="code">
                <b-form-textarea
                  rows="3"
                  max-rows="6"
                  :value="'{}'"
                ></b-form-textarea>
              </div>
            </b-col>
          </b-row>

          <b-progress
          :value="percent"
          :animated="percent !== 100"
          :variant="percent === 100 ? 'success' : 'primary'"
          show-progress></b-progress>

          <p
          class="text-monospace text-center"
          style="font-size: 1em; margin: 0;"
          v-if="speed && fps"
          >{{ speed }} @ {{ fps }} FPS</p>
    </b-card>

    <b-table striped hover dark>
    </b-table>
    <h2 class="text-center" v-if="items.length === 0">No Jobs Found</h2>
  </div>
</template>

<script>
export default {
  name: 'Queue',
  components: {
  },
  created() {
    this.$ws.onopen = (event) => {
      console.log(event);
    };

    this.$ws.onclose = (event) => {
      console.log(event);
    };

    this.$ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.percent = data.percent;
      this.speed = data.speed;
      this.fps = data.fps;
    };

    this.$ws.onerror = (event) => {
      console.log(event);
    };
  },
  data() {
    return {
      percent: 0,
      speed: null,
      fps: 0,
      items: [],
    };
  },
};
</script>

<style>
.code {
  background-color: #f4f4f4;
  border: 1px solid #aaa;
  color: #000;
  font-family: monospace;
  margin-top: 10px;
  padding: 5px;
}
#jobs-table .table td {
  vertical-align: middle;
}
</style>
