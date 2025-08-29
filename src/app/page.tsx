'use client'

import { useAnimationContext } from './components/AnimationProvider'
import DiagonalSlider from './components/DiagonalSlider'
import HeroBreval from './components/HeroBreval'
import HeroAndy from './components/HeroAndy'

export default function Home() {
	const { isRiveAnimationComplete } = useAnimationContext()

	return (
		<main className="min-h-screen w-screen">
			<DiagonalSlider
				leftComponent={<HeroAndy />}
				rightComponent={<HeroBreval />}
				// Fallback images si les composants ne se chargent pas
				leftImage="/screens/bre.png"
				rightImage="/screens/dydy.png"
				showShader={isRiveAnimationComplete}
			/>
		</main>
	)
}
