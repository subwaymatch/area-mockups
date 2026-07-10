'use client'

import {
  BillboardMockup,
  BookMockup,
  BrochureMockup,
  BusinessCardMockup,
  BusMockup,
  IDCardMockup,
  LaptopMockup,
  ProductBoxMockup,
  RollupBannerMockup,
  MagazineMockup,
  MonitorMockup,
  PhoneMockup,
  PosterFrameMockup,
  VanMockup,
  WatchMockup,
} from 'area-mockups'
import { TapCounter } from '../screens/tap-counter'
import { LockScreen } from '../screens/lock-screen'
import { DesktopScreen } from '../screens/desktop-screen'
import { GalaxyWatchFace, WatchFace } from '../screens/watch-face'
import {
  AFrameSignMockup,
  BusShelterMockup,
  DOOHTotemMockup,
  GreetingCardMockup,
  TVSetMockup,
  VinylRecordMockup,
} from 'area-mockups'
import {
  BadgeBackArt,
  BadgeFrontArt,
  BannerArt,
  BillboardAdArt,
  BookCoverArt,
  BoxFrontArt,
  BoxSideArt,
  BoxTopArt,
  BusAdArt,
  ChalkMenuArt,
  DestinationArt,
  GreetingCoverArt,
  GreetingInsideArt,
  TVShowArt,
  VinylCoverArt,
  VinylLabelArt,
  BrochureFrontArt,
  BrochureTrailsArt,
  BrochureVisitArt,
  CardBackArt,
  CardFrontArt,
  MagazineCoverArt,
  PosterArt,
  VanLiveryArt,
} from '../screens/print-art'
import { VariantExplorer } from './variant-explorer'
import { TabletExplorer } from './tablet-explorer'
import { LazyScene } from '../lazy-scene'

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
      <div className="mockup-viewport demo-viewport">
        <LazyScene>{children}</LazyScene>
      </div>
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
            Plain React state on the 3D screen, and the button below really clicks. Drag anywhere,
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
            An <code>&lt;iframe&gt;</code> pointed at <code>/embedded</code>, a real route of
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
            <code>&lt;LaptopMockup&gt;</code>: a procedural MacBook Air-style laptop in Sky
            Blue. The desktop is live DOM too: click the window, drag to orbit.
          </>
        }
      >
        <LaptopMockup color="#aec6d9" deviceProps={{ rotation: [0, -0.35, 0] }}>
          <DesktopScreen />
        </LaptopMockup>
      </DemoCard>

      <article className="demo-card">
        <VariantExplorer />
        <h3>Every variant, one prop</h3>
        <p>
          The full Galaxy S25 and iPhone 17 families: true relative sizes, per-model camera
          architecture, and <code>orientation=&quot;landscape&quot;</code> with a
          device-accurate virtual resolution (e.g. 780×360 on the S25, 874×402 on the 17).
        </p>
      </article>

      <article className="demo-card">
        <TabletExplorer />
        <h3>Tablets, both families</h3>
        <p>
          <code>&lt;TabletMockup&gt;</code>: iPad Pro 13″/11″ (M5) and Galaxy Tab S11 /
          S11 Ultra at true relative sizes, with per-family camera pods, stylus mounts and
          the Ultra&apos;s display notch. Orientation swaps the exact logical resolution.
        </p>
      </article>

      <DemoCard
        title="Studio Display"
        description={
          <>
            <code>&lt;MonitorMockup&gt;</code>: the 27″ 5K panel on its tilt stand with a
            2560×1440 virtual screen (and, faithfully, no power button).
          </>
        }
      >
        <MonitorMockup deviceProps={{ rotation: [0, -0.25, 0] }}>
          <DesktopScreen />
        </MonitorMockup>
      </DemoCard>

      <DemoCard
        title="Apple Watch Series 11"
        description={
          <>
            <code>&lt;WatchMockup&gt;</code>: squircle case, Digital Crown, a full Sport
            Band loop worn on an invisible wrist, and a live 208×248 face. The
            complication really taps.
          </>
        }
      >
        <WatchMockup float color="#1c1d21" bandColor="#33415c" deviceProps={{ rotation: [0, -0.35, 0] }}>
          <WatchFace />
        </WatchMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy Watch 8"
        description={
          <>
            <code>variant=&quot;watch8&quot;</code>: the cushion case with a fully round
            1.47″ display — a live circular 240×240 face — two flat keys, and the
            Dynamic Lug band.
          </>
        }
      >
        <WatchMockup
          variant="watch8"
          float
          color="#33363c"
          bandColor="#23252a"
          deviceProps={{ rotation: [0, 0.3, 0] }}
        >
          <GalaxyWatchFace />
        </WatchMockup>
      </DemoCard>

      <DemoCard
        title="Hardcover book"
        description={
          <>
            <code>&lt;BookMockup&gt;</code>: a 156×234 mm trade hardcover — cloth boards,
            rounded spine, cream page block — with the whole jacket as live DOM.
          </>
        }
      >
        <BookMockup float color="#16324a" deviceProps={{ rotation: [0, 0.35, 0] }}>
          <BookCoverArt />
        </BookMockup>
      </DemoCard>

      <DemoCard
        title="Magazine cover"
        description={
          <>
            <code>&lt;MagazineMockup&gt;</code>: a perfect-bound letter-trim monthly. The
            cover is a 480×620 virtual page, so real editorial CSS just works.
          </>
        }
      >
        <MagazineMockup float deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MagazineCoverArt />
        </MagazineMockup>
      </DemoCard>

      <DemoCard
        title="Tri-fold brochure"
        description={
          <>
            <code>&lt;BrochureMockup&gt;</code>: three letter-fold panels standing in a
            zig-zag, each its own live surface via <code>panels=&#123;[…]&#125;</code>.
          </>
        }
      >
        <BrochureMockup
          panels={[<BrochureFrontArt key="f" />, <BrochureTrailsArt key="t" />, <BrochureVisitArt key="v" />]}
          deviceProps={{ rotation: [0, -0.12, 0] }}
        />
      </DemoCard>

      <DemoCard
        title="Business card, both sides"
        description={
          <>
            <code>&lt;BusinessCardMockup&gt;</code>: 32 pt stock with rounded die-cut
            corners. Drag it around — the <code>back</code> prop prints the reverse.
          </>
        }
      >
        <BusinessCardMockup float back={<CardBackArt />} deviceProps={{ rotation: [-0.1, -0.35, 0] }}>
          <CardFrontArt />
        </BusinessCardMockup>
      </DemoCard>

      <DemoCard
        title="ID badge on a lanyard"
        description={
          <>
            <code>&lt;IDCardMockup&gt;</code>: a CR80 badge with a real punched slot, snap
            hook, and hanging lanyard. The <code>back</code> face is live too.
          </>
        }
      >
        <IDCardMockup float back={<BadgeBackArt />} deviceProps={{ rotation: [0, -0.25, 0.04] }}>
          <BadgeFrontArt />
        </IDCardMockup>
      </DemoCard>

      <DemoCard
        title="Poster frame"
        description={
          <>
            <code>&lt;PosterFrameMockup&gt;</code>: an 18″×24″ sheet recessed in a gallery
            molding with a true through-hole and kraft dust cover on the back.
          </>
        }
      >
        <PosterFrameMockup deviceProps={{ rotation: [0, 0.25, 0] }}>
          <PosterArt />
        </PosterFrameMockup>
      </DemoCard>

      <DemoCard
        title="Highway billboard"
        description={
          <>
            <code>&lt;BillboardMockup&gt;</code>: the classic 14′×48′ bulletin on a
            monopole — catwalk, railing, gooseneck floodlights — grounded like a monitor.
          </>
        }
      >
        <BillboardMockup deviceProps={{ rotation: [0, -0.18, 0] }}>
          <BillboardAdArt />
        </BillboardMockup>
      </DemoCard>

      <DemoCard
        title="City transit bus"
        description={
          <>
            <code>&lt;BusMockup&gt;</code>: a 40′ low-floor transit bus with a live king-size
            (30″×144″) ad panel — and the LED destination sign is live DOM too.
          </>
        }
      >
        <BusMockup destinationSign={<DestinationArt />} deviceProps={{ rotation: [0, -0.4, 0] }}>
          <BusAdArt />
        </BusMockup>
      </DemoCard>

      <DemoCard
        title="Product box"
        description={
          <>
            <code>&lt;ProductBoxMockup&gt;</code>: a retail carton with live front, side and
            top panels sharing one dpi — three printed faces in a single 3/4 pose.
          </>
        }
      >
        <ProductBoxMockup side={<BoxSideArt />} top={<BoxTopArt />} deviceProps={{ rotation: [0, -0.5, 0] }}>
          <BoxFrontArt />
        </ProductBoxMockup>
      </DemoCard>

      <DemoCard
        title="Roll-up banner"
        description={
          <>
            <code>&lt;RollupBannerMockup&gt;</code>: the 850×2000 trade-show stand — cassette
            base, swivel feet, top rail — with a live 420×988 graphic.
          </>
        }
      >
        <RollupBannerMockup deviceProps={{ rotation: [0, 0.18, 0] }}>
          <BannerArt />
        </RollupBannerMockup>
      </DemoCard>

      <DemoCard
        title="Vehicle wrap"
        description={
          <>
            <code>&lt;VanMockup&gt;</code>: a procedural cargo van with a live vinyl-wrap
            panel on the cargo side — design a fleet livery in plain CSS.
          </>
        }
      >
        <VanMockup deviceProps={{ rotation: [0, -0.5, 0] }}>
          <VanLiveryArt />
        </VanMockup>
      </DemoCard>

      <DemoCard
        title="Bus shelter 6-sheet"
        description={
          <>
            <code>&lt;BusShelterMockup&gt;</code>: a glass transit shelter whose backlit
            6-sheet lightbox holds a live 480×709 poster on both faces.
          </>
        }
      >
        <BusShelterMockup deviceProps={{ rotation: [0, -0.55, 0] }}>
          <PosterArt />
        </BusShelterMockup>
      </DemoCard>

      <DemoCard
        title="Greeting card"
        description={
          <>
            <code>&lt;GreetingCardMockup&gt;</code>: a folded A7 card standing like a tent
            — cover, back and the inside spread are all live faces.
          </>
        }
      >
        <GreetingCardMockup float insideLeft={<GreetingInsideArt />} insideRight={<GreetingInsideArt />} deviceProps={{ rotation: [0, -0.82, 0] }}>
          <GreetingCoverArt />
        </GreetingCardMockup>
      </DemoCard>

      <DemoCard
        title="Vinyl record"
        description={
          <>
            <code>&lt;VinylRecordMockup&gt;</code>: a 12″ LP half-out of its jacket. The
            cover is live DOM — and so is the circular center label.
          </>
        }
      >
        <VinylRecordMockup label={<VinylLabelArt />} deviceProps={{ rotation: [0, -0.2, 0] }}>
          <VinylCoverArt />
        </VinylRecordMockup>
      </DemoCard>

      <DemoCard
        title="65″ TV"
        description={
          <>
            <code>&lt;TVSetMockup&gt;</code>: a near-bezel-less 65″ panel on blade feet
            with a live 1920×1080 screen — desktop layouts and video apply directly.
          </>
        }
      >
        <TVSetMockup deviceProps={{ rotation: [0, -0.22, 0] }}>
          <TVShowArt />
        </TVSetMockup>
      </DemoCard>

      <DemoCard
        title="A-frame sign"
        description={
          <>
            <code>&lt;AFrameSignMockup&gt;</code>: the sidewalk sandwich board, legs
            splayed like the real thing — both chalkboard panels are live.
          </>
        }
      >
        <AFrameSignMockup back={<ChalkMenuArt />} deviceProps={{ rotation: [0, -0.3, 0] }}>
          <ChalkMenuArt />
        </AFrameSignMockup>
      </DemoCard>

      <DemoCard
        title="DOOH totem"
        description={
          <>
            <code>&lt;DOOHTotemMockup&gt;</code>: a digital street totem with a live
            portrait 540×960 display — the digital sibling of the billboard.
          </>
        }
      >
        <DOOHTotemMockup deviceProps={{ rotation: [0, -0.18, 0] }}>
          <BannerArt />
        </DOOHTotemMockup>
      </DemoCard>

      <DemoCard
        title="Transparent background"
        description={
          <>
            The WebGL canvas is transparent by default (alpha context, no scene background), so
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
