import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'
import Section from './Section'
import { filterSupported, type SupportedOption } from './supported'

interface Props {
  value: IFFMpegOptionsForm['video']
  container: string
  onChange: (patch: Partial<IFFMpegOptionsForm['video']>) => void
}

export default function VideoSection({ value, container, onChange }: Props) {
  // Mirrors the Vue app: the codec list narrows to what the container supports,
  // and the encoder presets narrow to what the codec supports.
  const codecs = filterSupported(form.codecs.video as SupportedOption[], container)
  const presets = filterSupported(form.presets as SupportedOption[], value.codec)

  return (
    <Section title="Video">
      <Field label="Codec" htmlFor="video-codec">
        <Select
          id="video-codec"
          value={value.codec}
          options={codecs}
          onChange={(codec) => onChange({ codec })}
        />
      </Field>

      <Field label="Encoder preset" htmlFor="video-preset">
        <Select
          id="video-preset"
          value={value.preset}
          options={presets}
          onChange={(preset) => onChange({ preset })}
        />
      </Field>

      <Field label="Rate control" htmlFor="video-pass">
        <Select
          id="video-pass"
          value={value.pass}
          options={form.passOptions}
          onChange={(pass) => onChange({ pass })}
        />
      </Field>

      {value.pass === 'crf' ? (
        <Field label="CRF" htmlFor="video-crf" hint="Lower is higher quality.">
          <Input
            id="video-crf"
            type="number"
            value={String(value.crf ?? '')}
            onChange={(crf) => onChange({ crf })}
          />
        </Field>
      ) : (
        <Field label="Bitrate" htmlFor="video-bitrate">
          <Input
            id="video-bitrate"
            value={value.bitrate ?? ''}
            placeholder="3000k"
            onChange={(bitrate) => onChange({ bitrate })}
          />
        </Field>
      )}

      <Field label="Size" htmlFor="video-size">
        <Select
          id="video-size"
          value={value.size}
          options={form.sizes}
          onChange={(size) => onChange({ size })}
        />
      </Field>

      {value.size === 'custom' ? (
        <>
          <Field label="Width" htmlFor="video-width">
            <Input
              id="video-width"
              type="number"
              value={value.width}
              onChange={(width) => onChange({ width })}
            />
          </Field>
          <Field label="Height" htmlFor="video-height">
            <Input
              id="video-height"
              type="number"
              value={value.height}
              onChange={(height) => onChange({ height })}
            />
          </Field>
        </>
      ) : (
        <Field label="Orientation" htmlFor="video-format">
          <Select
            id="video-format"
            value={value.format}
            options={form.formats}
            onChange={(format) => onChange({ format })}
          />
        </Field>
      )}

      <Field label="Frame rate" htmlFor="video-framerate">
        <Select
          id="video-framerate"
          value={value.frame_rate}
          options={form.frameRates}
          onChange={(frame_rate) => onChange({ frame_rate })}
        />
      </Field>
    </Section>
  )
}
