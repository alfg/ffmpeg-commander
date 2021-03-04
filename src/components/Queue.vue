<template>
  <div class="queue">
    <b-button-group class="float-right mb-2">
      <b-button @click="clearJobs">Clear All</b-button>
    </b-button-group>

    <b-table striped hover dark
      :fields="fields"
      :items="items"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
    >
      <template v-slot:cell(status)="data">
        <b-badge
          :variant="['error', 'cancelled'].includes(data.item.status) ? 'danger' : 'primary'"
        >{{ data.item.status }}</b-badge>
      </template>
      <template v-slot:cell(progress)="data">
        <b-progress
          v-if="data.item.status === 'encoding'"
          :value="percent"
          :animated="percent !== 100"
          :variant="percent === 100 ? 'success' : 'primary'"
          show-progress></b-progress>
        <p
          class="text-monospace text-center"
          style="font-size: 0.7em; margin: 0;"
          v-if="(speed && fps) && data.item.status === 'encoding'"
        >{{ speed }} @ {{ fps }} FPS</p>
      </template>

      <template v-slot:cell(details)="row">
        <b-button size="sm" @click="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}}
        </b-button>
      </template>

      <template v-slot:cell(action)="data">
        <b-button-group size="sm">
          <b-button
            variant="light"
            v-if="!['error', 'cancelled', 'completed'].includes(data.item.status)"
            @click="onClickCancel(data.item.id)">❌</b-button>
          <b-button
            variant="light"
            v-if="['error', 'cancelled'].includes(data.item.status)"
            @click="onClickRestart(data.item.id)">&#10227;</b-button>
        </b-button-group>
      </template>

      <template v-slot:row-details="row">
          <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Input:</b></b-col>
            <b-col>{{ row.item.input }}</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Output:</b></b-col>
            <b-col>{{ row.item.output }}</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="2" class="text-sm-right"><b>Encode Options:</b></b-col>
            <b-col>
              <div class="code">
                <b-form-textarea
                  rows="3"
                  max-rows="6"
                  :value="JSON.stringify(row.item.payload)"
                ></b-form-textarea>
              </div>
            </b-col>
          </b-row>
      </template>
    </b-table>
    <h2 class="text-center" v-if="items.length === 0">No Jobs Found</h2>
  </div>
</template>

<script>
import storage from '@/storage';
import store from '@/store';

const WS_INTERVAL = 5000;

export default {
  name: 'Queue',
  created() {
    this.getQueue();

    this.onMessage();
  },
  data() {
    return {
      percent: 0,
      speed: null,
      fps: 0,
      job: {},
      items: [],
      fields: [
        { key: 'id', sortable: true },
        { key: 'input' },
        { key: 'output' },
        { key: 'status' },
        { key: 'progress' },
        { key: 'details' },
        { key: 'action' },
      ],
      sortBy: 'id',
      sortDesc: true,
      ws: null,
    };
  },
  methods: {
    onMessage() {
      setInterval(() => {
        if (this.$ws.ws.readyState === WebSocket.OPEN) {
          this.$ws.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.percent = data.percent;
            this.speed = data.speed;
            this.fps = data.fps;

            if (this.percent === 100) {
              this.setJobStatus('completed');
              store.setIsEncoding(false);
            }
          };
          this.startQueue();
        }
      }, WS_INTERVAL);
    },
    startQueue() {
      this.getQueue();

      setInterval(() => {
        this.getQueue();

        if (this.job.status && this.job.status === 'encoding') {
          store.setIsEncoding(true);
          return;
        }

        const job = this.getNextJob();
        if (!job.id) {
          return;
        }
        this.job = job;

        this.sendEncode();
      }, 5000);
    },
    getQueue() {
      this.items = storage.getAll();
      this.items.forEach((o) => {
        if (o.status === 'encoding') {
          // eslint-disable-next-line no-param-reassign
          o._showDetails = true; // eslint-disable-line no-underscore-dangle
        }
      });
    },
    getNextJob() {
      const filtered = this.items.filter((item) => item.status === 'queued' || item.status === 'encoding');
      return filtered[0] || {};
    },
    sendEncode() {
      this.$ws.ws.send(JSON.stringify({
        type: 'encode',
        input: this.job.input,
        output: this.job.output,
        payload: JSON.stringify(this.job.payload),
      }));
      this.setJobStatus('encoding');
    },
    setJobStatus(status) {
      this.job.status = status;
      storage.updateStatus(this.job.id, status);
    },
    clearJobs() {
      storage.deleteAll();
      this.getQueue();
    },
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
