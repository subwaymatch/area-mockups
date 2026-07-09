// All-in-one 3D mockup (canvas + device in one component).
export { PhoneMockup, type PhoneMockupProps } from './phone-mockup'

// Composable pieces: bring your own scene, or drop the device into an existing one.
export { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
export { Phone, type PhoneProps } from './devices/phone/phone'

// Renderer-agnostic device data (shared with the planned 2D renderers).
export { PHONE, PHONE_DISPLAY_ASPECT } from './devices/phone/dimensions'
