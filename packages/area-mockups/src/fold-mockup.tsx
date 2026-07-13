import * as React from 'react'
import { MockupCanvas, type MockupCanvasProps } from './mockup-canvas'
import { Fold, type FoldProps } from './devices/fold/fold'
import { FOLD_VARIANTS } from './devices/fold/dimensions'
import { FloatGroup } from './float-group'

type InheritedDeviceProps = Pick<
  FoldProps,
  | 'variant'
  | 'open'
  | 'orientation'
  | 'color'
  | 'frameColor'
  | 'screenBackground'
  | 'resolution'
  | 'punchHole'
  | 'interactive'
  | 'dragToRotate'
  | 'occlude'
  | 'screenStyle'
>

export interface FoldMockupProps
  extends Omit<MockupCanvasProps, 'children'>,
    InheritedDeviceProps {
  /** Screen content — any React node, an <iframe>, a <video>… */
  children?: React.ReactNode
  /** Gentle floating idle animation. */
  float?: boolean
  /** Extra props forwarded to the device group (position, rotation, scale…). */
  deviceProps?: Omit<FoldProps, 'children'>
}

/**
 * The one-liner: a complete, interactive 3D Galaxy Z Fold mockup. Open by
 * default — your content fills the big inner display.
 *
 * ```tsx
 * <FoldMockup autoRotate float>
 *   <YourApp />
 * </FoldMockup>
 *
 * <FoldMockup open={false}>
 *   <CoverUI /> {/* folded: content on the tall cover screen *\/}
 * </FoldMockup>
 * ```
 */
export function FoldMockup({
  children,
  variant = 'fold7',
  open = true,
  orientation = 'portrait',
  color,
  frameColor,
  screenBackground,
  resolution,
  punchHole,
  interactive,
  dragToRotate,
  occlude,
  screenStyle,
  float = false,
  deviceProps,
  ...canvasProps
}: FoldMockupProps) {
  const device = (
    <Fold
      variant={variant}
      open={open}
      orientation={orientation}
      color={color}
      frameColor={frameColor}
      screenBackground={screenBackground}
      resolution={resolution}
      punchHole={punchHole}
      interactive={interactive}
      dragToRotate={dragToRotate}
      occlude={occlude}
      screenStyle={screenStyle}
      {...deviceProps}
    >
      {children}
    </Fold>
  )

  // Grounded by default: the shadow plane kisses the bottom edge of the body.
  const state = open ? FOLD_VARIANTS[variant].open : FOLD_VARIANTS[variant].closed
  const extent = orientation === 'landscape' ? state.body.width : state.body.height
  const shadowY = canvasProps.shadowY ?? (float ? -(extent / 2 + 0.3) : -(extent / 2 + 0.05))

  return (
    <MockupCanvas {...canvasProps} shadowY={shadowY}>
      {float ? <FloatGroup>{device}</FloatGroup> : device}
    </MockupCanvas>
  )
}
