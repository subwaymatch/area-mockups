'use client'

import { useState } from 'react'
import { TabletMockup, type TabletVariant } from 'area-mockups'
import { DesktopScreen } from '../screens/desktop-screen'
import { LazyScene } from '../lazy-scene'

const TABLETS: { label: string; variant: TabletVariant; color: string }[] = [
  { label: 'iPad Pro 13″', variant: 'ipadpro13', color: '#3a3c40' }, // Space Black
  { label: 'iPad Pro 11″', variant: 'ipadpro11', color: '#e3e4e6' }, // Silver
  { label: 'Tab S11', variant: 'tabs11', color: '#4b4f56' }, // Gray
  { label: 'Tab S11 Ultra', variant: 'tabs11ultra', color: '#2e3136' }, // Graphite
]

/** All tablet variants on one canvas. Switch device and orientation live. */
export function TabletExplorer() {
  const [selected, setSelected] = useState(0)
  const [landscape, setLandscape] = useState(true)
  const tablet = TABLETS[selected]!

  return (
    <div className="variant-explorer">
      <div className="variant-picker" role="tablist" aria-label="Tablet variant">
        {TABLETS.map((t, i) => (
          <button
            key={t.variant}
            type="button"
            role="tab"
            aria-selected={i === selected}
            data-active={i === selected}
            onClick={() => setSelected(i)}
          >
            {t.label}
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
        <LazyScene>
          <TabletMockup
            variant={tablet.variant}
            orientation={landscape ? 'landscape' : 'portrait'}
            color={tablet.color}
            deviceProps={{ rotation: [0, -0.3, 0] }}
          >
            <DesktopScreen />
          </TabletMockup>
        </LazyScene>
      </div>
    </div>
  )
}
