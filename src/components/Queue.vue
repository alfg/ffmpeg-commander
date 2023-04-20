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
        <b-button size="sm" @click="toggleDetails(row.item.id, row.item._showDetails)" class="mr-2">
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
          <b-col>
            <a :href="videoUrl(row.item.output)" target="_blank">{{ row.item.output }}</a>
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="2" class="text-sm-right"><b>Payload:</b></b-col>
          <b-col>
            <b-form-textarea
              class="code"
              rows="6"
              size="sm"
              readonly
              :value="JSON.stringify(row.item.payload, null, 2)"
            ></b-form-textarea>
          </b-col>
        </b-row>

        <b-row class="mb-2" v-if="row.item.status === 'completed'">
          <b-col sm="2" class="text-sm-right"><b>Preview:</b></b-col>
          <b-col>
            <video :src="videoUrl(row.item.output)" width="70%" controls muted />
          </b-col>
        </b-row>

        <!-- Display error if recieved from message -->
        <b-row class="mb-2" v-if="row.item.error">
          <b-col sm="2" class="text-sm-right"><b>Error:</b></b-col>
          <b-col>
            <div class="code">
              <b-form-textarea
                rows="3"
                max-rows="3"
                :value="JSON.stringify(row.item.error)"
              ></b-form-textarea>
            </div>
          </b-col>
        </b-row>
      </template>
    </b-table>
    <h2 class="text-center" v-if="items.length === 0">No Jobs in Queue</h2>
  </div>
</template>

<script>
import storage from '@/storage';
import store from '@/store';

const WS_INTERVAL = 5000;
const DEFAULT_VIDEO_HOST = 'http://127.0.0.1:8080';
const Status = {
  QUEUED: 'queued',
  ENCODING: 'encoding',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ERROR: 'error',
};

export default {
  name: 'Queue',
  created() {
    // Get items in queue store.
    this.getQueue();

    // Initialize websocket connecction.
    this.initWS();
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
    initWS() {
      // Check if the websocket connection is ready. If so, start queue and listen for messages.
      setInterval(() => {
        if (this.$ws.conn && this.$ws.conn.readyState === WebSocket.OPEN) {
          this.$ws.conn.onmessage = this.onWSMessage;
          this.$ws.conn.onerror = this.onWSError;
          this.startQueue();
        }
      }, WS_INTERVAL);
    },

    onWSMessage(event) {
      // On websocket message, update the progress details (or error).
      const data = JSON.parse(event.data);
      this.percent = data.percent;
      this.speed = data.speed;
      this.fps = data.fps;
      this.err = data.err;

      // Set completed job.
      if (this.percent === 100) {
        this.setJobStatus(this.job.id, Status.COMPLETED);
        store.setIsEncoding(false);
      }

      // Set errored job.
      if (this.err) {
        this.setJobStatus(this.job.id, Status.ERROR);
        store.setIsEncoding(false);
        storage.setError('queue', this.job.id, this.err);
      }
    },

    onWSError() {
      if (this.job.status !== Status.COMPLETED) {
        this.setJobStatus(this.job.id, Status.ERROR);
      }
      store.setIsEncoding(false);
    },

    startQueue() {
      this.getQueue();

      setInterval(() => {
        this.getQueue();

        // Pass if job is already encoding.
        if (this.job.status && this.job.status === Status.ENCODING) {
          store.setIsEncoding(true);
          return;
        }

        // Get next queued job if available.
        this.getNextJob();

        if (this.job.id) this.sendEncode();
      }, WS_INTERVAL);
    },

    getQueue() {
      this.items = storage.getAll('queue');
    },

    getNextJob() {
      const filtered = this.items.filter(
        (item) => item.status === Status.QUEUED || item.status === Status.ENCODING,
      );
      this.job = filtered[0] || {};
    },

    sendEncode() {
      this.$ws.conn.send(JSON.stringify({
        type: 'encode',
        input: this.job.input,
        output: this.job.output,
        payload: JSON.stringify(this.job.payload),
      }));
      this.setJobStatus(this.job.id, Status.ENCODING);
    },

    setJobStatus(id, status) {
      this.job.status = status;
      storage.updateStatus('queue', id, status);
      this.getQueue();
    },

    clearJobs() {
      storage.deleteAll('queue');
      this.getQueue();
    },

    onClickCancel(id) {
      this.setJobStatus(id, Status.CANCELLED);
    },

    onClickRestart(id) {
      this.setJobStatus(id, Status.QUEUED);
    },

    toggleDetails(id, enabled) {
      storage.toggleDetails('queue', id, !enabled);
      this.getQueue();
    },

    videoUrl(output) {
      return `${DEFAULT_VIDEO_HOST}/${output}`;
    },
  },
};
</script>

<style>
textarea.code {
  font-family: monospace;
}
</style>
