'use client'

import { Suspense } from 'react'
import Game3D from './components/Game3D'
import LoadingScreen from './components/LoadingScreen'

export default function Home() {
  return (
    <main className="game-container">
      <Suspense fallback={<LoadingScreen />}>
        <Game3D />
      </Suspense>
    </main>
  )
}