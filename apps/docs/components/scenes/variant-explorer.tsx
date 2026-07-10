'use client'

import { useState } from 'react'
import { IPhoneMockup, PhoneMockup, type GalaxyVariant, type IPhoneVariant } from 'area-mockups'
import { MusicPlayer } from '../screens/music-player'
import { LazyScene } from '../lazy-scene'

type DeviceId =
  | { family: 'galaxy'; variant: GalaxyVariant }
  | { family: 'iphone'; variant: IPhoneVariant }

const DEVICES: { label: string; id: DeviceId }[] = [
  { label: 'S25', id: { family: 'galaxy', variant: 's25' } },
  { label: 'S25+', id: { family: 'galaxy', variant: 's25plus' } },
  { label: 'S25 Ultra', id: { family: 'galaxy', variant: 's25ultra' } },
  { label: 'S25 Edge', id: { family: 'galaxy', variant: 's25edge' } },
  { label: '17', id: { family: 'iphone', variant: '17' } },
  { label: '17 Air', id: { family: 'iphone', variant: 'air' } },
  { label: '17 Pro', id: { family: 'iphone', variant: 'pro' } },
  { label: '17 Pro Max', id: { family: 'iphone', variant: 'promax' } },
]

const GALAXY_COLORS: Record<GalaxyVariant, { color: string; frameColor: string }> = {
  s25: { color: '#1b2a41', frameColor: '#44506b' }, // Navy
  s25plus: { color: '#bcd3e8', frameColor: '#9fb4c9' }, // Icyblue
  s25ultra: { color: '#2e3238', frameColor: '#565b64' }, // Titanium Black
  s25edge: { color: '#c8cdd4', frameColor: '#aab0b9' }, // Titanium Silver
}

const IPHONE_COLORS: Record<IPhoneVariant, { color: string; frameColor: string }> = {
  '17': { color: '#cfc4e6', frameColor: '#b9aed3' }, // Lavender
  air: { color: '#bfd4e6', frameColor: '#a9c0d4' }, // Sky Blue
  pro: { color: '#c96b34', frameColor: '#b25c2a' }, // Cosmic Orange
  promax: { color: '#2b3a55', frameColor: '#3d4d6b' }, // Deep Blue
}

/** Every phone variant on one canvas. Switch device and orientation live. */
export function VariantExplorer() {
  const [selected, setSelected] = useState(6) // 17 Pro
  const [landscape, setLandscape] = useState(false)
  const device = DEVICES[selected]!.id
  const orientation = landscape ? 'landscape' : 'portrait'

  const mockup =
    device.family === 'galaxy' ? (
      <PhoneMockup
        variant={device.variant}
        orientation={orientation}
        {...GALAXY_COLORS[device.variant]}
        deviceProps={{ rotation: [0, -0.3, 0] }}
      >
        <MusicPlayer />
      </PhoneMockup>
    ) : (
      <IPhoneMockup
        variant={device.variant}
        orientation={orientation}
        {...IPHONE_COLORS[device.variant]}
        deviceProps={{ rotation: [0, -0.3, 0] }}
      >
        <MusicPlayer />
      </IPhoneMockup>
    )

  return (
    <div className="variant-explorer">
      <div className="variant-picker" role="tablist" aria-label="Device variant">
        {DEVICES.map((d, i) => (
          <button
            key={d.label}
            type="button"
            role="tab"
            aria-selected={i === selected}
            data-active={i === selected}
            onClick={() => setSelected(i)}
          >
            {d.label}
          </button>
        ))}
        <button
          type="button"
          className="variant-orientation"
          aria-pressed={landscape}
          data-active={landscape}
          onClick={() => setLandscape((l) => !l)}
        >
          ⟳ landscape
        </button>
      </div>
      <div className="mockup-viewport demo-viewport">
        <LazyScene>{mockup}</LazyScene>
      </div>
    </div>
  )
}
