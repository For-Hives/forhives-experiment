import DiagonalSlider from './components/DiagonalSlider'
import HeroExample from './components/HeroExample'

export default function Home() {
	return (
		<main className="min-h-screen">
			<DiagonalSlider
				leftComponent={
					<HeroExample 
						title="Portfolio 1"
						subtitle="Creative Developer & Designer"
						backgroundColor="#1a1a1a"
						textColor="white"
					/>
				}
				rightComponent={
					<HeroExample 
						title="Portfolio 2"
						subtitle="Full Stack Engineer"
						backgroundColor="#3b82f6"
						textColor="white"
					/>
				}
				// Fallback images si les composants ne se chargent pas
				leftImage="/screens/bre.png"
				rightImage="/screens/dydy.png"
			/>
		</main>
	)
}
