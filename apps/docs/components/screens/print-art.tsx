'use client'

/**
 * Full-bleed artwork for the object mockups (book, magazine, brochure, card,
 * poster, billboard, van). Self-contained inline styles so the demos don't
 * lean on page CSS — each component fills its live surface with width/height
 * 100%.
 */

const serif = 'Georgia, "Times New Roman", serif'

/** Hardcover novel jacket. */
export function BookCoverArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 28,
        background: 'linear-gradient(160deg, #16324a 0%, #0d1f30 55%, #0a1622 100%)',
        color: '#e8dcc0',
        fontFamily: serif,
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
      }}
    >
      <div style={{ border: '1px solid #b89b5e', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '36px 20px 28px' }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: '#b89b5e' }}>A NOVEL</div>
        <h1 style={{ fontSize: 44, lineHeight: 1.15, fontWeight: 500, margin: '26px 0 0' }}>
          The Atlas of Quiet Places
        </h1>
        <svg width="86" height="86" viewBox="0 0 86 86" style={{ margin: 'auto 0' }} aria-hidden>
          <circle cx="43" cy="43" r="34" fill="none" stroke="#b89b5e" strokeWidth="1.5" />
          <path d="M43 13v60M13 43h60M22 22l42 42M64 22L22 64" stroke="#b89b5e" strokeWidth="0.8" />
          <circle cx="43" cy="43" r="5" fill="#b89b5e" />
        </svg>
        <div style={{ fontSize: 15, letterSpacing: 5 }}>MIRA HALVORSEN</div>
      </div>
    </div>
  )
}

/** Glossy monthly cover. */
export function MagazineCoverArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 24,
        background: 'radial-gradient(120% 90% at 80% 20%, #ff7a3c 0%, #e6453a 40%, #8f1d4e 100%)',
        color: '#fff7ef',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg viewBox="0 0 100 100" aria-hidden style={{ position: 'absolute', right: -60, bottom: -40, width: 300, height: 300, opacity: 0.35 }}>
        <circle cx="50" cy="50" r="46" fill="none" stroke="#ffd9a8" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="#ffd9a8" strokeWidth="0.7" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="#ffd9a8" strokeWidth="0.7" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>AREA</div>
        <div style={{ fontSize: 12, letterSpacing: 2 }}>NO. 07 — JUL 2026</div>
      </div>
      <div style={{ fontSize: 13, letterSpacing: 3, marginTop: -6 }}>THE DESIGN QUARTERLY</div>
      <div style={{ marginTop: 'auto', display: 'grid', gap: 10, maxWidth: '70%' }}>
        <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>Print is a live surface now</div>
        <div style={{ fontSize: 14, opacity: 0.9 }}>Mockups that click · 3D on the newsstand · 24 pages of type</div>
      </div>
    </div>
  )
}

/** Tri-fold panel 1 — the front. */
export function BrochureFrontArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 22,
        background: 'linear-gradient(180deg, #1d4433 0%, #143126 70%, #0e241c 100%)',
        color: '#f0ead6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 3 }}>RIDGELINE NATIONAL PARK</div>
      <svg viewBox="0 0 100 44" aria-hidden style={{ width: '100%', marginTop: 'auto' }}>
        <path d="M0 40 L22 12 L34 26 L52 4 L70 30 L82 18 L100 40" fill="none" stroke="#e8b64c" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="78" cy="8" r="5" fill="#f0ead6" />
      </svg>
      <h2 style={{ fontSize: 34, lineHeight: 1.05, margin: '14px 0 8px', fontWeight: 700 }}>
        Trail Guide
      </h2>
      <div style={{ fontSize: 12, opacity: 0.85 }}>2026 season · free map inside</div>
    </div>
  )
}

/** Tri-fold panel 2 — the trail list. */
export function BrochureTrailsArt() {
  const trails: [string, string, string][] = [
    ['Larch Loop', '2.4 km', 'easy'],
    ['Mirror Tarn', '5.1 km', 'easy'],
    ['Saddle Pass', '9.8 km', 'moderate'],
    ['The Palisade', '14 km', 'hard'],
    ['Ridgeline Traverse', '22 km', 'hard'],
  ]
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 22,
        background: '#f4efe1',
        color: '#20362c',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 3, color: '#8a6a2f' }}>PICK YOUR DAY</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Five trails, one ridge</div>
      <div style={{ display: 'grid', gap: 8, marginTop: 6 }}>
        {trails.map(([name, dist, grade]) => (
          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, borderBottom: '1px solid #d8cfb4', paddingBottom: 7, fontSize: 12.5 }}>
            <span style={{ fontWeight: 600 }}>{name}</span>
            <span style={{ color: '#6d6650' }}>
              {dist} · {grade}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', fontSize: 11, color: '#6d6650' }}>
        Dogs on leash. Pack out what you pack in.
      </div>
    </div>
  )
}

/** Tri-fold panel 3 — plan your visit. */
export function BrochureVisitArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 22,
        background: '#2a5741',
        color: '#f0ead6',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 3, color: '#e8b64c' }}>PLAN YOUR VISIT</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>Open dawn to dusk, all year</div>
      <svg viewBox="0 0 100 62" aria-hidden style={{ width: '100%', background: '#20452f', borderRadius: 6 }}>
        <path d="M8 52 C 26 44, 30 20, 52 18 S 88 28, 94 10" fill="none" stroke="#e8b64c" strokeWidth="1.6" strokeDasharray="4 3" />
        <circle cx="8" cy="52" r="3" fill="#f0ead6" />
        <circle cx="94" cy="10" r="3" fill="#f0ead6" />
        <text x="13" y="57" fontSize="6" fill="#f0ead6">visitor center</text>
        <text x="58" y="12" fontSize="6" fill="#f0ead6">summit</text>
      </svg>
      <div style={{ marginTop: 'auto', display: 'grid', gap: 4, fontSize: 12 }}>
        <div>ridgeline.example/visit</div>
        <div>+1 (555) 010-4426</div>
        <div>14 Basin Rd, Larchmont</div>
      </div>
    </div>
  )
}

/** Business card front. */
export function CardFrontArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '26px 30px',
        background: '#fdfcf9',
        color: '#191d24',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ width: 44, height: 6, background: '#e6453a', borderRadius: 3 }} />
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>Yuna Park</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>Product Designer · Area Studio</div>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: '#6b7280', marginTop: 14 }}>
        <span>yuna@area.studio</span>
        <span>+82 10-0100-2244</span>
      </div>
    </div>
  )
}

/** Business card back. */
export function CardBackArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: '#191d24',
        color: '#fdfcf9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: '#e6453a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 800,
        }}
      >
        A
      </div>
      <div style={{ fontSize: 12, letterSpacing: 3, color: '#9aa1ab' }}>AREA.STUDIO</div>
    </div>
  )
}

/** 18x24 gig poster. */
export function PosterArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 30,
        background: 'linear-gradient(200deg, #f5e9d4 0%, #f2ddb8 100%)',
        color: '#1c1a16',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 4 }}>LIVE AT THE FOUNDRY</div>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 0.94, letterSpacing: -3, marginTop: 18 }}>
        SIGNAL
        <br />
        <span style={{ color: '#d1461f' }}>/ NOISE</span>
      </div>
      <svg viewBox="0 0 100 26" aria-hidden style={{ width: '100%', marginTop: 'auto' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <rect key={i} x={i * 2.5} y={13 - Math.abs(Math.sin(i * 0.55)) * 11} width={1.4} height={Math.abs(Math.sin(i * 0.55)) * 22 + 2} fill="#1c1a16" />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginTop: 16 }}>
        <span>SAT AUG 22 · 9PM</span>
        <span>DOORS 8PM · ALL AGES</span>
      </div>
    </div>
  )
}

/** 14x48 bulletin creative — one message, big type. */
export function BillboardAdArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '0 48px',
        background: '#0e1b2e',
        color: '#f4f7fb',
        display: 'flex',
        alignItems: 'center',
        gap: 40,
      }}
    >
      <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.02, flex: 1 }}>
        Ship mockups, <span style={{ color: '#5ad0a6' }}>not screenshots.</span>
      </div>
      <div
        style={{
          background: '#5ad0a6',
          color: '#0e1b2e',
          fontSize: 24,
          fontWeight: 700,
          padding: '16px 28px',
          borderRadius: 999,
          whiteSpace: 'nowrap',
        }}
      >
        area-mockups
      </div>
    </div>
  )
}

/** Cargo-van wrap livery. */
export function VanLiveryArt() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        background: '#ffffff',
        color: '#173229',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 44px',
      }}
    >
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <polygon points="62,0 100,0 100,40 78,40" fill="#2a8f68" />
        <polygon points="74,0 84,0 62,40 52,40" fill="#7fd6b2" />
      </svg>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
          BLOOM<span style={{ color: '#2a8f68' }}>&amp;CO.</span>
        </div>
        <div style={{ fontSize: 16, letterSpacing: 4, marginTop: 2 }}>SAME-DAY FLOWER DELIVERY</div>
        <div style={{ display: 'flex', gap: 22, fontSize: 15, fontWeight: 600, marginTop: 16 }}>
          <span>bloomand.co</span>
          <span>(555) 010-7788</span>
        </div>
      </div>
    </div>
  )
}
