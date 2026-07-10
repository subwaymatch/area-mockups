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
export { IDCardMockup, type IDCardMockupProps } from './id-card-mockup'
export { BusMockup, type BusMockupProps } from './bus-mockup'
export { ProductBoxMockup, type ProductBoxMockupProps } from './product-box-mockup'
export { RollupBannerMockup, type RollupBannerMockupProps } from './rollup-banner-mockup'
export { BusShelterMockup, type BusShelterMockupProps } from './bus-shelter-mockup'
export { GreetingCardMockup, type GreetingCardMockupProps } from './greeting-card-mockup'
export { VinylRecordMockup, type VinylRecordMockupProps } from './vinyl-record-mockup'
export { TVSetMockup, type TVSetMockupProps } from './tv-mockup'
export { AFrameSignMockup, type AFrameSignMockupProps } from './a-frame-sign-mockup'
export { DOOHTotemMockup, type DOOHTotemMockupProps } from './dooh-totem-mockup'
export { StorefrontMockup, type StorefrontMockupProps } from './storefront-mockup'
export { SemiTrailerMockup, type SemiTrailerMockupProps } from './semi-trailer-mockup'
export { WheatpasteWallMockup, type WheatpasteWallMockupProps } from './wheatpaste-wall-mockup'
export { MailerBoxMockup, type MailerBoxMockupProps } from './mailer-box-mockup'
export { ShoppingBagMockup, type ShoppingBagMockupProps } from './shopping-bag-mockup'
export { CoffeeCupMockup, type CoffeeCupMockupProps } from './coffee-cup-mockup'
export { PizzaBoxMockup, type PizzaBoxMockupProps } from './pizza-box-mockup'

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
export { IDCard, type IDCardProps } from './objects/id-card/id-card'
export { Bus, type BusProps } from './objects/bus/bus'
export { ProductBox, type ProductBoxProps } from './objects/product-box/product-box'
export { RollupBanner, type RollupBannerProps } from './objects/rollup-banner/rollup-banner'
export { BusShelter, type BusShelterProps } from './objects/bus-shelter/bus-shelter'
export { GreetingCard, type GreetingCardProps } from './objects/greeting-card/greeting-card'
export { VinylRecord, type VinylRecordProps } from './objects/vinyl-record/vinyl-record'
export { TVSet, type TVProps } from './objects/tv/tv'
export { AFrameSign, type AFrameSignProps } from './objects/a-frame-sign/a-frame-sign'
export { DOOHTotem, type DOOHTotemProps } from './objects/dooh-totem/dooh-totem'
export { Storefront, type StorefrontProps } from './objects/storefront/storefront'
export { SemiTrailer, type SemiTrailerProps } from './objects/semi-trailer/semi-trailer'
export { WheatpasteWall, type WheatpasteWallProps } from './objects/wheatpaste-wall/wheatpaste-wall'
export { MailerBox, type MailerBoxProps } from './objects/mailer-box/mailer-box'
export { ShoppingBag, type ShoppingBagProps } from './objects/shopping-bag/shopping-bag'
export { CoffeeCup, type CoffeeCupProps } from './objects/coffee-cup/coffee-cup'
export { PizzaBox, type PizzaBoxProps } from './objects/pizza-box/pizza-box'

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
export {
  WATCH,
  WATCH_DISPLAY_ASPECT,
  WATCH_VARIANTS,
  type WatchVariant,
  type WatchSpec,
} from './devices/watch/dimensions'
export { MONITOR, MONITOR_DISPLAY_ASPECT } from './devices/monitor/dimensions'

// Renderer-agnostic object data (print, out-of-home, vehicles).
export { BOOK, BOOK_COVER_ASPECT } from './objects/book/dimensions'
export { MAGAZINE, MAGAZINE_COVER_ASPECT } from './objects/magazine/dimensions'
export { BROCHURE, BROCHURE_PANEL_ASPECT } from './objects/brochure/dimensions'
export { BUSINESS_CARD, BUSINESS_CARD_FACE_ASPECT } from './objects/business-card/dimensions'
export { POSTER_FRAME, POSTER_FRAME_ASPECT } from './objects/poster-frame/dimensions'
export { BILLBOARD, BILLBOARD_FACE_ASPECT } from './objects/billboard/dimensions'
export { VAN, VAN_WRAP_ASPECT } from './objects/van/dimensions'
export { ID_CARD, ID_CARD_FACE_ASPECT } from './objects/id-card/dimensions'
export { BUS, BUS_AD_ASPECT } from './objects/bus/dimensions'
export { PRODUCT_BOX, PRODUCT_BOX_FRONT_ASPECT } from './objects/product-box/dimensions'
export { ROLLUP_BANNER, ROLLUP_BANNER_ASPECT } from './objects/rollup-banner/dimensions'
export { BUS_SHELTER, BUS_SHELTER_POSTER_ASPECT } from './objects/bus-shelter/dimensions'
export { GREETING_CARD, GREETING_CARD_ASPECT } from './objects/greeting-card/dimensions'
export { VINYL_RECORD, VINYL_RECORD_ASPECT } from './objects/vinyl-record/dimensions'
export { TV, TV_DISPLAY_ASPECT } from './objects/tv/dimensions'
export { A_FRAME_SIGN, A_FRAME_SIGN_ASPECT } from './objects/a-frame-sign/dimensions'
export { DOOH_TOTEM, DOOH_TOTEM_ASPECT } from './objects/dooh-totem/dimensions'
export { STOREFRONT, STOREFRONT_SIGN_ASPECT } from './objects/storefront/dimensions'
export { SEMI_TRAILER, SEMI_TRAILER_SIDE_ASPECT } from './objects/semi-trailer/dimensions'
export { WHEATPASTE_WALL, WHEATPASTE_WALL_ASPECT } from './objects/wheatpaste-wall/dimensions'
export { MAILER_BOX, MAILER_BOX_TOP_ASPECT } from './objects/mailer-box/dimensions'
export { SHOPPING_BAG, SHOPPING_BAG_ASPECT } from './objects/shopping-bag/dimensions'
export {
  COFFEE_CUP,
  COFFEE_CUP_WRAP_ASPECT,
  COFFEE_CUP_VARIANTS,
  type CoffeeCupVariant,
  type CoffeeCupSpec,
} from './objects/coffee-cup/dimensions'
export { PIZZA_BOX, PIZZA_BOX_TOP_ASPECT } from './objects/pizza-box/dimensions'
