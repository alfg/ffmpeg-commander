import Field from '@/components/ui/Field'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import form from '@/lib/form'
import type { IFFMpegOptionsForm } from '@/lib/types'
import Section from './Section'

interface Props {
  value: IFFMpegOptionsForm['format']
  onChange: (patch: Partial<IFFMpegOptionsForm['format']>) => void
}

const containers = [...form.containers.video, ...form.containers.audio]

export default function FormatSection({ value, onChange }: Props) {
  return (
    <Section title="Format">
      <Field label="Container" htmlFor="format-container">
        <Select
          id="format-container"
          value={value.container ?? 'mp4'}
          options={containers}
          onChange={(container) => onChange({ container })}
        />
      </Field>

      <Field label="Clip" htmlFor="format-clip">
        <Select
          id="format-clip"
          value={String(value.clip)}
          options={form.clip}
          onChange={(clip) => onChange({ clip: clip === 'true' })}
        />
      </Field>

      {value.clip ? (
        <>
          <Field label="Start time" htmlFor="format-start">
            <Input
              id="format-start"
              value={value.startTime ?? ''}
              placeholder="00:00:00"
              onChange={(startTime) => onChange({ startTime })}
            />
          </Field>
          <Field label="Stop time" htmlFor="format-stop">
            <Input
              id="format-stop"
              value={value.stopTime ?? ''}
              placeholder="00:00:10"
              onChange={(stopTime) => onChange({ stopTime })}
            />
          </Field>
        </>
      ) : null}
    </Section>
  )
}
