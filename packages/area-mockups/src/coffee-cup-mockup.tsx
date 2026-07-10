import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { CoffeeCup, type CoffeeCupProps } from './objects/coffee-cup/coffee-cup'
import { COFFEE_CUP_VARIANTS } from './objects/coffee-cup/dimensions'
import { FloatGroup } from './float-group'

type InheritedObjectProps = Pick<
  CoffeeCupProps,
  | 'variant'
  | 'lid'
  | 'color'
  | 'sleeveColor'
  | 'lidColor'
  | 'wrapBackground'
  | 'resolution'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface CoffeeCupMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedObjectProps {
  /** Sleeve wrap design at the full unrolled wrap size — any React node. */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the object group (position, rotation, scale…). */
  deviceProps?: Omit<CoffeeCupProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D coffee cup mockup whose curved
 * kraft-sleeve wrap is live DOM.
 *
 * ```tsx
 * <CoffeeCupMockup autoRotate>
 *   <YourSleeveWrap />
 * </CoffeeCupMockup>
 * ```
 */
export function CoffeeCupMockup({
  children,
  variant = '12oz',
  lid,
  color,
  sleeveColor,
  lidColor,
  wrapBackground,
  resolution,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: CoffeeCupMockupProps) {
  const object = (
    <CoffeeCup
      variant={variant}
      lid={lid}
      color={color}
      sleeveColor={sleeveColor}
      lidColor={lidColor}
      wrapBackground={wrapBackground}
      resolution={resolution}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </CoffeeCup>
  )

  // The cup stands on the counter; ground the shadow just under the base.
  const groundY = -COFFEE_CUP_VARIANTS[variant].height / 2
  const shadowY = canvasProps.shadowY ?? (float ? groundY - 0.3 : groundY - 0.02)

  return (
    <MockupCanvas
      {...canvasProps}
      camera={canvasProps.camera ?? { position: [0, 0.6, 7.2], fov: 40 }}
      shadowY={shadowY}
    >
      {float ? <FloatGroup intensity={0.5}>{object}</FloatGroup> : object}
    </MockupCanvas>
  )
}
