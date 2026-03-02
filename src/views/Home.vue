<template>
  <main class="home">
    <header class="home-hero">
      <h1>FFmpeg Command Generator for Common Encoding Workflows</h1>
      <p class="lead">
        FFmpeg Commander helps you build FFmpeg commands for video conversion, audio encoding,
        filters, and container settings without memorizing every flag.
      </p>
      <p class="home-summary">
        Choose a preset, adjust format and codec options, then copy the generated command into
        your local FFmpeg workflow.
      </p>
    </header>

    <section aria-labelledby="builder-heading">
      <h2 id="builder-heading" class="section-heading">Command Builder</h2>
      <Editor @onEncode="onEncode" />
    </section>

    <section class="home-copy" aria-labelledby="about-heading">
      <h2 id="about-heading" class="section-heading">What You Can Configure</h2>
      <p>
        The builder covers common FFmpeg controls including input and output paths, container
        format, H.264 and VP9 presets, bitrate and CRF tuning, audio settings, scaling, and
        filters like deinterlacing and denoise.
      </p>
      <p>
        It is designed for fast command generation rather than complete FFmpeg coverage, so you
        can start from a working baseline and refine the command for your own build and media.
      </p>
    </section>
  </main>
</template>

<script>
import Editor from '@/components/Editor.vue';

export default {
  name: 'Home',
  components: {
    Editor,
  },
  methods: {
    onEncode() {
      this.$emit('onEncode');
    },
  },
};
</script>

<style scoped>
.home {
  display: block;
}

.home-hero {
  margin-bottom: 2rem;
}

.home-hero h1 {
  font-size: 2.2rem;
  line-height: 1.2;
  margin-bottom: 0.75rem;
}

.lead,
.home-summary,
.home-copy p {
  max-width: 52rem;
}

.section-heading {
  font-size: 1.35rem;
  margin-bottom: 1rem;
}

.home-copy {
  margin-top: 2.5rem;
}
</style>
