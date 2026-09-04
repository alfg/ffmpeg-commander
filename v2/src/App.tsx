import Banner from '@/components/Banner'
import CommandOutput from '@/components/CommandOutput'
import FileIO from '@/components/FileIO'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Toolbar from '@/components/Toolbar'
import AudioSection from '@/components/sections/AudioSection'
import FiltersSection from '@/components/sections/FiltersSection'
import FormatSection from '@/components/sections/FormatSection'
import OptionsSection from '@/components/sections/OptionsSection'
import VideoSection from '@/components/sections/VideoSection'
import Field from '@/components/ui/Field'
import Tabs from '@/components/ui/Tabs'
import { useFfmpegForm } from '@/hooks/useFfmpegForm'
import presets from '@/lib/presets'
import type { IFFMpegOptionsForm } from '@/lib/types'

const presetGroups = presets.getPresetOptions()

const selectClass =
  'w-full rounded border border-line bg-panel px-2 py-1.5 text-sm text-fg ' +
  'focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none'

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

  const tabs = [
    {
      id: 'format',
      label: 'Format',
      content: (
        <FormatSection value={form.format} onChange={(patch) => update('format', patch)} />
      ),
    },
    {
      id: 'video',
      label: 'Video',
      content: (
        <VideoSection
          value={form.video}
          container={container}
          onChange={(patch) => update('video', patch)}
        />
      ),
    },
    {
      id: 'audio',
      label: 'Audio',
      content: (
        <AudioSection
          value={form.audio}
          container={container}
          onChange={(patch) => update('audio', patch)}
        />
      ),
    },
    {
      id: 'filters',
      label: 'Filters',
      content: (
        <FiltersSection value={form.filters} onChange={(patch) => update('filters', patch)} />
      ),
    },
    {
      id: 'options',
      label: 'Options',
      content: (
        <OptionsSection value={form.options} onChange={(patch) => update('options', patch)} />
      ),
    },
  ]

  return (
    <div className="relative min-h-screen bg-surface text-fg">
      <Navbar />
      <Banner />

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Preset" htmlFor="preset">
            <select
              id="preset"
              className={selectClass}
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
        </div>

        <FileIO value={form.io} onChange={(patch) => update('io', patch)} />

        <Tabs tabs={tabs} />

        <div className="flex flex-col gap-2">
          <CommandOutput cmd={cmd} />
          <p className="text-xs text-muted italic">
            *Generated options may vary based on your FFmpeg version and build
            configuration.
          </p>
        </div>

        <Toolbar cmd={cmd} onReset={reset} />
      </main>

      <Footer />
    </div>
  )
}
