'use client'

import { PhoneMockup } from 'area-mockups'
import { MusicPlayer } from '../screens/music-player'

export default function HeroScene() {
  return (
    <PhoneMockup
      float
      color="#15171d"
      frameColor="#4d5260"
      screenBackground="#05060a"
      deviceProps={{ rotation: [0, -0.32, 0] }}
    >
      <MusicPlayer />
    </PhoneMockup>
  )
}
