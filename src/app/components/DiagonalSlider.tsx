'use client'

import { motion, useSpring, useTransform } from 'motion/react'
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
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
	const [isHovering, setIsHovering] = useState(false)

	// Position states: 50% = center, 5% = show mostly right, 95% = show mostly left
	const [position, setPosition] = useState(50)
	const [hoverState, setHoverState] = useState<'center' | 'left' | 'right'>('center')
	const springDiagonal = useSpring(position, {
		stiffness: 300,
		damping: 30,
	})

	// Handle mouse movement to control diagonal position
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!containerRef.current) return
		
		const rect = containerRef.current.getBoundingClientRect()
		const x = (e.clientX - rect.left) / rect.width * 100
		const y = (e.clientY - rect.top) / rect.height * 100
		
		setCursorPosition({ x, y })
		
		// Offset mapping: cursor position + 25%
		// When cursor is at 25%, position is at 50%
		// When cursor is at 0%, position is at 25% (minimum)
		const offsetPosition = Math.max(25, x + 25)
		setPosition(offsetPosition)
		
		// Update hover state based on position
		if (x < 30) {
			setHoverState('right') // Show mostly right image
		} else if (x > 70) {
			setHoverState('left') // Show mostly left image  
		} else {
			setHoverState('center')
		}
	}

	// Diagonal geometry that makes the line intersect with mouse position
	// For a diagonal that goes from top to bottom with consistent slope
	const getDiagonalPoints = (position: number) => ({
		topX: position,
		bottomX: Math.max(0, Math.min(100, position - 25)), // Adjust slope to match mouse position better
	})

	const handleMouseEnter = () => {
		setIsHovering(true)
	}

	const handleMouseLeave = () => {
		setPosition(50) // Back to center
		setHoverState('center')
		setIsHovering(false)
	}

	return (
		<motion.div
			ref={containerRef}
			className="relative h-screen w-screen overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseEnter}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
		>
			{/* After Image */}
			<div className="absolute inset-0">
				<Image src={afterImage} alt={afterAlt} fill className="object-cover" unoptimized priority />
			</div>

			{/* Before Image with diagonal clip */}
			<div
				className="absolute inset-0"
				style={{
					clipPath: `polygon(0% 0%, ${position}% 0%, ${Math.max(0, Math.min(100, position - 25))}% 100%, 0% 100%)`,
				}}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</div>

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
			<div className="absolute top-6 left-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white pointer-events-none">
				Avant
			</div>
			<div className="absolute top-6 right-6 z-40 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white pointer-events-none">
				Après
			</div>

			{/* Debug indicator */}
			<div className="absolute bottom-6 left-6 z-60 rounded-lg bg-black/70 px-4 py-2 text-sm font-mono text-white pointer-events-none">
				State: {hoverState} | Position: {Math.round(position)}% | Spring: {Math.round(springDiagonal.get())}% | Cursor: {Math.round(cursorPosition.x)}%, {Math.round(cursorPosition.y)}%
			</div>
		</motion.div>
	)
}
