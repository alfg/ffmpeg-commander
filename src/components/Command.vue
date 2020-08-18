<template>
  <div>
    <code class="command">
      <span
        :id="`popover-target-${i.value}`"
        class="tip"
        v-for="i in renderCmd"
        :key="i.value">{{ i.value }}</span>
      <b-popover
        class="tips"
        :target="`popover-target-${i.value}`"
        triggers="hover"
        v-for="i in renderCmd"
        :key="`popover-${i.value}`"
        :disabled="!i.description"
        placement="top"
        variant="warning">
          <template v-slot:title>{{ i.value }}</template>
          {{ i.description }}
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

      // Map tooltip descriptions for known options.
      commandsArr.forEach((el) => {
        const o = {
          value: el,
        };
        const desc = tooltips.find(t => t.value === el);
        if (desc) {
          o.description = desc.tip;
        }
        output.push(o);
      });
      return output;
    },
    update(key, value) {
      this.$emit('input', { ...this.value, [key]: value });
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

span.tip {
  padding-right: 10px;
}

span.tip:hover {
  background: #444;
}

.tooltip {
  top: -8px !important;
}

</style>
