'use client'

import {
  BillboardMockup,
  BookMockup,
  BrochureMockup,
  BusinessCardMockup,
  BusMockup,
  IDCardMockup,
  IPhoneMockup,
  LaptopMockup,
  ProductBoxMockup,
  RollupBannerMockup,
  MagazineMockup,
  MonitorMockup,
  PhoneMockup,
  PosterFrameMockup,
  TabletMockup,
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
  CustomBoxMockup,
  CustomPanelMockup,
  MailerBoxMockup,
  PizzaBoxMockup,
  SemiTrailerMockup,
  ShoppingBagMockup,
  StorefrontMockup,
  TVSetMockup,
  VinylRecordMockup,
} from 'area-mockups'
import {
  ArrivalsBoardArt,
  BadgeBackArt,
  BadgeFrontArt,
  BagArt,
  BannerArt,
  BoxLidArt,
  BoxPanelArt,
  PizzaBevelArt,
  PizzaFrontArt,
  PizzaInsideArt,
  PizzaLidArt,
  StorePosterArt,
  StoreSignArt,
  TrailerWrapArt,
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
  TrailerRearArt,
  VanLiveryArt,
  VanRearArt,
} from '../screens/print-art'
import { MusicPlayer } from '../screens/music-player'
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

      <DemoCard
        title="Galaxy S25"
        description={
          <>
            <code>variant=&quot;s25&quot;</code> in Navy: the 6.2″ baseline model with its
            device-accurate 360×780 virtual screen.
          </>
        }
      >
        <PhoneMockup variant="s25" color="#1b2a41" frameColor="#44506b" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy S25+"
        description={
          <>
            <code>variant=&quot;s25plus&quot;</code> in Icyblue — same camera architecture,
            larger 6.7″ body at true relative size.
          </>
        }
      >
        <PhoneMockup variant="s25plus" color="#bcd3e8" frameColor="#9fb4c9" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy S25 Ultra"
        description={
          <>
            <code>variant=&quot;s25ultra&quot;</code> in Titanium Black: squared corners,
            the quad-camera cluster, and a 384×832 virtual screen.
          </>
        }
      >
        <PhoneMockup variant="s25ultra" color="#2e3238" frameColor="#565b64" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy S25 Edge"
        description={
          <>
            <code>variant=&quot;s25edge&quot;</code> in Titanium Silver — the 5.8 mm-thin
            model with its dual camera.
          </>
        }
      >
        <PhoneMockup variant="s25edge" color="#c8cdd4" frameColor="#aab0b9" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </PhoneMockup>
      </DemoCard>

      <DemoCard
        title="iPhone 17"
        description={
          <>
            <code>&lt;IPhoneMockup&gt;</code> in Lavender: Dynamic Island, the dual-camera
            plateau, and a true 402×874 virtual screen.
          </>
        }
      >
        <IPhoneMockup variant="17" color="#cfc4e6" frameColor="#b9aed3" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </IPhoneMockup>
      </DemoCard>

      <DemoCard
        title="iPhone 17 Air"
        description={
          <>
            <code>variant=&quot;air&quot;</code> in Sky Blue — the 5.6 mm-thin model with a
            single camera on the full-width plateau.
          </>
        }
      >
        <IPhoneMockup variant="air" color="#bfd4e6" frameColor="#a9c0d4" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </IPhoneMockup>
      </DemoCard>

      <DemoCard
        title="iPhone 17 Pro"
        description={
          <>
            <code>variant=&quot;pro&quot;</code> in Cosmic Orange: the triple-camera
            plateau across the full back.
          </>
        }
      >
        <IPhoneMockup variant="pro" color="#c96b34" frameColor="#b25c2a" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </IPhoneMockup>
      </DemoCard>

      <DemoCard
        title="iPhone 17 Pro Max"
        description={
          <>
            <code>variant=&quot;promax&quot;</code> in Deep Blue — the biggest body in the
            family, with a 440×956 virtual screen.
          </>
        }
      >
        <IPhoneMockup variant="promax" color="#2b3a55" frameColor="#3d4d6b" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <MusicPlayer />
        </IPhoneMockup>
      </DemoCard>

      <DemoCard
        title="iPad Pro 13″ (M5)"
        description={
          <>
            <code>&lt;TabletMockup&gt;</code> in Space Black, landscape — the pencil mount
            and camera pod follow the orientation, and the virtual screen is a true
            1376×1032.
          </>
        }
      >
        <TabletMockup variant="ipadpro13" orientation="landscape" color="#3a3c40" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <DesktopScreen />
        </TabletMockup>
      </DemoCard>

      <DemoCard
        title="iPad Pro 11″ (M5)"
        description={
          <>
            <code>variant=&quot;ipadpro11&quot;</code> in Silver, portrait — same design
            language at the smaller true relative size.
          </>
        }
      >
        <TabletMockup variant="ipadpro11" color="#e3e4e6" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <DesktopScreen />
        </TabletMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy Tab S11"
        description={
          <>
            <code>variant=&quot;tabs11&quot;</code> in Gray, portrait — the Samsung camera
            pod and magnetic S Pen strip on the back.
          </>
        }
      >
        <TabletMockup variant="tabs11" color="#4b4f56" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <DesktopScreen />
        </TabletMockup>
      </DemoCard>

      <DemoCard
        title="Galaxy Tab S11 Ultra"
        description={
          <>
            <code>variant=&quot;tabs11ultra&quot;</code> in Graphite, landscape — the 14.6″
            panel with its display notch modeled.
          </>
        }
      >
        <TabletMockup variant="tabs11ultra" orientation="landscape" color="#2e3136" deviceProps={{ rotation: [0, -0.3, 0] }}>
          <DesktopScreen />
        </TabletMockup>
      </DemoCard>

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
          backPanels={[<BrochureVisitArt key="f" />, <BrochureFrontArt key="t" />, <BrochureTrailsArt key="v" />]}
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
        <BusMockup
          destinationSign={<DestinationArt />}
          streetSideAd={<BusAdArt />}
          rearAd={<BusAdArt />}
          deviceProps={{ rotation: [0, -0.4, 0] }}
        >
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
        <ProductBoxMockup
          side={<BoxSideArt />}
          top={<BoxTopArt />}
          back={<BoxFrontArt />}
          deviceProps={{ rotation: [0, -0.5, 0] }}
        >
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
        <VanMockup streetSide={<VanLiveryArt />} rear={<VanRearArt />} deviceProps={{ rotation: [0, -0.5, 0] }}>
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
        <BusShelterMockup inner={<PosterArt />} arrivals={<ArrivalsBoardArt />} deviceProps={{ rotation: [0, -0.55, 0] }}>
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
        <GreetingCardMockup
          float
          insideLeft={<GreetingInsideArt />}
          insideRight={<GreetingInsideArt />}
          backCover={<GreetingInsideArt />}
          deviceProps={{ rotation: [0, -0.82, 0] }}
        >
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
        <VinylRecordMockup label={<VinylLabelArt />} back={<VinylCoverArt />} deviceProps={{ rotation: [0, -0.2, 0] }}>
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
        <DOOHTotemMockup back={<BannerArt />} deviceProps={{ rotation: [0, -0.18, 0] }}>
          <BannerArt />
        </DOOHTotemMockup>
      </DemoCard>

      <DemoCard
        title="Storefront"
        description={
          <>
            <code>&lt;StorefrontMockup&gt;</code>: a high-street shop façade — the fascia
            sign and the poster in the display window are both live DOM.
          </>
        }
      >
        <StorefrontMockup windowPoster={<StorePosterArt />} deviceProps={{ rotation: [0, -0.25, 0] }}>
          <StoreSignArt />
        </StorefrontMockup>
      </DemoCard>

      <DemoCard
        title="53 ft semi trailer"
        description={
          <>
            <code>&lt;SemiTrailerMockup&gt;</code>: a dry van parked on its landing gear.
            Both 53-foot sides and the rear doors take live wraps.
          </>
        }
      >
        <SemiTrailerMockup streetSide={<TrailerWrapArt />} rear={<TrailerRearArt />} deviceProps={{ rotation: [0, -0.35, 0] }}>
          <TrailerWrapArt />
        </SemiTrailerMockup>
      </DemoCard>

      <DemoCard
        title="Mailer box"
        description={
          <>
            <code>&lt;MailerBoxMockup&gt;</code>: a corrugated shipper with printed top and
            front panels — the packing tape rides over your print.
          </>
        }
      >
        <MailerBoxMockup front={<BoxPanelArt />} side={<BoxPanelArt />} deviceProps={{ rotation: [0, 0.5, 0] }}>
          <BoxLidArt />
        </MailerBoxMockup>
      </DemoCard>

      <DemoCard
        title="Shopping bag"
        description={
          <>
            <code>&lt;ShoppingBagMockup&gt;</code>: a kraft carrier with rope handles and a
            fold-over cuff — front and back faces are live print areas.
          </>
        }
      >
        <ShoppingBagMockup back={<BagArt />} deviceProps={{ rotation: [0, 0.35, 0] }}>
          <BagArt />
        </ShoppingBagMockup>
      </DemoCard>

      <DemoCard
        title="Pizza box"
        description={
          <>
            <code>&lt;PizzaBoxMockup&gt;</code> with <code>open</code>: lid top, front flap
            and inside-lid coupon are all live — and the pizza is procedural geometry.
          </>
        }
      >
        <PizzaBoxMockup open bevel={<PizzaBevelArt />} front={<PizzaFrontArt />} insideLid={<PizzaInsideArt />} deviceProps={{ rotation: [0, -0.25, 0] }}>
          <PizzaLidArt />
        </PizzaBoxMockup>
      </DemoCard>

      <DemoCard
        title="Custom panel — any size"
        description={
          <>
            <code>&lt;CustomPanelMockup&gt;</code>: pass real millimeters via{' '}
            <code>size</code> and get a live rectangular sheet at true proportions —
            here a 600×900 mm board.
          </>
        }
      >
        <CustomPanelMockup size={{ width: 600, height: 900, thickness: 5 }} back={<PosterArt />} deviceProps={{ rotation: [0, 0.25, 0] }}>
          <PosterArt />
        </CustomPanelMockup>
      </DemoCard>

      <DemoCard
        title="Custom box — any size"
        description={
          <>
            <code>&lt;CustomBoxMockup&gt;</code>: a 240×320×80 mm box with all six faces
            printable at one shared dpi.
          </>
        }
      >
        <CustomBoxMockup
          size={{ width: 240, height: 320, depth: 80 }}
          back={<BoxFrontArt />}
          left={<BoxSideArt />}
          right={<BoxSideArt />}
          top={<BoxTopArt />}
          deviceProps={{ rotation: [0, -0.45, 0] }}
        >
          <BoxFrontArt />
        </CustomBoxMockup>
      </DemoCard>

      <DemoCard
        title="Pinch & scroll zoom"
        description={
          <>
            <code>zoom</code>: pinch on touch, scroll wheel on desktop, and the overlay
            +/− buttons — clamped to the same range as the orbit controls.
          </>
        }
      >
        <BookMockup zoom float color="#4a2c3f" deviceProps={{ rotation: [0, 0.35, 0] }}>
          <BookCoverArt />
        </BookMockup>
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
