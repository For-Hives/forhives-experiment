'use client'

import React from 'react'
import { GlassElement, LoadingPopup, useLoadingPopup } from './liquidglass'

export default function GlassDemo() {
	const { isLoading, showLoading, hideLoading } = useLoadingPopup()

	const handleShowLoading = () => {
		showLoading()
		// Auto-fermer après 3 secondes pour la demo
		setTimeout(() => {
			hideLoading()
		}, 3000)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
					Liquid Glass Components Demo
				</h1>
				
				{/* Controls */}
				<div className="text-center mb-12">
					<button
						onClick={handleShowLoading}
						className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Show Loading Popup
					</button>
				</div>

				{/* Glass Elements Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
					{/* Card 1 - Standard Glass */}
					<GlassElement
						width={280}
						height={200}
						radius={16}
						depth={8}
						blur={3}
						chromaticAberration={0}
						className="mx-auto"
					>
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-2">Standard Glass</h3>
							<p className="text-sm text-gray-700">
								Clean glass effect with subtle blur and transparency
							</p>
						</div>
					</GlassElement>

					{/* Card 2 - Chromatic Aberration */}
					<GlassElement
						width={280}
						height={200}
						radius={16}
						depth={10}
						blur={4}
						chromaticAberration={3}
						className="mx-auto"
					>
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-2">Chromatic Effect</h3>
							<p className="text-sm text-gray-700">
								Glass with chromatic aberration for prismatic effect
							</p>
						</div>
					</GlassElement>

					{/* Card 3 - High Depth */}
					<GlassElement
						width={280}
						height={200}
						radius={24}
						depth={15}
						blur={6}
						chromaticAberration={1}
						strength={120}
						className="mx-auto"
					>
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-2">Deep Glass</h3>
							<p className="text-sm text-gray-700">
								High depth and strength for more pronounced distortion
							</p>
						</div>
					</GlassElement>
				</div>

				{/* Interactive Elements */}
				<div className="flex flex-wrap justify-center gap-6">
					<GlassElement
						width={150}
						height={150}
						radius={75}
						depth={12}
						blur={3}
						chromaticAberration={2}
						onClick={() => alert('Glass button clicked!')}
					>
						<div className="text-center">
							<div className="text-2xl mb-1">🔮</div>
							<div className="text-xs font-medium">Click me!</div>
						</div>
					</GlassElement>

					<GlassElement
						width={200}
						height={100}
						radius={50}
						depth={8}
						blur={2}
						chromaticAberration={0}
						strength={60}
					>
						<div className="text-center">
							<div className="text-xl font-bold text-blue-800">Badge</div>
						</div>
					</GlassElement>
				</div>
			</div>

			{/* Loading Popup */}
			<LoadingPopup
				isVisible={isLoading}
				title="Processing..."
				message="We're working on your request. This should only take a moment."
				onClose={hideLoading}
			/>
		</div>
	)
}