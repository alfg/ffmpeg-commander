<template>
<div class="toolbar">
  <div class="mt-4">
    <b-button-group>
      <b-button
        v-if="$store.state.ffmpegdEnabled && wsReady"
        class="ml-2 float-right"
        variant="outline-primary"
        @click="encode">{{ encoding ? 'Encoding...' : 'Encode' }}
      </b-button>

      <b-dropdown
        variant="outline-primary"
        split
        :text="copied ? 'Copied' : 'Copy'"
        v-b-tooltip.hover.bottom title="Copy to your Clipboard"
        @click="copyToClipboard">
        <b-dropdown-item @click="toggleJSON">
          {{ value.showJSON ? 'Hide' : 'Show' }} JSON
        </b-dropdown-item>
      </b-dropdown>
    </b-button-group>

    <b-button-group class="float-right">
      <b-button
        class="ml-2 float-right"
        variant="outline-danger"
        @click="$emit('reset')">Reset
      </b-button>

      <b-dropdown
        variant="outline-primary"
        split
        v-b-tooltip.hover.bottomright title="Save to Local Storage"
        :text="saving ? 'Saving...' : 'Save'" @click="save"
      >
        <b-dropdown-item @click="$emit('save', true)">
          Save New
        </b-dropdown-item>
        <b-dropdown-item v-if="preset.name" @click="deletePreset">
          Delete Preset
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
        <b-dropdown-item @click="deleteAllPresetsPrompt">
          Delete All Saved Presets
        </b-dropdown-item>
      </b-dropdown>
    </b-button-group>
  </div>

  <!-- Overlay prompt when deleting all saved presets. -->
  <b-overlay :show="showDeletePrompt" no-wrap @shown="onShown">
    <template v-slot:overlay>
    <div ref="dialog" class="text-center p-3">
      <p>Are you sure you want to delete all saved presets?</p>
      <div>
        <b-button class="mr-3" @click="onCancel">Cancel</b-button>
        <b-button variant="outline-danger" @click="onOK">Delete All Saved Presets</b-button>
      </div>
    </div>
    </template>
  </b-overlay>
</div>
</template>

<script>
import presets from '@/presets';

export default {
  name: 'Toolbar',
  props: ['value', 'preset'],
  computed: {
    wsReady() {
      return this.$store.state.wsConnected;
    },
  },
  data() {
    return {
      encoding: false,
      copied: false,
      saving: false,
      showDeletePrompt: false,
    };
  },
  methods: {
    encode() {
      this.encoding = true;
      setTimeout(() => {
        this.encoding = false;
        this.$emit('encode');
      }, 500);
    },
    copyToClipboard() {
      const copyText = this.$parent.$refs.code;
      copyText.select();
      document.execCommand('copy');

      // Update copy button text.
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 1000);
    },
    toggleJSON() {
      this.$emit('toggleJSON');
    },
    deletePreset() {
      presets.deletePreset(this.preset.id);
      presets.getPresetOptions();
      this.$emit('reset');
    },
    deleteAllPresetsPrompt() {
      this.showDeletePrompt = true;
    },
    deleteAllPresets() {
      presets.deleteAllPresets();
      this.$emit('reset');
    },
    save() {
      this.saving = true;
      this.$emit('save', false);
      setTimeout(() => {
        this.saving = false;
      }, 1000);
    },
    onShown() {
      this.$refs.dialog.focus();
    },
    onCancel() {
      this.showDeletePrompt = false;
    },
    onOK() {
      this.deleteAllPresets();
      presets.getPresetOptions();
      this.showDeletePrompt = false;
    },
  },
};
</script>
