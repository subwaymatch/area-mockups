// All-in-one 3D mockups (canvas + device in one component).
export { PhoneMockup, type PhoneMockupProps } from './phone-mockup'
export { IPhoneMockup, type IPhoneMockupProps } from './iphone-mockup'
export { LaptopMockup, type LaptopMockupProps } from './laptop-mockup'

// Composable pieces: bring your own scene, or drop a device into an existing one.
export { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
export { Phone, type PhoneProps } from './devices/phone/phone'
export { IPhone, type IPhoneProps } from './devices/iphone/iphone'
export { Laptop, type LaptopProps } from './devices/laptop/laptop'

// Renderer-agnostic device data (shared with the planned 2D renderers).
export { PHONE, PHONE_DISPLAY_ASPECT } from './devices/phone/dimensions'
export { IPHONE, IPHONE_DISPLAY_ASPECT } from './devices/iphone/dimensions'
export { LAPTOP, LAPTOP_DISPLAY_ASPECT } from './devices/laptop/dimensions'
