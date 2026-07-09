'use client'

import { IPhoneMockup, LaptopMockup, PhoneMockup } from 'area-mockups'
import { TapCounter } from '../screens/tap-counter'
import { LockScreen } from '../screens/lock-screen'
import { MusicPlayer } from '../screens/music-player'
import { DesktopScreen } from '../screens/desktop-screen'

function DemoCard({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="demo-card">
      <div className="mockup-viewport demo-viewport">{children}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default function DemoScenes() {
  return (
    <div className="demo-grid">
      <DemoCard
        title="Bring your own UI"
        description={
          <>
            Plain React state on the 3D screen — the button below really clicks. Drag anywhere,
            even on the screen, to spin the device; taps still reach the UI.
          </>
        }
      >
        <PhoneMockup color="#15171d" frameColor="#4d5260" deviceProps={{ rotation: [0, -0.25, 0] }}>
          <TapCounter />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="Colorways & auto-orbit"
        description={
          <>
            <code>autoRotate</code> + <code>float</code>, in a Marble Gray colorway. Content
            hides automatically when the device faces away.
          </>
        }
      >
        <PhoneMockup
          autoRotate
          float
          color="#d3d6dd"
          frameColor="#b6bac4"
          screenBackground="#000"
        >
          <LockScreen />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="Embed a whole page"
        description={
          <>
            An <code>&lt;iframe&gt;</code> pointed at <code>/embedded</code> — a real route of
            this site, scrolling and clicking inside the glass.
          </>
        }
      >
        <PhoneMockup color="#221d31" frameColor="#453a5c" deviceProps={{ rotation: [0, 0.25, 0] }}>
          <iframe
            src="/embedded"
            title="Embedded page"
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="MacBook Air (M5)"
        description={
          <>
            <code>&lt;LaptopMockup&gt;</code> — a procedural MacBook Air-style laptop in Sky
            Blue. The desktop is live DOM too: click the window, drag to orbit.
          </>
        }
      >
        <LaptopMockup color="#aec6d9" deviceProps={{ rotation: [0, -0.35, 0] }}>
          <DesktopScreen />
        </LaptopMockup>
      </DemoCard>

      <DemoCard
        title="iPhone 17"
        description={
          <>
            <code>&lt;IPhoneMockup&gt;</code> — Dynamic Island, dual-lens plateau, Action
            button and Camera Control, here in Lavender.
          </>
        }
      >
        <IPhoneMockup
          float
          color="#cfc4e6"
          frameColor="#b9aed3"
          deviceProps={{ rotation: [0, 0.3, 0] }}
        >
          <MusicPlayer />
        </IPhoneMockup>
      </DemoCard>

      <DemoCard
        title="Transparent background"
        description={
          <>
            The WebGL canvas is transparent by default (alpha context, no scene background) —
            the checkerboard behind this phone is plain page CSS showing through.
          </>
        }
      >
        <div className="alpha-checker">
          <PhoneMockup float color="#15171d" frameColor="#4d5260" deviceProps={{ rotation: [0, 0.3, 0] }}>
            <div className="aurora-screen">
              <p>alpha</p>
            </div>
          </PhoneMockup>
        </div>
      </DemoCard>
    </div>
  )
}
