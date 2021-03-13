<template>
  <div id="file-browser">
    <div>
      <ul>
        <li class="cwd">{{ data.cwd }}</li>
        <li v-if="prefix !== ''">
          <a href="#" @click.prevent="goBack">...</a>
        </li>
        <li v-for="o in filteredFiles" v-bind:key="o.label">
          <a href="#" @click.prevent="onFileSelect">{{ o.label }}</a>
        </li>
      </ul>
      <b-button
        class="float-right mr-2"
        squared variant="light"
        size="sm"
        @click="close"
      >Cancel</b-button>
    </div>
  </div>
</template>

<script>
const LOCALSTORAGE_HOST_URI = 'host';
const host = window.localStorage.getItem(LOCALSTORAGE_HOST_URI) || 'http://localhost:8080';

export default {
  data() {
    return {
      prefix: '',
      data: [],
    };
  },
  computed: {
    filteredFiles() {
      const items = [];
      if (this.data && this.data.folders) {
        this.data.folders.forEach((item) => {
          const o = {
            label: item,
            children: [],
          };
          items.push(o);
        });
      }
      if (this.data && this.data.files) {
        this.data.files.forEach((item) => {
          const o = {
            label: item.name,
            children: [],
          };
          items.push(o);
        });
      }
      return items.filter((o) => o.label !== this.prefix);
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    onFileSelect(event) {
      const { text } = event.target;
      if (text[text.length - 1] !== '/') {
        this.$emit('file', `${event.target.text}`);
      } else {
        this.getData(text);
      }
    },
    goBack() {
      const arr = this.prefix.split('/');
      arr.splice(-2, 1); // Remove last path, but keep leading slash.
      const newPrefix = arr.join('/');
      this.getData(newPrefix);
    },
    getData(prefix = '') {
      fetch(`${host}/files?prefix=${prefix}`)
        .then((response) => response.json())
        .then((data) => {
          this.data = data;
          this.prefix = prefix;
        });
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
#file-browser {
  width: 100%;
  position: absolute;
  padding: 15px 0;
  left: 0;
  top: 36px;
  background: white;
  border: #ced4da solid 1px;
  z-index: 1;
}
.cwd {
  list-style: none;
  font-family: monospace;
}
</style>
