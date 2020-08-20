<template>
  <div>
    <code class="command">
      <span
        v-for="(o, i) in renderCmd"
        :key="`popover-target-${i}`">
        <template v-if="o.value === '-vf'">
          <span class="fragment" :id="`popover-target-${i}`">{{ o.value }}&nbsp;</span>
          <span
            :id="`popover-target-filter-${j}`"
            v-for="(f, j) in o.filters"
            :key="`popover-target-filter-${j}`"
            class="fragment filter">
            {{ f.value }}{{ j+1 === o.filters.length ? '' : ',' }}&nbsp;</span>
        </template>
        <template v-else>
          <span class="fragment" :id="`popover-target-${i}`">{{ o.value }}&nbsp;</span>
        </template>

        <b-popover
          class="tips"
          :target="`popover-target-filter-${i}`"
          triggers="hover"
          v-for="(o, i) in o.filters"
          :key="`popover-filter-${i}`"
          :disabled="!o.description"
          placement="top"
          variant="secondary">
            <template v-slot:title>{{ o.value }}</template>
            <span v-html="o.description"></span>
        </b-popover>
      </span>

      <b-popover
        class="tips"
        :target="`popover-target-${i}`"
        triggers="hover"
        v-for="(o, i) in renderCmd"
        :key="`popover-${i}`"
        :disabled="!o.description"
        placement="top"
        variant="warning">
          <template v-slot:title>{{ o.value }}</template>
          <span v-html="o.description"></span>
      </b-popover>
    </code>
  </div>
</template>

<script>
import tooltips from '@/tooltips';

export default {
  name: 'Command',
  props: ['cmd'],
  data() {
    return {
    };
  },
  computed: {
    renderCmd() {
      const s = this.cmd.split(' ');
      const t = this.getToolTips(s);
      return t;
    },
  },
  methods: {
    getToolTips(commandsArr) {
      const output = [];
      let skip;

      // Map tooltip descriptions for known options.
      commandsArr.forEach((el, i) => {
        if (skip === i) return;

        const o = {
          value: el,
        };
        const desc = tooltips.find(t => t.value === el);
        if (desc) {
          o.description = desc.tip;
        }

        // Get filter fragments.
        if (el === '-vf') {
          const filtersOutput = [];
          const filters = commandsArr[i + 1].split(',');
          filters.forEach((filter) => {
            const f = {
              value: filter,
            };
            const filterDesc = tooltips.find(t => filter.includes(t.value));
            if (filterDesc) {
              f.description = filterDesc.tip;
            }
            filtersOutput.push(f);
          });
          o.filters = filtersOutput;
          skip = i + 1;
        }
        output.push(o);
      });
      return output;
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap');

.command {
  background-color: #000;
  border: 1px solid #aaa;
  color: #fff;
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  font-family: "Source Code Pro", monospace;
  margin-top: 10px;
  padding: 8px;
  overflow: visible;
}

.tips {
  display: inline-block;
}

span.fragment {
  display: inline-block;
  padding: 0 5px;
}

span.fragment:hover {
  background: #444;
}

span.fragment.filter:hover {
  background: #38863c;
}

.tooltip {
  top: -8px !important;
}

</style>
