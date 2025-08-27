'use client'

import { motion, useSpring, useTransform } from 'motion/react'
import { useRef, useState } from 'react'

import Image from 'next/image'
import { ReactNode } from 'react'

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
	leftComponent,
	rightComponent,
	leftImage,
	rightImage,
	leftAlt = 'Left Content',
	rightAlt = 'Right Content',
}: DiagonalSliderProps) {
	const containerRef = useRef<HTMLDivElement>(null)

	// Position states: 50% = center, 5% = show mostly right, 95% = show mostly left
	const [position, setPosition] = useState(60)
	const [hoverState, setHoverState] = useState<'center' | 'left' | 'right'>('center')
	// Direct motion values for ultra-organic spring animation

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
			{/* Right Component/Image - Base Layer */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="h-full w-full">
					{rightComponent || (
						rightImage && (
							<Image 
								src={rightImage} 
								alt={rightAlt} 
								fill 
								className="object-cover" 
								unoptimized 
								priority 
							/>
						)
					)}
				</div>
			</div>

			{/* Left Component/Image - Clipped Layer */}
			<motion.div
				className="absolute inset-0 overflow-hidden"
				animate={{
					clipPath: `polygon(0% 0%, ${position}% 0%, ${Math.max(0, Math.min(100, position - 25))}% 100%, 0% 100%)`,
				}}
				transition={{
					type: "spring",
					stiffness: 120,
					damping: 20,
					mass: 1.2,
					restDelta: 0.001,
					restSpeed: 0.001,
				}}
			>
				<div className="h-full w-full">
					{leftComponent || (
						leftImage && (
							<Image 
								src={leftImage} 
								alt={leftAlt} 
								fill 
								className="object-cover" 
								unoptimized 
								priority 
							/>
						)
					)}
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
						x1: position,
						x2: Math.max(0, Math.min(100, position - 25)),
					}}
					y1={0}
					y2={100}
					stroke="white"
					strokeWidth="0.3"
					strokeOpacity="0.9"
					transition={{
						type: "spring",
						stiffness: 120,
						damping: 20,
						mass: 1.2,
						restDelta: 0.001,
						restSpeed: 0.001,
					}}
				/>

				{/* Subtle glow effect */}
				<motion.line
					animate={{
						x1: position,
						x2: Math.max(0, Math.min(100, position - 25)),
					}}
					y1={0}
					y2={100}
					stroke="rgba(255,255,255,0.3)"
					strokeWidth="0.6"
					filter="blur(0.5px)"
					transition={{
						type: "spring",
						stiffness: 120,
						damping: 20,
						mass: 1.2,
						restDelta: 0.001,
						restSpeed: 0.001,
					}}
				/>
			</svg>

			{/* Labels */}
			<div className="pointer-events-none absolute top-6 left-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">
				Left
			</div>
			<div className="pointer-events-none absolute top-6 right-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">
				Right
			</div>

			{/* Debug indicator */}
			<div className="pointer-events-none absolute bottom-6 left-6 z-60 rounded-lg bg-black/70 px-4 py-2 font-mono text-sm text-white">
				State: {hoverState} | Position: {Math.round(position)}%
			</div>
		</motion.div>
	)
}
