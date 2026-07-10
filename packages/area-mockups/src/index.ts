// All-in-one 3D mockups (canvas + device in one component).
export { PhoneMockup, type PhoneMockupProps } from './phone-mockup'
export { IPhoneMockup, type IPhoneMockupProps } from './iphone-mockup'
export { LaptopMockup, type LaptopMockupProps } from './laptop-mockup'
export { TabletMockup, type TabletMockupProps } from './tablet-mockup'
export { WatchMockup, type WatchMockupProps } from './watch-mockup'
export { MonitorMockup, type MonitorMockupProps } from './monitor-mockup'

// All-in-one 3D object mockups (print, packaging, out-of-home, vehicles).
export { BookMockup, type BookMockupProps } from './book-mockup'
export { MagazineMockup, type MagazineMockupProps } from './magazine-mockup'
export { BrochureMockup, type BrochureMockupProps } from './brochure-mockup'
export { BusinessCardMockup, type BusinessCardMockupProps } from './business-card-mockup'
export { PosterFrameMockup, type PosterFrameMockupProps } from './poster-frame-mockup'
export { BillboardMockup, type BillboardMockupProps } from './billboard-mockup'
export { VanMockup, type VanMockupProps } from './van-mockup'

// Composable pieces: bring your own scene, or drop a device into an existing one.
export { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
export { Phone, type PhoneProps } from './devices/phone/phone'
export { IPhone, type IPhoneProps } from './devices/iphone/iphone'
export { Laptop, type LaptopProps } from './devices/laptop/laptop'
export { Tablet, type TabletProps } from './devices/tablet/tablet'
export { Watch, type WatchProps } from './devices/watch/watch'
export { Monitor, type MonitorProps } from './devices/monitor/monitor'
export { Book, type BookProps } from './objects/book/book'
export { Magazine, type MagazineProps } from './objects/magazine/magazine'
export { Brochure, type BrochureProps } from './objects/brochure/brochure'
export { BusinessCard, type BusinessCardProps } from './objects/business-card/business-card'
export { PosterFrame, type PosterFrameProps } from './objects/poster-frame/poster-frame'
export { Billboard, type BillboardProps } from './objects/billboard/billboard'
export { Van, type VanProps } from './objects/van/van'

// Renderer-agnostic device data (shared with the planned 2D renderers).
export {
  PHONE,
  PHONE_DISPLAY_ASPECT,
  GALAXY_VARIANTS,
  type GalaxyVariant,
  type GalaxyPhoneSpec,
} from './devices/phone/dimensions'
export {
  IPHONE,
  IPHONE_DISPLAY_ASPECT,
  IPHONE_VARIANTS,
  type IPhoneVariant,
  type IPhoneSpec,
} from './devices/iphone/dimensions'
export { LAPTOP, LAPTOP_DISPLAY_ASPECT } from './devices/laptop/dimensions'
export {
  TABLET,
  TABLET_DISPLAY_ASPECT,
  TABLET_VARIANTS,
  type TabletVariant,
  type TabletSpec,
} from './devices/tablet/dimensions'
export { WATCH, WATCH_DISPLAY_ASPECT } from './devices/watch/dimensions'
export { MONITOR, MONITOR_DISPLAY_ASPECT } from './devices/monitor/dimensions'

// Renderer-agnostic object data (print, out-of-home, vehicles).
export { BOOK, BOOK_COVER_ASPECT } from './objects/book/dimensions'
export { MAGAZINE, MAGAZINE_COVER_ASPECT } from './objects/magazine/dimensions'
export { BROCHURE, BROCHURE_PANEL_ASPECT } from './objects/brochure/dimensions'
export { BUSINESS_CARD, BUSINESS_CARD_FACE_ASPECT } from './objects/business-card/dimensions'
export { POSTER_FRAME, POSTER_FRAME_ASPECT } from './objects/poster-frame/dimensions'
export { BILLBOARD, BILLBOARD_FACE_ASPECT } from './objects/billboard/dimensions'
export { VAN, VAN_WRAP_ASPECT } from './objects/van/dimensions'
