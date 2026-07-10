import type { Metadata } from 'next'
import { CodeBlock } from '@/components/code-block'
import { PropsTable } from '@/components/props-table'

export const metadata: Metadata = {
  title: 'Docs — area-mockups',
  description: 'Installation, usage and API reference for area-mockups.',
}

const installSnippet = `npm install area-mockups three @react-three/fiber @react-three/drei`

const quickstartSnippet = `'use client'

import { PhoneMockup } from 'area-mockups'

export function Hero() {
  return (
    <div style={{ height: 560 }}>
      <PhoneMockup autoRotate float>
        <YourApp /> {/* any React node */}
      </PhoneMockup>
    </div>
  )
}`

const contentSnippet = `// React components — state, effects and events all keep working
<PhoneMockup>
  <SignupForm />
</PhoneMockup>

// A whole page via iframe
<PhoneMockup>
  <iframe src="https://example.com" style={{ width: '100%', height: '100%', border: 0 }} />
</PhoneMockup>

// Video, images, anything the browser can render
<PhoneMockup>
  <video src="/demo.mp4" autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
</PhoneMockup>`

const composeSnippet = `'use client'

import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { MockupCanvas, Phone } from 'area-mockups'

// Option A: the ready-made stage with your own scene arrangement
export function Stage() {
  return (
    <MockupCanvas autoRotate background="#0b0d12">
      <Float>
        <Phone color="#d3d6dd" frameColor="#b6bac4" rotation={[0, -0.4, 0]}>
          <YourApp />
        </Phone>
      </Float>
    </MockupCanvas>
  )
}

// Option B: drop the device into a Canvas you already have
export function CustomScene() {
  return (
    <Canvas camera={{ position: [0, 0.5, 7.4], fov: 40 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.4} />
      <Phone>
        <YourApp />
      </Phone>
    </Canvas>
  )
}`

const ssrSnippet = `'use client'

import dynamic from 'next/dynamic'

// WebGL only exists in the browser — load the scene client-side only.
const Mockup = dynamic(() => import('./mockup'), { ssr: false })

export function Hero() {
  return <Mockup />
}`

export default function DocsPage() {
  return (
    <div className="container page prose">
      <header className="page-header">
        <h1>Documentation</h1>
        <p>
          Everything you need to put live content on a 3D phone: install, quick start, and the
          full component API.
        </p>
      </header>

      <section>
        <h2>Installation</h2>
        <p>
          <code>area-mockups</code> is built on{' '}
          <a href="https://threejs.org" target="_blank" rel="noreferrer">
            three.js
          </a>{' '}
          and{' '}
          <a href="https://github.com/pmndrs/react-three-fiber" target="_blank" rel="noreferrer">
            react-three-fiber
          </a>
          , which are peer dependencies — install them alongside the package:
        </p>
        <CodeBlock title="terminal">{installSnippet}</CodeBlock>
        <p>Requires React 18+. React 19 and the current three.js releases are recommended.</p>
      </section>

      <section>
        <h2>Quick start</h2>
        <p>
          Give the mockup a sized container and pass your content as children. The component
          renders WebGL, so it must run in a client component.
        </p>
        <CodeBlock title="hero.tsx">{quickstartSnippet}</CodeBlock>
        <p>
          Drag anywhere — the body, the surrounding space, or the screen itself — to orbit.
          Taps and clicks on the screen still go to <em>your</em> content, so buttons, links
          and forms work exactly like regular DOM; only gestures that travel a few pixels are
          treated as rotation.
        </p>
      </section>

      <section>
        <h2>Put anything on the screen</h2>
        <p>
          The display is real DOM projected onto the 3D glass with CSS 3D transforms (via
          drei&apos;s <code>Html</code>), while the device itself is GPU-rendered WebGL. Your
          content is laid out in a virtual viewport that matches the real device&apos;s
          logical resolution, so layouts and breakpoints behave exactly like on the real
          hardware. Change the width via <code>resolution</code>; the aspect ratio always
          stays true to the panel.
        </p>
        <CodeBlock title="examples.tsx">{contentSnippet}</CodeBlock>

        <h3>Device specifications</h3>
        <p>
          Every device the library models, with its real-hardware basis and what it costs to
          ship. Virtual screens default to the device&apos;s logical resolution (CSS px) in
          both orientations; import cost is the tree-shaken, minified size of that family
          (gzip), with three/react-three-fiber/drei as peers — measured by{' '}
          <code>scripts/measure-size.mjs</code>.
        </p>
        <div className="table-scroll">
        <table className="props-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Component</th>
              <th>Body (mm)</th>
              <th>Display</th>
              <th>Portrait</th>
              <th>Landscape</th>
              <th>Import cost</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Samsung Galaxy S25</td><td><code>PhoneMockup · s25</code></td><td className="type">146.9×70.5×7.2</td><td className="type">6.2&quot; 2340×1080</td><td className="type">360×780</td><td className="type">780×360</td><td className="type" rowSpan={4}>10.4 KB min<br />3.7 KB gzip</td></tr>
            <tr><td>Samsung Galaxy S25+</td><td><code>PhoneMockup · s25plus</code></td><td className="type">158.4×75.8×7.3</td><td className="type">6.7&quot; 3120×1440</td><td className="type">384×832</td><td className="type">832×384</td></tr>
            <tr><td>Samsung Galaxy S25 Ultra</td><td><code>PhoneMockup · s25ultra</code></td><td className="type">162.8×77.6×8.2</td><td className="type">6.9&quot; 3120×1440</td><td className="type">384×832</td><td className="type">832×384</td></tr>
            <tr><td>Samsung Galaxy S25 Edge</td><td><code>PhoneMockup · s25edge</code></td><td className="type">158.2×75.6×5.8</td><td className="type">6.7&quot; 3120×1440</td><td className="type">384×832</td><td className="type">832×384</td></tr>
            <tr><td>Apple iPhone 17</td><td><code>IPhoneMockup · 17</code></td><td className="type">149.6×71.5×7.95</td><td className="type">6.3&quot; 2622×1206</td><td className="type">402×874</td><td className="type">874×402</td><td className="type" rowSpan={4}>12.4 KB min<br />4.1 KB gzip</td></tr>
            <tr><td>Apple iPhone 17 Air</td><td><code>IPhoneMockup · air</code></td><td className="type">156.2×74.7×5.64</td><td className="type">6.5&quot; 2736×1260</td><td className="type">420×912</td><td className="type">912×420</td></tr>
            <tr><td>Apple iPhone 17 Pro</td><td><code>IPhoneMockup · pro</code></td><td className="type">150.0×71.9×8.75</td><td className="type">6.3&quot; 2622×1206</td><td className="type">402×874</td><td className="type">874×402</td></tr>
            <tr><td>Apple iPhone 17 Pro Max</td><td><code>IPhoneMockup · promax</code></td><td className="type">163.4×78.0×8.75</td><td className="type">6.9&quot; 2868×1320</td><td className="type">440×956</td><td className="type">956×440</td></tr>
            <tr><td>Apple MacBook Air 13&quot; (M5)</td><td><code>LaptopMockup</code></td><td className="type">304.1×215×11.3</td><td className="type">13.6&quot; 2560×1664</td><td className="type">—</td><td className="type">1280×832</td><td className="type">12.5 KB min<br />4.7 KB gzip</td></tr>
            <tr><td>Apple iPad Pro 13&quot; (M5)</td><td><code>TabletMockup</code></td><td className="type">281.6×215.5×5.1</td><td className="type">13&quot; 2752×2064</td><td className="type">1032×1376</td><td className="type">1376×1032</td><td className="type">8.6 KB min<br />3.1 KB gzip</td></tr>
            <tr><td>Apple Watch Series 11 (46mm)</td><td><code>WatchMockup</code></td><td className="type">46×39×9.7</td><td className="type">1.96&quot; 416×496</td><td className="type">208×248</td><td className="type">—</td><td className="type">7.5 KB min<br />2.9 KB gzip</td></tr>
          </tbody>
        </table>
        </div>
        <p>
          Resolution basis: Galaxy S25 is its panel at ⅓ scale; the QHD+ Galaxys use One
          UI&apos;s default FHD+ render at 450 dpi (build.prop-confirmed on the Ultra);
          iPhones, iPad and Watch use their exact point grids (3x / 2x). Importing the whole
          library costs 35.0 KB min / 9.3 KB gzip. Pass{' '}
          <code>orientation=&quot;landscape&quot;</code> on a phone or tablet to lay the
          device on its side: the virtual viewport swaps to the landscape resolution and
          your content renders upright, exactly like rotating the real device.
        </p>
      </section>

      <section>
        <h2>Composing scenes</h2>
        <p>
          <code>&lt;PhoneMockup&gt;</code> is a convenience wrapper around two composable
          pieces: <code>&lt;MockupCanvas&gt;</code> (stage: canvas, lighting, shadows,
          controls) and <code>&lt;Phone&gt;</code> (the device). Use them directly for full
          control:
        </p>
        <CodeBlock title="compose.tsx">{composeSnippet}</CodeBlock>
      </section>

      <section>
        <h2>Transparent background</h2>
        <p>
          The WebGL canvas uses an alpha context with no scene background, so mockups are{' '}
          <strong>transparent by default</strong> — whatever your page renders behind the
          canvas shows through around the device. Pass the <code>background</code> prop (any
          CSS value) when you want the stage to paint its own backdrop:
        </p>
        <CodeBlock title="transparent.tsx">{`// transparent by default — your page shows through
<PhoneMockup>…</PhoneMockup>

// or paint a backdrop on the canvas itself
<PhoneMockup background="radial-gradient(60% 60% at 50% 40%, #1b1e2b, #07080b)">…</PhoneMockup>`}</CodeBlock>
        <p>See it live in the “Transparent background” demo on the demos page.</p>
      </section>

      <section>
        <h2>API reference</h2>

        <h3>&lt;PhoneMockup&gt;</h3>
        <p>
          The all-in-one component. Accepts every <code>&lt;MockupCanvas&gt;</code> prop, every{' '}
          <code>&lt;Phone&gt;</code> appearance prop, plus:
        </p>
        <PropsTable
          rows={[
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Screen content — any React node, iframe, video…',
            },
            {
              name: 'float',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Gentle floating idle animation for the device.',
            },
            {
              name: 'deviceProps',
              type: 'PhoneProps',
              description:
                'Extra props forwarded to the device group — position, rotation, scale, etc.',
            },
          ]}
        />

        <h3>&lt;MockupCanvas&gt;</h3>
        <PropsTable
          rows={[
            {
              name: 'controls',
              type: 'boolean',
              defaultValue: 'true',
              description: 'Drag-to-orbit controls (pan is always disabled).',
            },
            {
              name: 'autoRotate',
              type: 'boolean',
              defaultValue: 'false',
              description: 'Slowly orbit the camera around the device.',
            },
            {
              name: 'autoRotateSpeed',
              type: 'number',
              defaultValue: '1',
              description: 'Orbit speed when autoRotate is on.',
            },
            {
              name: 'zoom',
              type: 'boolean',
              defaultValue: 'false',
              description:
                'Scroll/pinch zoom. Off by default so embedded mockups never hijack page scroll.',
            },
            {
              name: 'shadows',
              type: 'boolean',
              defaultValue: 'true',
              description: 'Soft contact shadow under the device.',
            },
            {
              name: 'environment',
              type: 'boolean',
              defaultValue: 'true',
              description:
                'Procedural studio lighting/reflections. Generated on the GPU — no HDR downloads.',
            },
            {
              name: 'background',
              type: 'string',
              description: 'CSS background of the canvas (color, gradient, image…).',
            },
            {
              name: 'camera',
              type: 'CanvasProps[camera]',
              defaultValue: '[0, 0.5, 7.4] fov 40',
              description: 'Override the default camera.',
            },
            {
              name: 'dpr',
              type: 'number | [min, max]',
              defaultValue: '[1, 2]',
              description: 'Device-pixel-ratio clamp — keeps hi-dpi GPU load predictable.',
            },
          ]}
        />

        <h3>&lt;Phone&gt;</h3>
        <p>
          The procedural device model. Render it inside any react-three-fiber canvas. Also
          accepts all r3f group props (<code>position</code>, <code>rotation</code>,{' '}
          <code>scale</code>…).
        </p>
        <PropsTable
          rows={[
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Screen content.',
            },
            {
              name: 'variant',
              type: "'s25' | 's25plus' | 's25ultra' | 's25edge'",
              defaultValue: "'s25'",
              description:
                'Which Galaxy S25-family device to render — true relative sizes, per-model cameras (Ultra five-element array, Edge pill island) and logical resolutions.',
            },
            {
              name: 'orientation',
              type: "'portrait' | 'landscape'",
              defaultValue: "'portrait'",
              description:
                'landscape lays the device on its side and swaps the virtual display (e.g. 780×360 on the S25) with upright content.',
            },
            {
              name: 'color',
              type: 'string',
              defaultValue: "'#101216'",
              description: 'Back-panel colorway.',
            },
            {
              name: 'frameColor',
              type: 'string',
              defaultValue: "'#4a4f59'",
              description: 'Metal frame, buttons and camera rings.',
            },
            {
              name: 'screenBackground',
              type: 'string',
              defaultValue: "'#000000'",
              description: 'CSS background painted behind your content.',
            },
            {
              name: 'resolution',
              type: 'number',
              defaultValue: '360',
              description:
                'CSS pixel width of the virtual display; height follows the panel aspect (360 → 360×780, the Galaxy S25 panel at one-third scale).',
            },
            {
              name: 'punchHole',
              type: 'boolean',
              defaultValue: 'true',
              description: 'Front camera punch-hole overlay.',
            },
            {
              name: 'interactive',
              type: 'boolean',
              defaultValue: 'true',
              description:
                'Whether pointer events (clicks, scrolling, typing) reach the screen content.',
            },
            {
              name: 'dragToRotate',
              type: 'boolean',
              defaultValue: 'true',
              description:
                'Hand drags that start on the screen to the orbit controls after ~10px of travel; taps and clicks still reach your content. Disable when your content needs its own drag gestures.',
            },
            {
              name: 'occlude',
              type: "boolean | 'blending'",
              defaultValue: 'true',
              description:
                'Hide screen content when the device faces away. true raycasts against the body (fast, keeps content clickable); blending is per-pixel but disables screen interactivity.',
            },
            {
              name: 'screenStyle',
              type: 'CSSProperties',
              description: 'Extra styles merged onto the screen wrapper.',
            },
          ]}
        />

        <h3>&lt;IPhone&gt; / &lt;IPhoneMockup&gt;</h3>
        <p>
          An iPhone 17-family device — flat frame, Dynamic Island, per-model rear camera
          architecture, Action button and Camera Control. Same API as{' '}
          <code>&lt;Phone&gt;</code> / <code>&lt;PhoneMockup&gt;</code>, except:
        </p>
        <PropsTable
          rows={[
            {
              name: 'variant',
              type: "'17' | 'air' | 'pro' | 'promax'",
              defaultValue: "'17'",
              description:
                'Which iPhone 17-family device: 17 (two-lens pill), air (ultra-thin, single-lens bar), pro / promax (full-width triple-lens plateau, flash + LiDAR).',
            },
            {
              name: 'orientation',
              type: "'portrait' | 'landscape'",
              defaultValue: "'portrait'",
              description:
                'landscape lays the device on its side and swaps the virtual display (e.g. 874×402 on the 17) with upright content.',
            },
            {
              name: 'dynamicIsland',
              type: 'boolean',
              defaultValue: 'true',
              description: 'Dynamic Island overlay (replaces punchHole).',
            },
            {
              name: 'resolution',
              type: 'number',
              defaultValue: 'per variant',
              description:
                'Virtual display width; defaults to the variant point grid — 402×874 (17/pro), 420×912 (air), 440×956 (promax).',
            },
            {
              name: 'color',
              type: 'string',
              defaultValue: "'#1a1c20'",
              description:
                'Back colorway. 17: Lavender #cfc4e6, Mist Blue #b7c9dd, Sage #aebfae · Air: Sky Blue #bfd4e6, Light Gold #e6d9c0 · Pro: Cosmic Orange #c96b34, Deep Blue #2b3a55, Silver #dfe0e2.',
            },
          ]}
        />

        <h3>&lt;Laptop&gt; / &lt;LaptopMockup&gt;</h3>
        <p>
          A MacBook Air 13&quot; (M5)-style laptop — unibody deck with Magic-Keyboard key grid
          and trackpad, hinged notched display. Same screen/interaction API as the phones
          (<code>interactive</code>, <code>dragToRotate</code>, <code>occlude</code>,{' '}
          <code>screenStyle</code>), plus:
        </p>
        <PropsTable
          rows={[
            {
              name: 'color',
              type: 'string',
              defaultValue: "'#e3e4e6'",
              description:
                'Aluminum finish. Try Sky Blue #aec6d9, Starlight #e8e0d4, Midnight #2e3642.',
            },
            {
              name: 'notch',
              type: 'boolean',
              defaultValue: 'true',
              description: 'Camera-notch overlay at the top of the display.',
            },
            {
              name: 'openAngle',
              type: 'number',
              defaultValue: '110',
              description: 'Lid angle in degrees between deck and screen (90 = upright).',
            },
            {
              name: 'resolution',
              type: 'number',
              defaultValue: '1280',
              description:
                'Virtual display width; 1280 → 1280×832, exactly the MacBook Air default scaled resolution — desktop breakpoints apply.',
            },
          ]}
        />
      </section>

      <section>
        <h2>Next.js &amp; SSR</h2>
        <p>
          The components ship with a <code>&apos;use client&apos;</code> banner, but WebGL
          itself only exists in the browser. In the App Router, load your mockup with{' '}
          <code>ssr: false</code> from inside a client component:
        </p>
        <CodeBlock title="hero-client.tsx">{ssrSnippet}</CodeBlock>
      </section>

      <section>
        <h2>GPU &amp; performance</h2>
        <ul>
          <li>
            Rendering is WebGL 2 via three.js with{' '}
            <code>powerPreference: &apos;high-performance&apos;</code>, so the browser prefers
            the discrete GPU where available.
          </li>
          <li>
            Screen content is composited by the browser as a CSS 3D layer — text stays vector
            crisp at every angle and zoom, and never burns GPU texture memory.
          </li>
          <li>
            The device is procedural geometry (~a few thousand triangles): no GLB parsing, no
            texture decoding, no network requests. Lighting comes from a tiny env map rendered
            once on the GPU.
          </li>
          <li>
            <code>dpr</code> is clamped to <code>[1, 2]</code> by default; lower the max on
            constrained devices for guaranteed frame rates.
          </li>
        </ul>
      </section>

      <section>
        <h2>Roadmap</h2>
        <ul>
          <li>
            <strong>2D mockups</strong> — CSS/SVG renderers sharing the same device dimensions
            (exported today as <code>PHONE</code>) and the same content API, for zero-WebGL
            contexts like screenshots and emails.
          </li>
          <li>More devices: tablets, laptops, watches.</li>
          <li>Deep-link camera poses and scroll-driven animation helpers.</li>
        </ul>
      </section>
    </div>
  )
}
