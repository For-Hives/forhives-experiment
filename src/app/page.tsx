'use client'

import { useAnimationContext } from './components/AnimationProvider'
import DiagonalSlider from './components/DiagonalSlider'
import HeroBreval from './components/HeroBreval'
import HeroAndy from './components/HeroAndy'

export default function Home() {
	const { isPreloadComplete } = useAnimationContext()

	return (
		<main className="min-h-screen w-screen">
			<DiagonalSlider
				leftComponent={(props) => <HeroAndy {...props} />}
				rightComponent={(props) => <HeroBreval {...props} />}
				// Fallback images if components don't load
				leftImage="/screens/bre.png"
				rightImage="/screens/dydy.png"
				showShader={isPreloadComplete} // Enable shader when preloading is complete
			/>
		</main>
	)
}
