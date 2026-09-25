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
  /** Video filters are set while the codec is copy, which ffmpeg rejects. */
  copyConflict?: boolean
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
] as const

// x264 and x265 fall back to CRF without a target bit rate, and CRF cannot
// drive a two-pass encode: pass 2 fails to open the encoder.
const twoPassNeedsBitrate = ['x264', 'x265']

export default function VideoSection({ value, container, copyConflict, onChange }: Props) {
  // Mirrors the Vue app: the codec list narrows to what the container supports,
  // and the encoder presets narrow to what the codec supports.
  const codecs = filterSupported(form.codecs.video as SupportedOption[], container)
  const presets = filterSupported(form.presets as SupportedOption[], value.codec)
  const profiles = filterSupported(form.profiles as SupportedOption[], value.codec)
  const tunes = filterSupported(form.tunes as SupportedOption[], value.codec)
  const isHevcNvenc = value.codec === 'hevc_nvenc'
  const missingBitrate =
    value.pass === '2' && twoPassNeedsBitrate.includes(value.codec) && !value.bitrate
  const set = (key: keyof Video) => (v: string) => onChange({ [key]: v } as Partial<Video>)

  // "None" is -vn: there is no video stream left to configure, so every control
  // below the codec select would be dead. The audio recipes rely on this.
  if (value.codec === 'none') {
    return (
      <div className="flex flex-col gap-5">
        <Group title="Encoder">
          <Field label="Codec" htmlFor="video-codec">
            <Select id="video-codec" value={value.codec} options={codecs} onChange={set('codec')} />
          </Field>
        </Group>
        <p className="text-xs text-muted italic">
          Video is disabled (<code>-vn</code>). Choose a codec to bring the video options back.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <Group title="Encoder">
        <Field
          label="Codec"
          htmlFor="video-codec"
          error={copyConflict ? 'Copy cannot be filtered, resized or sped up. Pick a codec to apply those settings.' : undefined}
        >
          <Select id="video-codec" value={value.codec} options={codecs} onChange={set('codec')} />
        </Field>
        <Field label="Encoder preset" htmlFor="video-preset">
          <Select id="video-preset" value={value.preset} options={presets} onChange={set('preset')} />
        </Field>
        {isHevcNvenc ? (
          <>
            <Field label="Rate control" htmlFor="video-nvenc-rc">
              <Select
                id="video-nvenc-rc"
                value={value.nvenc_rc}
                options={form.nvencRateControls}
                onChange={set('nvenc_rc')}
              />
            </Field>

            {value.nvenc_rc === 'vbr' ? (
              <div className="col-span-2 sm:col-span-3">
                <Range
                  id="video-nvenc-cq"
                  label="CQ"
                  value={String(value.nvenc_cq)}
                  min={0}
                  max={51}
                  onChange={set('nvenc_cq')}
                />
              </div>
            ) : null}

            {value.nvenc_rc === 'constqp' ? (
              <div className="col-span-2 sm:col-span-3">
                <Range
                  id="video-nvenc-qp"
                  label="QP"
                  value={String(value.nvenc_qp)}
                  min={0}
                  max={51}
                  onChange={set('nvenc_qp')}
                />
              </div>
            ) : null}

            <Field label="Multipass" htmlFor="video-nvenc-multipass">
              <Select
                id="video-nvenc-multipass"
                value={value.nvenc_multipass}
                options={form.nvencMultipass}
                onChange={set('nvenc_multipass')}
              />
            </Field>
          </>
        ) : (
          <>
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
          </>
        )}
      </Group>

      <Group title="Bit rate">
        {rateFields
          .filter((f) => !('supported' in f) || f.supported.includes(value.codec as never))
          .map((f) => (
            <Field
              key={f.key}
              label={f.label}
              htmlFor={`video-${f.key}`}
              error={f.key === 'bitrate' && missingBitrate ? 'Two-pass needs a target bit rate.' : undefined}
            >
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
              value={String(value[f.key])}
              options={
                f.key === 'profile'
                  ? profiles
                  : f.key === 'tune'
                    ? tunes
                    : f.options
              }
              onChange={set(f.key)}
            />
          </Field>
        ))}

        <Field label="Level" htmlFor="video-level">
          <Select
            id="video-level"
            value={value.level}
            options={isHevcNvenc ? form.nvencHevcLevels : form.levels}
            onChange={set('level')}
          />
        </Field>
      </Group>

      {isHevcNvenc ? (
        <Group title="NVIDIA HEVC NVENC">
          <Field label="Tier" htmlFor="video-nvenc-tier">
            <Select
              id="video-nvenc-tier"
              value={value.nvenc_tier}
              options={form.nvencHevcTiers}
              onChange={set('nvenc_tier')}
            />
          </Field>
          <Field label="Lookahead frames" htmlFor="video-nvenc-lookahead">
            <Input
              id="video-nvenc-lookahead"
              type="number"
              value={value.nvenc_rc_lookahead}
              onChange={set('nvenc_rc_lookahead')}
            />
          </Field>
          <Field label="Spatial AQ" htmlFor="video-nvenc-spatial-aq">
            <Select
              id="video-nvenc-spatial-aq"
              value={value.nvenc_spatial_aq}
              options={form.booleanOptions}
              onChange={set('nvenc_spatial_aq')}
            />
          </Field>
          {value.nvenc_spatial_aq === '1' ? (
            <Field label="AQ strength" htmlFor="video-nvenc-aq-strength">
              <Input
                id="video-nvenc-aq-strength"
                type="number"
                value={value.nvenc_aq_strength}
                onChange={set('nvenc_aq_strength')}
              />
            </Field>
          ) : null}
          <Field label="Temporal AQ" htmlFor="video-nvenc-temporal-aq">
            <Select
              id="video-nvenc-temporal-aq"
              value={value.nvenc_temporal_aq}
              options={form.booleanOptions}
              onChange={set('nvenc_temporal_aq')}
            />
          </Field>
          <Field label="B-frame references" htmlFor="video-nvenc-b-ref">
            <Select
              id="video-nvenc-b-ref"
              value={value.nvenc_b_ref_mode}
              options={form.nvencBRefModes}
              onChange={set('nvenc_b_ref_mode')}
            />
          </Field>
          <Field label="Zero latency" htmlFor="video-nvenc-zero-latency">
            <Select
              id="video-nvenc-zero-latency"
              value={value.nvenc_zerolatency}
              options={form.booleanOptions}
              onChange={set('nvenc_zerolatency')}
            />
          </Field>
          <Field label="Strict GOP" htmlFor="video-nvenc-strict-gop">
            <Select
              id="video-nvenc-strict-gop"
              value={value.nvenc_strict_gop}
              options={form.booleanOptions}
              onChange={set('nvenc_strict_gop')}
            />
          </Field>
          <Field label="Scene cut" htmlFor="video-nvenc-no-scenecut">
            <Select
              id="video-nvenc-no-scenecut"
              value={value.nvenc_no_scenecut}
              options={[
                { name: 'Default', value: 'default' },
                { name: 'Enabled', value: '0' },
                { name: 'Disabled', value: '1' },
              ]}
              onChange={set('nvenc_no_scenecut')}
            />
          </Field>
          <Field label="Adaptive B-frames" htmlFor="video-nvenc-b-adapt">
            <Select
              id="video-nvenc-b-adapt"
              value={value.nvenc_b_adapt}
              options={form.booleanOptions}
              onChange={set('nvenc_b_adapt')}
            />
          </Field>
          <Field label="Weighted prediction" htmlFor="video-nvenc-weighted-pred">
            <Select
              id="video-nvenc-weighted-pred"
              value={value.nvenc_weighted_pred}
              options={form.booleanOptions}
              onChange={set('nvenc_weighted_pred')}
            />
          </Field>
          <Field label="GPU" htmlFor="video-nvenc-gpu">
            <Input
              id="video-nvenc-gpu"
              type="number"
              value={value.nvenc_gpu}
              placeholder="Auto"
              onChange={set('nvenc_gpu')}
            />
          </Field>
        </Group>
      ) : null}

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
            <Field label="Fit" htmlFor="video-fit">
              <Select
                id="video-fit"
                value={String(value.fit)}
                options={form.fits}
                onChange={(v) => onChange({ fit: v === 'true' })}
              />
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
