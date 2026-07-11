'use client'

import {
  AFrameSignMockup,
  Billboard,
  BillboardMockup,
  Book,
  BookMockup,
  BrochureMockup,
  BusinessCard,
  BusinessCardMockup,
  BusMockup,
  BusShelterMockup,
  CustomBoxMockup,
  CustomPanelMockup,
  DOOHTotemMockup,
  GreetingCardMockup,
  IDCardMockup,
  IPhone,
  IPhoneMockup,
  LaptopMockup,
  MagazineMockup,
  MailerBoxMockup,
  MockupCanvas,
  MonitorMockup,
  Phone,
  PhoneMockup,
  PizzaBoxMockup,
  PosterFrame,
  PosterFrameMockup,
  ProductBoxMockup,
  RollupBanner,
  RollupBannerMockup,
  SemiTrailerMockup,
  ShoppingBagMockup,
  StorefrontMockup,
  TabletMockup,
  TVSetMockup,
  VanMockup,
  VinylRecord,
  VinylRecordMockup,
  WatchMockup,
} from 'area-mockups'
import { LazyScene } from './lazy-scene'
import {
  ArrivalsBoardArt,
  BadgeBackArt,
  BadgeFrontArt,
  BagArt,
  BannerArt,
  BillboardAdArt,
  BookCoverArt,
  BoxFrontArt,
  BoxLidArt,
  BoxPanelArt,
  BoxSideArt,
  BoxTopArt,
  BrochureFrontArt,
  BrochureTrailsArt,
  BrochureVisitArt,
  BusAdArt,
  CardBackArt,
  ChalkMenuArt,
  CardFrontArt,
  DestinationArt,
  GreetingCoverArt,
  GreetingInsideArt,
  MagazineCoverArt,
  PizzaBevelArt,
  PizzaFrontArt,
  PizzaInsideArt,
  PizzaLidArt,
  PosterArt,
  StorePosterArt,
  StoreSignArt,
  TrailerRearArt,
  TrailerWrapArt,
  TVShowArt,
  VanLiveryArt,
  VanRearArt,
  VinylCoverArt,
  VinylLabelArt,
} from './screens/print-art'
import { GalaxyWatchFace, WatchFace } from './screens/watch-face'
import { TapCounter } from './screens/tap-counter'
import { LockScreen } from './screens/lock-screen'
import { DesktopScreen } from './screens/desktop-screen'
import { MusicPlayer } from './screens/music-player'

/**
 * Full-bleed livery for the van's `coverage="full"` demo. The art deliberately
 * runs paint, stripes and type across the whole side elevation so the carved
 * wheel arches, door glass and hardware pockets read instantly.
 */
function FullSideLivery() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(112deg, #0d2823 0%, #175a4a 52%, #2ba584 100%)',
        color: '#eafff7',
        fontFamily: 'inherit',
      }}
    >
      {/* ridgeline sweep crossing the arches and door — carving cuts through it */}
      <svg
        viewBox="0 0 1360 501"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <path d="M0 356 L210 250 L360 322 L540 198 L742 306 L920 172 L1130 288 L1360 190 L1360 501 L0 501 Z" fill="rgba(10, 26, 22, 0.5)" />
        <path d="M0 398 L210 302 L360 366 L540 252 L742 352 L920 226 L1130 334 L1360 240" fill="none" stroke="#7ee0c0" strokeWidth="7" strokeLinejoin="round" />
        <circle cx="1052" cy="96" r="54" fill="#f4c944" />
      </svg>
      <div style={{ position: 'absolute', top: 38, left: 56, fontSize: 68, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
        RIDGELINE TOURS
      </div>
      <div style={{ position: 'absolute', top: 118, left: 58, fontSize: 25, fontWeight: 600, opacity: 0.88 }}>
        Small-group trips into the high country · ridgeline.example
      </div>
    </div>
  )
}

/** Minimal typographic cover for composition demos — one prop, one accent. */
function MiniCover({ title, from, to }: { title: string; from: string; to: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: 20,
        background: `linear-gradient(165deg, ${from}, ${to})`,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 1.1,
      }}
    >
      {title}
    </div>
  )
}

/**
 * Registry of live examples embedded in the docs via `<ObjectDemo demo="…" />`.
 * Every scene is lazy-mounted (see LazyScene) so an example-heavy page never
 * exceeds the browser's WebGL context budget.
 */
const DEMOS: Record<string, React.ReactNode> = {
  // ---- Phone (Galaxy) -----------------------------------------------------
  'phone-basic': (
    <PhoneMockup color="#15171d" frameColor="#4d5260" deviceProps={{ rotation: [0, -0.25, 0] }}>
      <TapCounter />
    </PhoneMockup>
  ),
  'phone-lock': (
    <PhoneMockup autoRotate float color="#d3d6dd" frameColor="#b6bac4" screenBackground="#000">
      <LockScreen />
    </PhoneMockup>
  ),
  'phone-landscape': (
    <PhoneMockup variant="s25ultra" orientation="landscape" color="#2e3238" frameColor="#565b64">
      <MusicPlayer />
    </PhoneMockup>
  ),

  // ---- IPhone ---------------------------------------------------------------
  'iphone-pro': (
    <IPhoneMockup variant="pro" color="#c96b34" frameColor="#b25c2a" deviceProps={{ rotation: [0, 0.25, 0] }}>
      <MusicPlayer />
    </IPhoneMockup>
  ),
  'iphone-air': (
    <IPhoneMockup variant="air" autoRotate float color="#bfd4e6" frameColor="#a9c0d4" screenBackground="#000">
      <LockScreen />
    </IPhoneMockup>
  ),
  'phone-duo': (
    <MockupCanvas camera={{ position: [0, 0.5, 8.6], fov: 40 }} shadowY={-2.35}>
      <Phone variant="s25ultra" color="#2e3238" frameColor="#565b64" position={[-1.6, 0, -0.2]} rotation={[0, 0.3, 0]}>
        <TapCounter />
      </Phone>
      <IPhone variant="promax" color="#2b3a55" frameColor="#3d4d6b" position={[1.6, 0, 0]} rotation={[0, -0.3, 0]}>
        <MusicPlayer />
      </IPhone>
    </MockupCanvas>
  ),

  // ---- Laptop -----------------------------------------------------------------
  'laptop-basic': (
    <LaptopMockup color="#aec6d9" deviceProps={{ rotation: [0, -0.35, 0] }}>
      <DesktopScreen />
    </LaptopMockup>
  ),
  'laptop-midnight': (
    <LaptopMockup color="#2e3642" openAngle={100} float deviceProps={{ rotation: [0, 0.3, 0] }}>
      <DesktopScreen />
    </LaptopMockup>
  ),

  // ---- Tablet -------------------------------------------------------------------
  'tablet-landscape': (
    <TabletMockup orientation="landscape" deviceProps={{ rotation: [0, -0.3, 0] }}>
      <DesktopScreen />
    </TabletMockup>
  ),
  'tablet-ultra': (
    <TabletMockup variant="tabs11ultra" color="#2e3136" float deviceProps={{ rotation: [0, 0.3, 0] }}>
      <MusicPlayer />
    </TabletMockup>
  ),

  // ---- Monitor --------------------------------------------------------------------
  'monitor-basic': (
    <MonitorMockup deviceProps={{ rotation: [0, -0.25, 0] }}>
      <DesktopScreen />
    </MonitorMockup>
  ),
  'monitor-silver': (
    <MonitorMockup color="#e2e4e8" autoRotate autoRotateSpeed={0.8}>
      <DesktopScreen />
    </MonitorMockup>
  ),

  // ---- Book -------------------------------------------------------------
  'book-basic': (
    <BookMockup color="#16324a" deviceProps={{ rotation: [0, 0.35, 0] }}>
      <BookCoverArt />
    </BookMockup>
  ),
  'book-float': (
    <BookMockup color="#3d2352" pageColor="#efe8db" autoRotate float>
      <MiniCover title="Night Signals" from="#5b3a80" to="#241536" />
    </BookMockup>
  ),
  'book-row': (
    <MockupCanvas camera={{ position: [0, 0.4, 9.4], fov: 40 }} shadowY={-2.2}>
      <Book color="#16324a" position={[-3, 0, -0.4]} rotation={[0, 0.5, 0]}>
        <MiniCover title="Atlas I" from="#2c4a68" to="#12222f" />
      </Book>
      <Book color="#5e2431" position={[0, 0, 0]} rotation={[0, 0.15, 0]}>
        <MiniCover title="Atlas II" from="#8a3547" to="#3c1219" />
      </Book>
      <Book color="#274233" position={[3, 0, -0.4]} rotation={[0, -0.35, 0]}>
        <MiniCover title="Atlas III" from="#3f6b52" to="#152820" />
      </Book>
    </MockupCanvas>
  ),

  // ---- Magazine ----------------------------------------------------------
  'magazine-basic': (
    <MagazineMockup deviceProps={{ rotation: [0, -0.3, 0] }}>
      <MagazineCoverArt />
    </MagazineMockup>
  ),
  'magazine-stock': (
    <MagazineMockup pageColor="#efeadd" backColor="#101319" float deviceProps={{ rotation: [0, 0.3, 0] }}>
      <MiniCover title="Monochrome, issue 12" from="#20242c" to="#0b0d12" />
    </MagazineMockup>
  ),

  // ---- Brochure ----------------------------------------------------------
  'brochure-panels': (
    <BrochureMockup
      panels={[<BrochureFrontArt key="f" />, <BrochureTrailsArt key="t" />, <BrochureVisitArt key="v" />]}
      deviceProps={{ rotation: [0, -0.12, 0] }}
    />
  ),
  'brochure-flat': (
    <BrochureMockup
      foldAngle={0}
      panels={[<BrochureFrontArt key="f" />, <BrochureTrailsArt key="t" />, <BrochureVisitArt key="v" />]}
    />
  ),
  'brochure-single': (
    <BrochureMockup paperColor="#e9e4d8" float deviceProps={{ rotation: [0, 0.25, 0] }}>
      <BrochureFrontArt />
    </BrochureMockup>
  ),

  // ---- Business card -----------------------------------------------------
  'card-basic': (
    <BusinessCardMockup float deviceProps={{ rotation: [-0.1, -0.35, 0] }}>
      <CardFrontArt />
    </BusinessCardMockup>
  ),
  'card-back': (
    <BusinessCardMockup autoRotate autoRotateSpeed={2} back={<CardBackArt />}>
      <CardFrontArt />
    </BusinessCardMockup>
  ),
  'card-pair': (
    <MockupCanvas camera={{ position: [0, 0.2, 6.4], fov: 40 }} shadowY={-2.1}>
      <BusinessCard position={[-1.85, 0.9, 0]} rotation={[-0.06, 0.25, 0.03]}>
        <CardFrontArt />
      </BusinessCard>
      <BusinessCard color="#191d24" position={[1.85, -0.9, 0.2]} rotation={[-0.06, -0.3, -0.03]}>
        <CardBackArt />
      </BusinessCard>
    </MockupCanvas>
  ),

  // ---- Poster frame --------------------------------------------------------
  'poster-basic': (
    <PosterFrameMockup deviceProps={{ rotation: [0, 0.25, 0] }}>
      <PosterArt />
    </PosterFrameMockup>
  ),
  'poster-oak': (
    <PosterFrameMockup color="#b98d5f" posterBackground="#f7f2e8" float deviceProps={{ rotation: [0, -0.25, 0] }}>
      <MiniCover title="Form & Counterform" from="#e6dccb" to="#cdbb92" />
    </PosterFrameMockup>
  ),
  'poster-pair': (
    <MockupCanvas camera={{ position: [0, 0.3, 10.4], fov: 40 }} shadowY={-2.5}>
      <PosterFrame position={[-2.15, 0, -0.3]} rotation={[0, 0.35, 0]}>
        <PosterArt />
      </PosterFrame>
      <PosterFrame color="#e8e5dd" position={[2.15, 0, 0]} rotation={[0, -0.25, 0]}>
        <MiniCover title="White Cube" from="#30364a" to="#141824" />
      </PosterFrame>
    </MockupCanvas>
  ),

  // ---- Billboard -----------------------------------------------------------
  'billboard-basic': (
    <BillboardMockup deviceProps={{ rotation: [0, -0.18, 0] }}>
      <BillboardAdArt />
    </BillboardMockup>
  ),
  'billboard-pair': (
    <MockupCanvas camera={{ position: [0, 0.4, 13.4], fov: 40 }} shadowY={-1.5}>
      <group position={[0, 0.6, 0]}>
        <Billboard position={[-3.4, 0, -2.4]} rotation={[0, 0.5, 0]} color="#3a3f49">
          <MiniCover title="Coming soon." from="#233149" to="#101623" />
        </Billboard>
        <Billboard position={[1.6, 0, 0]} rotation={[0, -0.12, 0]}>
          <BillboardAdArt />
        </Billboard>
      </group>
    </MockupCanvas>
  ),

  // ---- Van -------------------------------------------------------------------
  'van-basic': (
    <VanMockup streetSide={<VanLiveryArt />} rear={<VanRearArt />} deviceProps={{ rotation: [0, -0.5, 0] }}>
      <VanLiveryArt />
    </VanMockup>
  ),
  'van-rear': (
    <VanMockup streetSide={<VanLiveryArt />} rear={<VanRearArt />} deviceProps={{ rotation: [0, 2.25, 0] }}>
      <VanLiveryArt />
    </VanMockup>
  ),
  'van-full': (
    <VanMockup
      coverage="full"
      streetSide={<FullSideLivery />}
      rear={<VanRearArt />}
      deviceProps={{ rotation: [0, -0.42, 0] }}
    >
      <FullSideLivery />
    </VanMockup>
  ),
  'van-paint': (
    <VanMockup color="#1d4433" wrapBackground="#1d4433" autoRotate deviceProps={{ rotation: [0, 0.6, 0] }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1d4433',
          color: '#f0ead6',
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        RIDGELINE TOURS
      </div>
    </VanMockup>
  ),

  // ---- ID card ------------------------------------------------------------------
  'idcard-basic': (
    <IDCardMockup float deviceProps={{ rotation: [0, -0.25, 0.04] }}>
      <BadgeFrontArt />
    </IDCardMockup>
  ),
  'idcard-back': (
    <IDCardMockup autoRotate autoRotateSpeed={2} lanyardColor="#1d4ed8" back={<BadgeBackArt />}>
      <BadgeFrontArt />
    </IDCardMockup>
  ),

  // ---- Bus --------------------------------------------------------------------
  'bus-basic': (
    <BusMockup destinationSign={<DestinationArt />} deviceProps={{ rotation: [0, 0.35, 0] }}>
      <BusAdArt />
    </BusMockup>
  ),
  'bus-rear': (
    <BusMockup
      streetSideAd={<BusAdArt />}
      rearAd={<BusAdArt />}
      destinationSign={<DestinationArt />}
      deviceProps={{ rotation: [0, 2.35, 0] }}
    >
      <BusAdArt />
    </BusMockup>
  ),
  'bus-livery': (
    <BusMockup color="#1d4433" adBackground="#f4c534" autoRotate autoRotateSpeed={0.6} destinationSign={<DestinationArt />}>
      <BusAdArt />
    </BusMockup>
  ),

  // ---- Product box ---------------------------------------------------------------
  'box-basic': (
    <ProductBoxMockup side={<BoxSideArt />} top={<BoxTopArt />} deviceProps={{ rotation: [0, -0.5, 0] }}>
      <BoxFrontArt />
    </ProductBoxMockup>
  ),
  'box-kraft': (
    <ProductBoxMockup color="#c9a877" float autoRotate autoRotateSpeed={1.2}>
      <BoxFrontArt />
    </ProductBoxMockup>
  ),

  // ---- Roll-up banner ---------------------------------------------------------------
  'banner-basic': (
    <RollupBannerMockup deviceProps={{ rotation: [0, 0.18, 0] }}>
      <BannerArt />
    </RollupBannerMockup>
  ),
  'banner-pair': (
    <MockupCanvas camera={{ position: [0, 0.4, 9.8], fov: 40 }} shadowY={-2.05}>
      <group position={[0, 0.14, 0]}>
        <RollupBanner position={[-1.55, 0, -0.4]} rotation={[0, 0.3, 0]}>
          <BannerArt />
        </RollupBanner>
        <RollupBanner color="#31343a" position={[1.55, 0, 0]} rotation={[0, -0.15, 0]}>
          <BannerArt />
        </RollupBanner>
      </group>
    </MockupCanvas>
  ),

  // ---- Bus shelter ---------------------------------------------------------------
  'shelter-basic': (
    <BusShelterMockup arrivals={<ArrivalsBoardArt />} deviceProps={{ rotation: [0, -0.55, 0] }}>
      <PosterArt />
    </BusShelterMockup>
  ),
  'shelter-night': (
    <BusShelterMockup color="#22262c" background="#0b0d12" deviceProps={{ rotation: [0, -0.75, 0] }} inner={<PosterArt />} arrivals={<ArrivalsBoardArt />}>
      <PosterArt />
    </BusShelterMockup>
  ),

  // ---- Greeting card ---------------------------------------------------------------
  'greeting-basic': (
    <GreetingCardMockup float deviceProps={{ rotation: [0, -0.82, 0] }}>
      <GreetingCoverArt />
    </GreetingCardMockup>
  ),
  'greeting-inside': (
    <GreetingCardMockup
      autoRotate
      autoRotateSpeed={1.4}
      insideLeft={<GreetingInsideArt />}
      insideRight={<GreetingInsideArt />}
      backCover={<GreetingInsideArt />}
    >
      <GreetingCoverArt />
    </GreetingCardMockup>
  ),

  // ---- Vinyl record ---------------------------------------------------------------
  'vinyl-basic': (
    <VinylRecordMockup label={<VinylLabelArt />} deviceProps={{ rotation: [0, -0.2, 0] }}>
      <VinylCoverArt />
    </VinylRecordMockup>
  ),
  'vinyl-colored': (
    <VinylRecordMockup vinylColor="#7a2337" color="#101725" label={<VinylLabelArt />} float>
      <VinylCoverArt />
    </VinylRecordMockup>
  ),

  // ---- TV ---------------------------------------------------------------------------
  'tv-basic': (
    <TVSetMockup deviceProps={{ rotation: [0, -0.22, 0] }}>
      <TVShowArt />
    </TVSetMockup>
  ),

  // ---- A-frame sign -----------------------------------------------------------------
  'aframe-basic': (
    <AFrameSignMockup deviceProps={{ rotation: [0, -0.3, 0] }}>
      <ChalkMenuArt />
    </AFrameSignMockup>
  ),
  'aframe-back': (
    <AFrameSignMockup autoRotate autoRotateSpeed={1.2} back={<ChalkMenuArt />} color="#31404f" faceBackground="#1c2733">
      <ChalkMenuArt />
    </AFrameSignMockup>
  ),

  // ---- DOOH totem ---------------------------------------------------------------------
  'totem-basic': (
    <DOOHTotemMockup back={<BannerArt />} deviceProps={{ rotation: [0, -0.18, 0] }}>
      <BannerArt />
    </DOOHTotemMockup>
  ),

  // ---- Storefront ---------------------------------------------------------------------
  'storefront-basic': (
    <StorefrontMockup windowPoster={<StorePosterArt />} deviceProps={{ rotation: [0, -0.25, 0] }}>
      <StoreSignArt />
    </StorefrontMockup>
  ),
  'storefront-paint': (
    <StorefrontMockup color="#5c2330" wallColor="#6d6258" windowPoster={<StorePosterArt />} deviceProps={{ rotation: [0, 0.3, 0] }}>
      <StoreSignArt />
    </StorefrontMockup>
  ),

  // ---- Semi trailer ---------------------------------------------------------------------
  'trailer-basic': (
    <SemiTrailerMockup deviceProps={{ rotation: [0, -0.35, 0] }}>
      <TrailerWrapArt />
    </SemiTrailerMockup>
  ),
  'trailer-rear': (
    <SemiTrailerMockup
      autoRotate
      autoRotateSpeed={1.2}
      streetSide={<TrailerWrapArt />}
      rear={<TrailerRearArt />}
    >
      <TrailerWrapArt />
    </SemiTrailerMockup>
  ),

  // ---- Mailer box ---------------------------------------------------------------------
  'mailer-basic': (
    <MailerBoxMockup front={<BoxPanelArt />} deviceProps={{ rotation: [0, 0.5, 0] }}>
      <BoxLidArt />
    </MailerBoxMockup>
  ),
  'mailer-blank': (
    <MailerBoxMockup
      float
      color="#e8e4dd"
      tapeColor="rgba(210, 205, 196, 0.9)"
      camera={{ position: [0, 3.2, 6.6], fov: 40 }}
      deviceProps={{ rotation: [0, -0.4, 0] }}
    />
  ),

  // ---- Shopping bag ---------------------------------------------------------------------
  'bag-basic': (
    <ShoppingBagMockup deviceProps={{ rotation: [0, 0.35, 0] }}>
      <BagArt />
    </ShoppingBagMockup>
  ),
  'bag-dark': (
    <ShoppingBagMockup
      autoRotate
      autoRotateSpeed={1.4}
      color="#1e2126"
      handleColor="#d8d4cc"
      back={<BagArt />}
    >
      <BagArt />
    </ShoppingBagMockup>
  ),

  // ---- MockupCanvas features ------------------------------------------------------------
  'canvas-zoom': (
    <BookMockup zoom float color="#4a2c3f">
      <BookCoverArt />
    </BookMockup>
  ),

  // ---- Custom sizes ---------------------------------------------------------------------
  'custom-panel-basic': (
    <CustomPanelMockup size={{ width: 600, height: 900, thickness: 5 }} deviceProps={{ rotation: [0, 0.25, 0] }}>
      <PosterArt />
    </CustomPanelMockup>
  ),
  'custom-panel-wide': (
    <CustomPanelMockup size={{ width: 2400, height: 800, thickness: 12 }} color="#20242b" float deviceProps={{ rotation: [0, -0.2, 0] }}>
      <TrailerWrapArt />
    </CustomPanelMockup>
  ),
  'custom-box-basic': (
    <CustomBoxMockup
      size={{ width: 240, height: 320, depth: 80 }}
      left={<BoxSideArt />}
      right={<BoxSideArt />}
      top={<BoxTopArt />}
      back={<BoxFrontArt />}
      deviceProps={{ rotation: [0, -0.45, 0] }}
    >
      <BoxFrontArt />
    </CustomBoxMockup>
  ),
  'custom-box-flat': (
    <CustomBoxMockup
      size={{ width: 300, height: 60, depth: 300 }}
      top={<BoxLidArt />}
      camera={{ position: [0, 2.6, 7.0], fov: 40 }}
      deviceProps={{ rotation: [0, 0.4, 0] }}
    >
      <BoxPanelArt />
    </CustomBoxMockup>
  ),

  // ---- Pizza box ---------------------------------------------------------------------
  'pizza-basic': (
    <PizzaBoxMockup bevel={<PizzaBevelArt />} front={<PizzaFrontArt />} deviceProps={{ rotation: [0, 0.35, 0] }}>
      <PizzaLidArt />
    </PizzaBoxMockup>
  ),
  'pizza-open': (
    <PizzaBoxMockup
      open
      bevel={<PizzaBevelArt />}
      front={<PizzaFrontArt />}
      insideLid={<PizzaInsideArt />}
      deviceProps={{ rotation: [0, -0.25, 0] }}
    >
      <PizzaLidArt />
    </PizzaBoxMockup>
  ),

  // ---- Watch ------------------------------------------------------------------
  'watch-band': (
    <WatchMockup float color="#1c1d21" bandColor="#33415c" deviceProps={{ rotation: [0, -0.35, 0] }}>
      <WatchFace />
    </WatchMockup>
  ),
  'watch-galaxy': (
    <WatchMockup variant="watch8" color="#33363c" bandColor="#23252a" float deviceProps={{ rotation: [0, 0.3, 0] }}>
      <GalaxyWatchFace />
    </WatchMockup>
  ),
}

/**
 * A live, draggable mockup embedded in a docs page. `demo` picks a scene from
 * the registry above; the code block next to it in the MDX shows the source.
 * `checker` puts the classic transparency checkerboard behind the scene —
 * used on each page's hero example to show that the canvas is transparent
 * and the mockup composites onto whatever the page puts behind it.
 */
export function ObjectDemo({
  demo,
  height = 440,
  checker = false,
}: {
  demo: string
  height?: number
  checker?: boolean
}) {
  const scene = DEMOS[demo]
  if (!scene) return <p>Unknown demo: {demo}</p>
  return (
    <div className={`object-demo${checker ? ' object-demo--checker' : ''}`} style={{ height }}>
      <LazyScene>{scene}</LazyScene>
    </div>
  )
}
