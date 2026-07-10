'use client'

import {
  Billboard,
  BillboardMockup,
  Book,
  BookMockup,
  BrochureMockup,
  BusinessCard,
  BusinessCardMockup,
  BusMockup,
  IDCardMockup,
  IPhone,
  IPhoneMockup,
  LaptopMockup,
  MagazineMockup,
  MockupCanvas,
  MonitorMockup,
  Phone,
  PhoneMockup,
  PosterFrame,
  PosterFrameMockup,
  ProductBoxMockup,
  RollupBanner,
  RollupBannerMockup,
  TabletMockup,
  VanMockup,
  WatchMockup,
} from 'area-mockups'
import { LazyScene } from './lazy-scene'
import {
  BadgeBackArt,
  BadgeFrontArt,
  BannerArt,
  BillboardAdArt,
  BookCoverArt,
  BoxFrontArt,
  BoxSideArt,
  BoxTopArt,
  BrochureFrontArt,
  BrochureTrailsArt,
  BrochureVisitArt,
  BusAdArt,
  CardBackArt,
  CardFrontArt,
  DestinationArt,
  MagazineCoverArt,
  PosterArt,
  VanLiveryArt,
  VanRearArt,
} from './screens/print-art'
import { GalaxyWatchFace, WatchFace } from './screens/watch-face'
import { TapCounter } from './screens/tap-counter'
import { LockScreen } from './screens/lock-screen'
import { DesktopScreen } from './screens/desktop-screen'
import { MusicPlayer } from './screens/music-player'

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
 */
export function ObjectDemo({ demo, height = 440 }: { demo: string; height?: number }) {
  const scene = DEMOS[demo]
  if (!scene) return <p>Unknown demo: {demo}</p>
  return (
    <div className="object-demo" style={{ height }}>
      <LazyScene>{scene}</LazyScene>
    </div>
  )
}
