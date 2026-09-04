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
import Input from '@/components/ui/Input'
import Tabs from '@/components/ui/Tabs'
import Queue from '@/components/Queue'
import { useFfmpegd } from '@/hooks/useFfmpegd'
import { useFfmpegForm } from '@/hooks/useFfmpegForm'
import { usePresets } from '@/hooks/usePresets'
import util from '@/lib/util'

const selectClass =
  'w-full rounded border border-line bg-panel px-2 py-1.5 text-sm text-fg ' +
  'focus:border-ring focus:ring-1 focus:ring-ring focus:outline-none'

export default function App() {
  const { form, cmd, update, updateFormat, reset, setForm } = useFfmpegForm()
  const preset = usePresets({ form, setForm })
  const ffmpegd = useFfmpegd()
  const container = form.format.container ?? 'mp4'

  const tabs = [
    {
      id: 'format',
      label: 'Format',
      content: (
        <FormatSection value={form.format} onChange={updateFormat} />
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
        <OptionsSection
          value={form.options}
          onChange={(patch) => update('options', patch)}
          ffmpegdEnabled={ffmpegd.enabled}
          onFfmpegdChange={ffmpegd.setEnabled}
        />
      ),
    },
  ]

  const builder = (
    <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Preset" htmlFor="preset">
              <select
                id="preset"
                className={selectClass}
                value={preset.presetId}
                onChange={(e) => preset.select(e.target.value)}
              >
                {preset.groups.map((group) => (
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

            {/* Only a preset of your own has a name you can edit. */}
            {preset.isSaved ? (
              <Field label="Preset name" htmlFor="preset-name">
                <Input id="preset-name" value={preset.presetName ?? ''} onChange={preset.rename} />
              </Field>
            ) : null}
          </div>

          <FileIO
          value={form.io}
          onChange={(patch) => update('io', patch)}
          ffmpegdEnabled={ffmpegd.enabled}
          ffmpegdConnected={ffmpegd.connected}
        />

          <Tabs tabs={tabs} />

          <div className="flex flex-col gap-2">
            <CommandOutput cmd={cmd} />
            <p className="text-xs text-muted italic">
              *Generated options may vary based on your FFmpeg version and build
              configuration.
            </p>
          </div>

          <Toolbar
            cmd={cmd}
            isSavedPreset={preset.isSaved}
            canEncode={ffmpegd.enabled && ffmpegd.connected}
            encoding={ffmpegd.encoding}
            onEncode={() =>
              ffmpegd.enqueue(form.io.input, form.io.output, util.transformToJSON(form))
            }
            onSave={() => preset.save()}
            onSaveAsNew={() => preset.save(true)}
            onDelete={preset.remove}
            onReset={() => {
              reset()
              preset.select('custom')
            }}
          />
    </div>
  )

  return (
    <div className="relative min-h-screen bg-surface text-fg">
      <Navbar />
      <Banner />

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        {/* The Queue only exists when a daemon is in play, so the whole tab
            strip appears with it rather than sitting there empty. */}
        {ffmpegd.enabled ? (
          <Tabs
            align="right"
            tabs={[
              { id: 'builder', label: 'Builder', content: builder },
              {
                id: 'queue',
                label: ffmpegd.jobs.length ? `Queue (${ffmpegd.jobs.length})` : 'Queue',
                content: (
                  <Queue
                    jobs={ffmpegd.jobs}
                    progress={ffmpegd.progress}
                    connected={ffmpegd.connected}
                    onCancel={ffmpegd.cancel}
                    onRestart={ffmpegd.restart}
                    onToggleDetails={ffmpegd.toggleDetails}
                    onClear={ffmpegd.clear}
                  />
                ),
              },
            ]}
          />
        ) : (
          builder
        )}
      </main>

      <Footer />
    </div>
  )
}
