<template>
  <div class="command">
    <!-- Render each command fragment with a popover -->
    <code class="command-box">
      <CommandFragment
        v-for="(o, i) in renderCmd"
        :key="`fragment-${i}`"
        :index="i"
        :value="o.value"
        :filters="o.filters"
      />
    </code>

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
  </div>
</template>

<script>
import tooltips from '@/tooltips';
import CommandFragment from './CommandFragment.vue';

export default {
  name: 'Command',
  components: {
    CommandFragment,
  },
  props: ['cmd'],
  computed: {
    renderCmd() {
      return this.getToolTips(this.cmd);
    },
  },
  methods: {
    getToolTips(commandsStr) {
      const cmd = commandsStr.split(' ');
      const output = [];
      let skip;

      // Map tooltip descriptions for known options.
      cmd.forEach((el, i) => {
        if (skip === i) return;

        const o = {
          value: el,
        };
        const desc = tooltips.find((t) => t.value === el);
        if (desc) {
          o.description = desc.tip;
        }

        // Get filter fragments.
        if (el === '-vf' || el === '-af') {
          const filtersOutput = [];
          const filters = cmd[i + 1].split(',');
          filters.forEach((filter) => {
            const f = {
              value: filter,
            };
            const filterDesc = tooltips.find((t) => filter.includes(t.value));
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

.command-box {
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

</style>
