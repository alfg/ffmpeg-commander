/**
 * The indexable copy from Home.vue.
 *
 * The app is otherwise almost entirely form controls, which give a crawler
 * nothing to work with -- this is the page's only real prose, and its only h1.
 *
 * Split by position rather than trimmed: search does not weight above-the-fold
 * text more heavily, but readers feel every line that sits between them and the
 * tool. So the heading and one sentence go above, and the rest goes below the
 * builder, collapsed. The word count is essentially unchanged.
 */
export function PageHeading() {
  return (
    <header>
      <h1 className="text-base font-semibold tracking-tight">
        FFmpeg Command Generator for Common Encoding Workflows
      </h1>
      <p className="text-sm text-muted">
        Build FFmpeg commands without memorizing every flag.
      </p>
    </header>
  )
}

export function PageAbout() {
  return (
    <details className="border-t border-line pt-4 text-sm">
      <summary className="cursor-pointer font-semibold marker:text-muted">
        What You Can Configure
      </summary>
      <div className="mt-2 flex flex-col gap-2 text-muted">
        <p>
          FFmpeg Commander helps you build FFmpeg commands for video conversion, audio
          encoding, filters, and container settings. Choose a preset, adjust format and codec
          options, then copy the generated command into your local FFmpeg workflow.
        </p>
        <p>
          The builder covers common FFmpeg controls including input and output paths, container
          format, H.264 and VP9 presets, bitrate and CRF tuning, audio settings, scaling, and
          filters like deinterlacing and denoise.
        </p>
        <p>
          It is designed for fast command generation rather than complete FFmpeg coverage, so
          you can start from a working baseline and refine the command for your own build and
          media.
        </p>
      </div>
    </details>
  )
}
