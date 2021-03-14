<template>
<div class="json-viewer">
  <b-card v-if="show" no-body class="mt-3" header="JSON Format">
    <pre><code>{{ formString }}</code></pre>
  </b-card>
</div>
</template>

<script>
import util from '@/util';

export default {
  name: 'JsonViewer',
  props: ['show', 'form'],
  computed: {
    formString() {
      const json = util.transformToJSON(this.form);

      // Only return non-null values in JSON string.
      const jsonStr = JSON.stringify(json, (k, v) => {
        if (v === null) return undefined;
        return v;
      }, 2);
      return jsonStr;
    },
  },
};
</script>

<style scoped>
pre {
  background: #343a40;
  color: #fff;
  display: block;
  font-family: "Source Code Pro", monospace;
  margin: 0;
  padding: 20px;
}
</style>
