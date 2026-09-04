import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'
import Section from './Section'
import { filterSupported, type SupportedOption } from './supported'

interface Props {
  value: IFFMpegOptionsForm['audio']
  container: string
  onChange: (patch: Partial<IFFMpegOptionsForm['audio']>) => void
}

export default function AudioSection({ value, container, onChange }: Props) {
  const codecs = filterSupported(form.codecs.audio as SupportedOption[], container)

  return (
    <Section title="Audio">
      <Field label="Codec" htmlFor="audio-codec">
        <Select
          id="audio-codec"
          value={value.codec}
          options={codecs}
          onChange={(codec) => onChange({ codec })}
        />
      </Field>

      <Field label="Channels" htmlFor="audio-channel">
        <Select
          id="audio-channel"
          value={value.channel}
          options={form.audioChannels}
          onChange={(channel) => onChange({ channel })}
        />
      </Field>

      <Field label="Quality" htmlFor="audio-quality">
        <Select
          id="audio-quality"
          value={value.quality}
          options={form.audioQualities}
          onChange={(quality) => onChange({ quality })}
        />
      </Field>

      {value.quality === 'custom' ? (
        <Field label="Bitrate" htmlFor="audio-bitrate">
          <Input
            id="audio-bitrate"
            value={value.bitrate ?? ''}
            placeholder="192k"
            onChange={(bitrate) => onChange({ bitrate })}
          />
        </Field>
      ) : null}

      <Field label="Sample rate" htmlFor="audio-samplerate">
        <Select
          id="audio-samplerate"
          value={value.sampleRate}
          options={form.sampleRates}
          onChange={(sampleRate) => onChange({ sampleRate })}
        />
      </Field>

      <Field label="Volume" htmlFor="audio-volume" hint="Percent of the source level.">
        <Input
          id="audio-volume"
          type="number"
          value={String(value.volume ?? '')}
          onChange={(volume) => onChange({ volume })}
        />
      </Field>
    </Section>
  )
}
