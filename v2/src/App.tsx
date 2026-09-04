import AudioSection from '@/components/sections/AudioSection'
import FormatSection from '@/components/sections/FormatSection'
import VideoSection from '@/components/sections/VideoSection'
import CommandOutput from '@/components/CommandOutput'
import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import { useFfmpegForm } from '@/hooks/useFfmpegForm'
import presets from '@/lib/presets'
import type { IFFMpegOptionsForm } from '@/lib/types'

const presetGroups = presets.getPresetOptions()

export default function App() {
  const { form, cmd, update, reset, setForm } = useFfmpegForm()
  const container = form.format.container ?? 'mp4'

  const applyPreset = (slug: string) => {
    if (slug === 'custom') {
      reset()
      return
    }
    const preset = presets.getPreset(slug) as Partial<IFFMpegOptionsForm> | undefined
    if (!preset) return
    setForm((prev) => ({
      ...prev,
      format: { ...prev.format, ...preset.format },
      video: { ...prev.video, ...preset.video },
      audio: { ...prev.audio, ...preset.audio },
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-chrome text-chrome-fg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">FFmpeg Commander</h1>
          <a
            href="https://github.com/alfg/ffmpeg-commander"
            className="text-sm underline-offset-2 hover:underline"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <CommandOutput cmd={cmd} />

        <section className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Preset" htmlFor="preset">
              <select
                id="preset"
                className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                defaultValue="custom"
                onChange={(e) => applyPreset(e.target.value)}
              >
                {presetGroups.map((group) => (
                  <optgroup key={group.id} label={group.name}>
                    {group.data.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>

            <Field label="Input" htmlFor="io-input">
              <Input
                id="io-input"
                value={form.io.input}
                onChange={(input) => update('io', { input })}
              />
            </Field>

            <Field label="Output" htmlFor="io-output">
              <Input
                id="io-output"
                value={form.io.output}
                onChange={(output) => update('io', { output })}
              />
            </Field>
          </div>
        </section>

        <FormatSection value={form.format} onChange={(patch) => update('format', patch)} />
        <VideoSection
          value={form.video}
          container={container}
          onChange={(patch) => update('video', patch)}
        />
        <AudioSection
          value={form.audio}
          container={container}
          onChange={(patch) => update('audio', patch)}
        />

        <p className="text-xs text-gray-500">
          Scaffold port. Filters, extra options, tooltips and the ffmpegd queue are
          not wired up yet.
        </p>
      </main>
    </div>
  )
}
