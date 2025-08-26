import DiagonalSlider from './components/DiagonalSlider'

export default function Home() {
	return (
		<main className="min-h-screen">
			<DiagonalSlider
				beforeImage="/screens/bre.png"
				afterImage="/screens/dydy.png"
				beforeAlt="Image avant"
				afterAlt="Image après"
			/>
		</main>
	)
}
