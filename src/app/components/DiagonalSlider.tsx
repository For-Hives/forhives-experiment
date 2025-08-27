'use client'

import { motion, useSpring } from 'motion/react'
import { useRef, useState } from 'react'

import Image from 'next/image'

interface DiagonalSliderProps {
	beforeImage: string
	afterImage: string
	beforeAlt?: string
	afterAlt?: string
}

export default function DiagonalSlider({
	beforeImage,
	beforeAlt = 'Before',
	afterImage,
	afterAlt = 'After',
}: DiagonalSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	// Position states: 50% = center, 5% = show mostly right, 95% = show mostly left
	const [position, setPosition] = useState(60)
	const [hoverState, setHoverState] = useState<'center' | 'left' | 'right'>('center')
	// Ultra organic spring for smooth transitions between states
	const springDiagonal = useSpring(position, {
		stiffness: 120,
		damping: 20,
		mass: 1.2,
		restDelta: 0.001,
		restSpeed: 0.001,
	})

	// Simple hover system: left half vs right half
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!containerRef.current) return

		const rect = containerRef.current.getBoundingClientRect()
		const x = ((e.clientX - rect.left) / rect.width) * 100

		if (x < 50) {
			// Hover left side - expand left image (push line to right)
			setPosition(110) // Fixed position to show more left
			setHoverState('left')
		} else {
			// Hover right side - expand right image (push line to left)
			setPosition(20) // Fixed position to show more right
			setHoverState('right')
		}
	}

	const handleMouseLeave = () => {
		setPosition(65) // Back to center
		setHoverState('center')
	}

	return (
		<motion.div
			ref={containerRef}
			className="relative h-screen w-screen overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
		>
			{/* After Image */}
			<div className="absolute inset-0">
				<Image src={afterImage} alt={afterAlt} fill className="object-cover" unoptimized priority />
			</div>

			{/* Before Image with diagonal clip - smooth spring transition */}
			<motion.div
				className="absolute inset-0"
				style={{
					clipPath: springDiagonal.to(value => {
						const topX = value
						const bottomX = Math.max(0, Math.min(100, value - 25))
						return `polygon(0% 0%, ${topX}% 0%, ${bottomX}% 100%, 0% 100%)`
					}),
				}}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</motion.div>

			{/* Minimalist center border SVG - foundation for future crack effect */}
			<svg
				className="pointer-events-none absolute inset-0 z-30"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				{/* Main diagonal line */}
				<line
					x1={position}
					y1={0}
					x2={Math.max(0, Math.min(100, position - 25))}
					y2={100}
					stroke="white"
					strokeWidth="0.3"
					strokeOpacity="0.9"
				/>

				{/* Subtle glow effect - foundation for future glass/crack animations */}
				<line
					x1={position}
					y1={0}
					x2={Math.max(0, Math.min(100, position - 25))}
					y2={100}
					stroke="rgba(255,255,255,0.3)"
					strokeWidth="0.6"
					filter="blur(0.5px)"
				/>
			</svg>

			{/* Labels */}
			<div className="pointer-events-none absolute top-6 left-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">
				Avant
			</div>
			<div className="pointer-events-none absolute top-6 right-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">
				Après
			</div>

			{/* Debug indicator */}
			<div className="pointer-events-none absolute bottom-6 left-6 z-60 rounded-lg bg-black/70 px-4 py-2 font-mono text-sm text-white">
				State: {hoverState} | Position: {Math.round(position)}% | Spring: {Math.round(springDiagonal.get())}%
			</div>
		</motion.div>
	)
}
