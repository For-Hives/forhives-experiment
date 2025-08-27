'use client'

import { useState } from 'react'

export default function HeroAndy() {
	const [isLoading, setIsLoading] = useState(true)

	const handleClick = () => {
		window.open('https://andy-cinquin.com', '_blank')
	}

	return (
		<div className="h-full w-full">
			{/* Loading State */}
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
					<div className="text-center">
						<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600"></div>
						<p className="text-gray-500">Loading andy-cinquin.com...</p>
					</div>
				</div>
			)}

			{/* Iframe */}
			<iframe
				src="https://andy-cinquin.com"
				className="h-full w-full border-0"
				onLoad={() => setIsLoading(false)}
				onClick={handleClick}
				title="Andy Portfolio"
			/>
		</div>
	)
}
