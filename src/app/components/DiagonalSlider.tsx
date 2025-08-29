'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ReactNode } from 'react'

import Image from 'next/image'

interface DiagonalSliderProps {
	leftComponent?: ReactNode
	rightComponent?: ReactNode
	// Fallback images if no components provided
	leftImage?: string
	rightImage?: string
	leftAlt?: string
	rightAlt?: string
}

export default function DiagonalSlider({
	rightImage,
	rightComponent,
	rightAlt = 'Right Content',
	leftImage,
	leftComponent,
	leftAlt = 'Left Content',
}: DiagonalSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	// Position states: 50% = center, 5% = show mostly right, 95% = show mostly left
	const [position, setPosition] = useState(60)
	// Direct motion values for ultra-organic spring animation

	// Simple hover system: left half vs right half
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!containerRef.current) return

		const rect = containerRef.current.getBoundingClientRect()
		const x = ((e.clientX - rect.left) / rect.width) * 100

		if (x < 50) {
			// Hover left side - expand left image (push line to right)
			setPosition(110) // Fixed position to show more left
		} else {
			// Hover right side - expand right image (push line to left)
			setPosition(20) // Fixed position to show more right
		}
	}

	const handleMouseLeave = () => {
		setPosition(60) // Back to center
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
			{/* Right Component/Image - Base Layer */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="h-full w-full">
					{rightComponent ??
						(rightImage != null && (
							<Image src={rightImage} alt={rightAlt} fill className="object-cover" unoptimized priority />
						))}
				</div>
			</div>

			{/* Left Component/Image - Clipped Layer */}
			<motion.div
				className="absolute inset-0 overflow-hidden"
				animate={{
					clipPath: `polygon(0% 0%, ${position}% 0%, ${Math.max(0, Math.min(100, position - 25))}% 100%, 0% 100%)`,
				}}
				transition={{
					type: 'spring',
					stiffness: 120,
					restSpeed: 0.001,
					restDelta: 0.001,
					mass: 1.2,
					damping: 20,
				}}
			>
				<div className="h-full w-full">
					{leftComponent ??
						(leftImage != null && (
							<Image src={leftImage} alt={leftAlt} fill className="object-cover" unoptimized priority />
						))}
				</div>
			</motion.div>

			{/* Minimalist center border SVG - motion animated */}
			<svg
				className="pointer-events-none absolute inset-0 z-30"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				{/* Main diagonal line */}
				<motion.line
					animate={{
						x2: Math.max(0, Math.min(100, position - 25)),
						x1: position,
					}}
					y1={0}
					y2={100}
					stroke="white"
					strokeWidth="0.3"
					strokeOpacity="0.9"
					transition={{
						type: 'spring',
						stiffness: 120,
						restSpeed: 0.001,
						restDelta: 0.001,
						mass: 1.2,
						damping: 20,
					}}
				/>

				{/* Subtle glow effect */}
				<motion.line
					animate={{
						x2: Math.max(0, Math.min(100, position - 25)),
						x1: position,
					}}
					y1={0}
					y2={100}
					stroke="rgba(255,255,255,0.3)"
					strokeWidth="0.6"
					filter="blur(0.5px)"
					transition={{
						type: 'spring',
						stiffness: 120,
						restSpeed: 0.001,
						restDelta: 0.001,
						mass: 1.2,
						damping: 20,
					}}
				/>
			</svg>
		</motion.div>
	)
}
