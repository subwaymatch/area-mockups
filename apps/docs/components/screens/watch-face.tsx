'use client'

import { useState } from 'react'

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
