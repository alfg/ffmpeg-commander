import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Range from '@/components/ui/Range'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'
import Group from './Group'
import { filterSupported, type SupportedOption } from './supported'

type Video = IFFMpegOptionsForm['video']

interface Props {
  value: Video
  container: string
  onChange: (patch: Partial<Video>) => void
}

// Free-text rate fields. GOP size is only meaningful on the encoders that
// accept -g, which is how the Vue app gates it too.
const rateFields = [
  { key: 'bitrate', label: 'Bit rate', placeholder: '3000k' },
  { key: 'minrate', label: 'Min rate', placeholder: '3000k' },
  { key: 'maxrate', label: 'Max rate', placeholder: '3000k' },
  { key: 'bufsize', label: 'Buffer size', placeholder: '6000k' },
  { key: 'gopsize', label: 'GOP size', placeholder: '72', supported: ['x264', 'vp9'] },
] as const satisfies readonly {
  key: keyof Video
  label: string
  placeholder: string
  supported?: readonly string[]
}[]

const encodeFields = [
  { key: 'pixel_format', label: 'Pixel format', options: form.pixelFormats },
  { key: 'frame_rate', label: 'Frame rate', options: form.frameRates },
  { key: 'speed', label: 'Speed', options: form.speeds },
  { key: 'tune', label: 'Tune', options: form.tunes },
  { key: 'profile', label: 'Profile', options: form.profiles },
  { key: 'level', label: 'Level', options: form.levels },
] as const

export default function VideoSection({ value, container, onChange }: Props) {
  // Mirrors the Vue app: the codec list narrows to what the container supports,
  // and the encoder presets narrow to what the codec supports.
  const codecs = filterSupported(form.codecs.video as SupportedOption[], container)
  const presets = filterSupported(form.presets as SupportedOption[], value.codec)
  const set = (key: keyof Video) => (v: string) => onChange({ [key]: v } as Partial<Video>)

  return (
    <div className="flex flex-col gap-5">
      <Group title="Encoder">
        <Field label="Codec" htmlFor="video-codec">
          <Select id="video-codec" value={value.codec} options={codecs} onChange={set('codec')} />
        </Field>
        <Field label="Encoder preset" htmlFor="video-preset">
          <Select id="video-preset" value={value.preset} options={presets} onChange={set('preset')} />
        </Field>
        <Field label="Rate control" htmlFor="video-pass">
          <Select
            id="video-pass"
            value={value.pass}
            options={form.passOptions}
            onChange={set('pass')}
          />
        </Field>
        {value.pass === 'crf' ? (
          <div className="col-span-2 sm:col-span-3">
            <Range
              id="video-crf"
              label="CRF"
              value={String(value.crf ?? '')}
              min={0}
              max={51}
              onChange={set('crf')}
            />
          </div>
        ) : null}
      </Group>

      <Group title="Bit rate">
        {rateFields
          .filter((f) => !('supported' in f) || f.supported.includes(value.codec as never))
          .map((f) => (
            <Field key={f.key} label={f.label} htmlFor={`video-${f.key}`}>
              <Input
                id={`video-${f.key}`}
                value={value[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={set(f.key)}
              />
            </Field>
          ))}
      </Group>

      <Group title="Encoding">
        {encodeFields.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`video-${f.key}`}>
            <Select
              id={`video-${f.key}`}
              value={value[f.key]}
              options={f.options}
              onChange={set(f.key)}
            />
          </Field>
        ))}
      </Group>

      <Group title="Size">
        <Field label="Faststart" htmlFor="video-faststart">
          <Select
            id="video-faststart"
            value={String(value.faststart)}
            options={form.fastStart}
            onChange={(v) => onChange({ faststart: v === 'true' })}
          />
        </Field>
        <Field label="Size" htmlFor="video-size">
          <Select id="video-size" value={value.size} options={form.sizes} onChange={set('size')} />
        </Field>
        {value.size === 'custom' ? (
          <>
            <Field label="Width" htmlFor="video-width">
              <Input id="video-width" type="number" value={value.width} onChange={set('width')} />
            </Field>
            <Field label="Height" htmlFor="video-height">
              <Input id="video-height" type="number" value={value.height} onChange={set('height')} />
            </Field>
          </>
        ) : (
          <Field label="Orientation" htmlFor="video-format">
            <Select
              id="video-format"
              value={value.format}
              options={form.formats}
              onChange={set('format')}
            />
          </Field>
        )}
        <Field label="Aspect" htmlFor="video-aspect">
          <Select
            id="video-aspect"
            value={value.aspect}
            options={form.aspects}
            onChange={set('aspect')}
          />
        </Field>
        <Field label="Scaling" htmlFor="video-scaling">
          <Select
            id="video-scaling"
            value={value.scaling}
            options={form.scalings}
            onChange={set('scaling')}
          />
        </Field>
      </Group>

      <Field label="Codec options" htmlFor="video-codec-options">
        <Textarea
          id="video-codec-options"
          value={value.codec_options}
          placeholder={`Set optional -${value.codec}-params here to overwrite encoder options.`}
          onChange={set('codec_options')}
        />
      </Field>
    </div>
  )
}
