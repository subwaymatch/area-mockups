'use client'

import { useState } from 'react'

export function TapCounter() {
  const [count, setCount] = useState(0)

  return (
    <div className="screen tap">
      <div className="screen-statusbar">
        <span>9:41</span>
        <span className="screen-statusicons">
          <i className="si si-signal" />
          <i className="si si-wifi" />
          <i className="si si-battery" />
        </span>
      </div>

      <div className="tap-body">
        <p className="tap-label">taps registered</p>
        <p className="tap-count" key={count}>
          {count}
        </p>
        <button type="button" className="tap-button" onClick={() => setCount((c) => c + 1)}>
          Tap me
        </button>
        <button type="button" className="tap-reset" onClick={() => setCount(0)}>
          reset
        </button>
      </div>

      <p className="tap-footnote">React state, running on a 3D screen.</p>
      <div className="screen-homebar" aria-hidden />
    </div>
  )
}
