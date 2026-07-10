import * as React from 'react'
import type * as THREE from 'three'
import type { ThreeElements } from '@react-three/fiber'
import { COFFEE_CUP, COFFEE_CUP_VARIANTS, type CoffeeCupVariant } from './dimensions'
import { DeviceScreen } from '../../screen/device-screen'

type GroupProps = ThreeElements['group']

export interface CoffeeCupProps extends Omit<GroupProps, 'children' | 'color'> {
  /**
   * Sleeve wrap design — ONE node laid out at the full unrolled wrap size
   * (`resolution` × wrap height px). The cup tiles it around the curve from
   * flat strips, each clipping its slice of the same artwork.
   *
   * The wrap is duplicated per strip, so stateful/interactive content will
   * not stay in sync across the curve — curved surfaces want artwork.
   */
  children?: React.ReactNode
  /** Cup size. Both share the lip/base diameters; the 16 oz is taller. */
  variant?: CoffeeCupVariant
  /** Show the sip lid. Turn off to reveal the coffee. */
  lid?: boolean
  /** Paper cup color. */
  color?: string
  /** Kraft sleeve color — also what shows through transparent wrap areas. */
  sleeveColor?: string
  /** Sip lid plastic color. Try '#2b2b2e' for a black lid. */
  lidColor?: string
  /** CSS background painted behind the wrap (default transparent: kraft shows). */
  wrapBackground?: string
  /** CSS pixel width of the FULL unrolled sleeve wrap. */
  resolution?: number
  /**
   * Let pointer events reach the wrap content. Off by default: the wrap is
   * duplicated per strip, so clicks would only reach one copy.
   */
  interactive?: boolean
  /** Hand >10px drags off to the orbit controls; taps still reach the content. */
  dragToRotate?: boolean
  /**
   * How wrap strips hide as the cup turns. The default per-strip backface
   * culling already covers the far side; `'blending'` adds per-pixel depth
   * blending against other scene objects.
   */
  occlude?: boolean | 'blending'
  /** Extra styles merged onto each strip wrapper (e.g. a custom fontFamily). */
  screenStyle?: React.CSSProperties
}

/**
 * A procedurally built paper hot cup: tapered body with a rolled lip, a sip
 * lid, and a kraft sleeve whose CURVED wrap is live DOM — the first curved
 * surface in the library. The wrap is tiled from flat strips arranged as an
 * inscribed prism around the sleeve; each strip clips one slice of a single
 * unrolled artwork, and strips hide themselves as they turn away, so the
 * wrap reads continuous while you spin the cup. No 3D asset files are
 * loaded.
 *
 * Must be rendered inside a react-three-fiber `<Canvas>` (or `<MockupCanvas>`).
 */
export function CoffeeCup({
  children,
  variant = '12oz',
  lid = true,
  color = '#f4f3ef',
  sleeveColor = '#c9a97c',
  lidColor = '#f6f5f2',
  wrapBackground = 'transparent',
  resolution = COFFEE_CUP.resolution,
  interactive = false,
  dragToRotate = true,
  occlude = true,
  screenStyle,
  ...groupProps
}: CoffeeCupProps) {
  const spec = COFFEE_CUP_VARIANTS[variant]
  const { topRadius, bottomRadius, height, lip, sleeve } = spec
  const { facets, lid: lidSpec } = COFFEE_CUP
  const bodyRef = React.useRef<THREE.Mesh>(null!)

  const step = (2 * Math.PI) / facets
  const chord = 2 * sleeve.radius * Math.sin(Math.PI / facets)
  const apothem = sleeve.radius * Math.cos(Math.PI / facets)
  const stripResolution = Math.max(24, Math.round(resolution / facets))
  const sleeveY = -height / 2 + sleeve.bottom + sleeve.height / 2

  const paper = { metalness: 0, roughness: 0.6 }
  const plastic = { color: lidColor, metalness: 0.05, roughness: 0.35, clearcoat: 0.4 }

  // Corrugation flutes + a soft top light, painted over every strip. The last
  // strip also carries the glued seam shadow, like a real sleeve blank.
  const stripOverlay = (isSeam: boolean): React.ReactNode => (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2147483647,
        background: [
          isSeam ? 'linear-gradient(90deg, transparent 88%, rgba(0,0,0,0.18) 96%, rgba(0,0,0,0.05) 100%)' : '',
          'repeating-linear-gradient(90deg, rgba(0,0,0,0.045) 0 3px, transparent 3px 33px)',
          'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.05))',
        ]
          .filter(Boolean)
          .join(', '),
      }}
    />
  )

  return (
    <group {...groupProps}>
      {/* cup body (open-topped when lidless, so the coffee shows), lip, base */}
      <mesh ref={bodyRef}>
        <cylinderGeometry args={[topRadius, bottomRadius, height, 48, 1, !lid]} />
        <meshPhysicalMaterial color={color} {...paper} side={lid ? 0 : 2} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, height / 2, 0]}>
        <torusGeometry args={[topRadius, lip, 10, 48]} />
        <meshPhysicalMaterial color={color} {...paper} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.03, 0]}>
        <cylinderGeometry args={[bottomRadius + 0.004, bottomRadius + 0.004, 0.06, 48]} />
        <meshPhysicalMaterial color="#d9d5cc" {...paper} />
      </mesh>

      {lid ? (
        /* sip lid: base ring, tapered dome, spout with a dark sip slot */
        <group position={[0, height / 2, 0]}>
          <mesh position={[0, lidSpec.ring / 2, 0]}>
            <cylinderGeometry args={[topRadius + 0.07, topRadius + 0.045, lidSpec.ring, 48]} />
            <meshPhysicalMaterial {...plastic} />
          </mesh>
          <mesh position={[0, lidSpec.ring + lidSpec.dome / 2, 0]}>
            <cylinderGeometry args={[topRadius * 0.62, topRadius + 0.02, lidSpec.dome, 48]} />
            <meshPhysicalMaterial {...plastic} />
          </mesh>
          <mesh position={[0, lidSpec.ring + lidSpec.dome + lidSpec.spout / 2, topRadius * 0.34]}>
            <boxGeometry args={[0.52, lidSpec.spout, 0.34]} />
            <meshPhysicalMaterial {...plastic} />
          </mesh>
          <mesh position={[0, lidSpec.ring + lidSpec.dome + lidSpec.spout + 0.001, topRadius * 0.42]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.24, 0.09]} />
            <meshBasicMaterial color="#1c1a18" />
          </mesh>
        </group>
      ) : (
        /* no lid: the coffee, and a bottom cap for the open-ended body */
        <>
          <mesh position={[0, height / 2 - 0.34, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[topRadius - 0.06, 48]} />
            {/* matte, low env pickup: any gloss here mirrors the white studio
                light at grazing angles and the coffee reads as milk */}
            <meshPhysicalMaterial color="#2e1c0e" metalness={0} roughness={0.85} envMapIntensity={0.25} />
          </mesh>
          <mesh position={[0, -height / 2 + 0.01, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[bottomRadius - 0.005, 48]} />
            <meshPhysicalMaterial color={color} {...paper} />
          </mesh>
        </>
      )}

      {/* kraft sleeve: a backing cylinder just under the strip prism, so the
          hairline seams between strips read as sleeve, not background */}
      <mesh position={[0, sleeveY, 0]}>
        <cylinderGeometry args={[children != null ? apothem - 0.005 : sleeve.radius, children != null ? apothem - 0.005 : sleeve.radius, sleeve.height, 48]} />
        <meshPhysicalMaterial color={sleeveColor} metalness={0} roughness={0.85} />
      </mesh>

      {/* the curved live wrap: one artwork, tiled across flat strips */}
      {children != null &&
        Array.from({ length: facets }, (_, i) => (
          <group key={i} rotation-y={i * step}>
            <DeviceScreen
              width={chord}
              height={sleeve.height}
              radius={0}
              resolution={stripResolution}
              position={[0, sleeveY, apothem + 0.012]}
              background={wrapBackground}
              interactive={interactive}
              dragToRotate={dragToRotate}
              // No mesh-raycast occlusion for the strips: a high camera's ray
              // to a front strip grazes the tapered body and false-hides it.
              // The per-strip backface culling already hides the far side.
              occlude={occlude === 'blending' ? 'blending' : undefined}
              screenStyle={screenStyle}
              overlay={stripOverlay(i === facets - 1)}
            >
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${-i * 100}%`,
                    width: `${facets * 100}%`,
                  }}
                >
                  {children}
                </div>
              </div>
            </DeviceScreen>
          </group>
        ))}
    </group>
  )
}
