// All-in-one 3D mockups (canvas + device in one component).
export { PhoneMockup, type PhoneMockupProps } from './phone-mockup'
export { IPhoneMockup, type IPhoneMockupProps } from './iphone-mockup'
export { LaptopMockup, type LaptopMockupProps } from './laptop-mockup'
export { TabletMockup, type TabletMockupProps } from './tablet-mockup'
export { WatchMockup, type WatchMockupProps } from './watch-mockup'
export { MonitorMockup, type MonitorMockupProps } from './monitor-mockup'

// Composable pieces: bring your own scene, or drop a device into an existing one.
export { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
export { Phone, type PhoneProps } from './devices/phone/phone'
export { IPhone, type IPhoneProps } from './devices/iphone/iphone'
export { Laptop, type LaptopProps } from './devices/laptop/laptop'
export { Tablet, type TabletProps } from './devices/tablet/tablet'
export { Watch, type WatchProps } from './devices/watch/watch'
export { Monitor, type MonitorProps } from './devices/monitor/monitor'

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
