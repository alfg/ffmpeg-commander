<template>
  <div>
    <div class="command">
      <span
        v-for="i in renderCmd"
        :key="i.value"
        v-b-tooltip.hover
        :title="i.description">{{ i.value }}&nbsp;</span>
    </div>
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
  /* background-color: #f4f4f4;
  border: 1px solid #aaa; */
  /* color: #000; */
  font-size: 1.2rem;
  font-weight: 700;
  font-family: "Source Code Pro", monospace;
  margin-top: 10px;
  /* padding: 5px; */
}

.tips {
  display: inline-block;
}

span:hover {
  background: #ddd;
}

</style>
