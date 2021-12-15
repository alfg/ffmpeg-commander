<template>
  <span class="command-fragment">
    <!-- Create nested fragments if Video or Audio filter -->
    <template v-if="value === '-vf' || value === '-af'">
      <span class="fragment" :id="`popover-target-${index}`">{{ value }}&nbsp;</span>
      <span
        :id="`popover-target-filter-${j}-${filterType(value)}`"
        :key="`fragment-filter-${j}-${filterType(value)}`"
        v-for="(f, j) in filters"
        class="fragment filter"
      >{{ f.value }}{{ j+1 === filters.length ? '' : ',' }}&nbsp;</span>
    </template>
    <!-- Otherwise, create a normal fragment -->
    <template v-else>
      <span class="fragment" :id="`popover-target-${index}`">{{ value }}&nbsp;</span>
    </template>

    <!-- Create popovers for filters -->
    <b-popover
      class="tips"
      :target="`popover-target-filter-${i}-${filterType(value)}`"
      :key="`popover-filter-${i}-${filterType(value)}`"
      v-for="(p, i) in filters"
      triggers="hover"
      :disabled="!p.description"
      placement="top"
      variant="warning"
    >
      <template v-slot:title>{{ p.value.replaceAll('"', '') }}</template>
      <span v-html="p.description"></span>
    </b-popover>
  </span>
</template>

<script>
export default {
  name: 'CommandFragment',
  props: ['value', 'filters', 'index'],
  methods: {
    filterType(filter) {
      return filter === '-vf' ? 'vf' : 'af';
    },
  },
};
</script>

<style scoped>
.tips {
  display: inline-block;
}

span.fragment {
  display: inline-block;
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
