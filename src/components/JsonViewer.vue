<template>
<div class="json-viewer">
  <b-card v-if="show" no-body class="mt-3" header="JSON Format">
    <pre class="m-0" v-highlightjs="formString"><code></code></pre>
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
