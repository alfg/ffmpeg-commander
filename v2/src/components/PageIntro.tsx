/**
 * The indexable copy from Home.vue.
 *
 * The app is otherwise almost entirely form controls, which give a crawler
 * nothing to work with -- this is the page's only real prose, and its only h1.
 */
export function PageHeading() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold tracking-tight">
        FFmpeg Command Generator for Common Encoding Workflows
      </h1>
      <p className="text-sm text-muted">
        FFmpeg Commander helps you build FFmpeg commands for video conversion, audio encoding,
        filters, and container settings without memorizing every flag. Choose a preset, adjust
        format and codec options, then copy the generated command into your local FFmpeg
        workflow.
      </p>
    </header>
  )
}

export function PageAbout() {
  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-2 border-t border-line pt-5">
      <h2 id="about-heading" className="text-sm font-semibold">
        What You Can Configure
      </h2>
      <p className="text-sm text-muted">
        The builder covers common FFmpeg controls including input and output paths, container
        format, H.264 and VP9 presets, bitrate and CRF tuning, audio settings, scaling, and
        filters like deinterlacing and denoise.
      </p>
      <p className="text-sm text-muted">
        It is designed for fast command generation rather than complete FFmpeg coverage, so you
        can start from a working baseline and refine the command for your own build and media.
      </p>
    </section>
  )
}
