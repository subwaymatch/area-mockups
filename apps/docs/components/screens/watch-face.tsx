'use client'

import { useState } from 'react'

/** A round face for the Galaxy Watch variant. */
export function GalaxyWatchFace() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 30%, #1b2b4a 0%, #05070d 70%)',
        color: '#e8ecf4',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <div style={{ fontSize: 44, fontWeight: 200, letterSpacing: 1 }}>10:09</div>
      <div style={{ fontSize: 11, color: '#8fa3c8' }}>FRI 10 · 72%</div>
      <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
        {['#5ad0a6', '#e8b64c', '#e6453a'].map((c) => (
          <div key={c} style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
        ))}
      </div>
    </div>
  )
}

/** A watch face for the watch mockup: time, date, activity rings, one tappable complication. */
export function WatchFace() {
  const [zone, setZone] = useState<'NYC' | 'SEL'>('NYC')

  return (
    <div className="wf" onClick={() => setZone((z) => (z === 'NYC' ? 'SEL' : 'NYC'))}>
      <div className="wf-date">FRI 10</div>
      <div className="wf-time">
        {zone === 'NYC' ? '10:09' : '23:09'}
        <span className="wf-zone">{zone}</span>
      </div>
      <svg className="wf-rings" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="44" stroke="#2b0d15" strokeWidth="9" fill="none" />
        <circle cx="50" cy="50" r="44" stroke="#fa1450" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="276" strokeDashoffset="70" transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r="33" stroke="#0d2b13" strokeWidth="9" fill="none" />
        <circle cx="50" cy="50" r="33" stroke="#b0fa32" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="207" strokeDashoffset="90" transform="rotate(-90 50 50)" />
        <circle cx="50" cy="50" r="22" stroke="#0a2229" strokeWidth="9" fill="none" />
        <circle cx="50" cy="50" r="22" stroke="#32e6fa" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray="138" strokeDashoffset="30" transform="rotate(-90 50 50)" />
      </svg>
      <div className="wf-hint">tap to switch zone</div>
    </div>
  )
}
