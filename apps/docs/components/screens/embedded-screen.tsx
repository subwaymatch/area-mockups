'use client'

import { useEffect, useState } from 'react'

export function EmbeddedScreen() {
  const [time, setTime] = useState('')
  const [boops, setBoops] = useState(0)

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="screen embed">
      <div className="embed-orb" aria-hidden />
      <p className="embed-brand">AREA&nbsp;OS</p>
      <p className="embed-clock">{time || '··:··:··'}</p>
      <button type="button" className="embed-button" onClick={() => setBoops((b) => b + 1)}>
        Boop{boops > 0 ? ` ×${boops}` : ''}
      </button>
      <p className="embed-caption">
        A real page (<code>/embedded</code>), running inside an <code>&lt;iframe&gt;</code>.
      </p>
    </div>
  )
}
