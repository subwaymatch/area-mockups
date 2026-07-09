'use client'

import { useState } from 'react'

const TRACKS = [
  { title: 'Neon Skyline', artist: 'Area Waves', hue: 258 },
  { title: 'Low Orbit', artist: 'Satellite Club', hue: 198 },
  { title: 'Afterglow', artist: 'Milky Way Express', hue: 322 },
]

export function MusicPlayer() {
  const [playing, setPlaying] = useState(true)
  const [index, setIndex] = useState(0)
  const track = TRACKS[index % TRACKS.length]!

  const skip = (dir: 1 | -1) =>
    setIndex((i) => (i + dir + TRACKS.length) % TRACKS.length)

  return (
    <div className="screen mp" data-playing={playing}>
      <div className="screen-statusbar">
        <span>9:41</span>
        <span className="screen-statusicons">
          <i className="si si-signal" />
          <i className="si si-wifi" />
          <i className="si si-battery" />
        </span>
      </div>

      <div className="mp-art" style={{ ['--hue' as string]: track.hue }}>
        <div className="mp-art-disc" />
      </div>

      <div className="mp-meta">
        <div className="mp-eq" aria-hidden>
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <h2 className="mp-title">{track.title}</h2>
        <p className="mp-artist">{track.artist}</p>
      </div>

      <div className="mp-progress" aria-hidden>
        <div className="mp-progress-fill" />
      </div>

      <div className="mp-controls">
        <button type="button" aria-label="Previous track" onClick={() => skip(-1)}>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M7 6h2.4v12H7zM19 6l-9 6 9 6z" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          className="mp-play"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M8 5l11 7-11 7z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button type="button" aria-label="Next track" onClick={() => skip(1)}>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M14.6 6H17v12h-2.4zM5 6l9 6-9 6z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div className="screen-homebar" aria-hidden />
    </div>
  )
}
