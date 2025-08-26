'use client'

import { motion, useSpring, useMotionValue, useTransform } from 'motion/react'
import { useState, useRef, useCallback } from 'react'

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
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState<{ x: number; y: number; initialPosition: number } | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Motion values for smooth animations
	const sliderPosition = useMotionValue(75) // Décalé vers la droite pour centrage diagonal
	const springPosition = useSpring(sliderPosition, {
		stiffness: 300,
		mass: 0.8,
		damping: 30,
	})

	// Transform values for animations
	const handleScale = useTransform(springPosition, [0, 50, 100], [0.9, 1, 0.9])
	const handleRotation = useTransform(springPosition, [0, 100], [-5, 5])

	// UNIFIED DIAGONAL GEOMETRY - Both line and mask use the same math
	// True diagonal from top-left (0,0) to bottom-right (100,100)
	const getDiagonalPoints = useCallback((position: number) => {
		// Position represents progress along the diagonal (0-100%)
		// Calculate the exact intersection points for a true diagonal line

		// For a perfect diagonal, we need points that create a 45° line
		// Top intersection: (position, 0)
		// Bottom intersection: (position - diagonalOffset, 100)
		const diagonalOffset = 50 // This creates the 45° angle

		return {
			topX: position,
			bottomX: Math.max(0, position - diagonalOffset),
		}
	}, [])

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		setIsDragging(true)
		
		// Store the initial drag position and current slider position
		setDragStart({
			x: e.clientX,
			y: e.clientY,
			initialPosition: sliderPosition.get()
		})
	}, [])

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
		setDragStart(null)
	}, [])

	const updateSliderPosition = useCallback((clientX: number, clientY: number, isDrag = false) => {
		if (!containerRef.current) return

		const rect = containerRef.current.getBoundingClientRect()
		const containerWidth = rect.width
		const containerHeight = rect.height

		if (isDrag && dragStart) {
			// For drag operations, use relative movement from drag start
			const deltaX = clientX - dragStart.x
			const deltaY = clientY - dragStart.y
			
			// Convert delta to percentage of container width (main interaction axis)
			const deltaPercent = (deltaX / containerWidth) * 100
			
			// Apply delta to initial position
			const newPosition = dragStart.initialPosition + deltaPercent
			
			// Clamp the result
			const targetPosition = Math.max(0, Math.min(100, newPosition))
			
			sliderPosition.set(targetPosition)
		} else {
			// For click operations, use direct positioning
			const x = clientX - rect.left
			const y = clientY - rect.top
			
			// Convert to percentage
			const xPercent = (x / containerWidth) * 100
			
			// Use X-based approach for clicks
			let targetPosition = xPercent
			
			// Adjust for the visual centering: when clicking near center, keep current position
			if (Math.abs(xPercent - 50) < 5) {
				return
			}
			
			// Clamp the result
			targetPosition = Math.max(0, Math.min(100, targetPosition))
			
			sliderPosition.set(targetPosition)
		}
	}, [dragStart])

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return
			updateSliderPosition(e.clientX, e.clientY, true) // true = isDrag
		},
		[isDragging, updateSliderPosition]
	)

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging) return
			const touch = e.touches[0]
			updateSliderPosition(touch.clientX, touch.clientY, true) // true = isDrag
		},
		[isDragging, updateSliderPosition]
	)

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			updateSliderPosition(e.clientX, e.clientY, false) // false = isClick
		},
		[updateSliderPosition]
	)

	return (
		<motion.div
			ref={containerRef}
			className="relative h-screen w-screen cursor-grab overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleMouseUp}
			onClick={handleClick}
			style={{ touchAction: 'none' }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ ease: 'easeOut', duration: 0.6 }}
		>
			{/* After Image (Right/Bottom) */}
			<motion.div
				className="absolute inset-0"
				initial={{ scale: 1.1 }}
				animate={{ scale: 1 }}
				transition={{ ease: 'easeOut', duration: 1 }}
			>
				<Image src={afterImage} alt={afterAlt} fill className="object-cover" unoptimized priority />
			</motion.div>

			{/* Before Image with PERFECT diagonal clip that matches the line */}
			<motion.div
				className="absolute inset-0"
				style={{
					// PERFECT diagonal clip using the same geometry as the diagonal line
					clipPath: useTransform(springPosition, value => {
						const { topX, bottomX } = getDiagonalPoints(value)
						// Create polygon that exactly follows the diagonal line's path
						return `polygon(0% 0%, ${topX}% 0%, ${bottomX}% 100%, 0% 100%)`
					}),
				}}
				initial={{ scale: 1.1 }}
				animate={{ scale: 1 }}
				transition={{ ease: 'easeOut', duration: 1, delay: 0.2 }}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</motion.div>

			{/* Diagonal Line - Rendered as SVG for PERFECT alignment */}
			<motion.svg
				className="pointer-events-none absolute inset-0 z-10"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				<defs>
					<linearGradient id="diagonalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="white" stopOpacity="0" />
						<stop offset="49%" stopColor="white" stopOpacity="0" />
						<stop offset="50%" stopColor="white" stopOpacity="1" />
						<stop offset="51%" stopColor="white" stopOpacity="0" />
						<stop offset="100%" stopColor="white" stopOpacity="0" />
					</linearGradient>
				</defs>
				<motion.line
					x1={useTransform(springPosition, value => getDiagonalPoints(value).topX)}
					y1={0}
					x2={useTransform(springPosition, value => getDiagonalPoints(value).bottomX)}
					y2={100}
					stroke="white"
					strokeWidth="0.2"
					strokeOpacity="0.9"
					filter="drop-shadow(0 0 2px rgba(255,255,255,0.5))"
				/>
			</motion.svg>

			{/* Subtle shadow along the diagonal line */}
			<motion.svg
				className="pointer-events-none absolute inset-0 z-9"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				<motion.line
					x1={useTransform(springPosition, value => getDiagonalPoints(value).topX)}
					y1={0}
					x2={useTransform(springPosition, value => getDiagonalPoints(value).bottomX)}
					y2={100}
					stroke="black"
					strokeWidth="0.3"
					strokeOpacity="0.1"
					filter="blur(1px)"
				/>
			</motion.svg>

			{/* SVG Slider Handle - CENTERED on the diagonal line using same geometry */}
			<motion.div
				className="absolute z-20 cursor-grab active:cursor-grabbing"
				style={{
					y: '-50%',
					x: '-50%',
					top: useTransform(springPosition, value => {
						// Y position at the center of the diagonal line (50% height)
						return '50%'
					}),
					scale: handleScale,
					rotate: handleRotation,
					// Position at the CENTER of the diagonal line using the same getDiagonalPoints logic
					left: useTransform(springPosition, value => {
						const { topX, bottomX } = getDiagonalPoints(value)
						// Calculate center point of the diagonal line
						return `${(topX + bottomX) / 2}%`
					}),
				}}
				onMouseDown={handleMouseDown}
				onTouchStart={handleMouseDown}
				whileHover={{ scale: 1.15 }}
				whileTap={{ scale: 0.95 }}
				transition={{ type: 'spring', stiffness: 400, damping: 25 }}
			>
				<motion.svg
					width="80"
					height="80"
					viewBox="0 0 80 80"
					className="drop-shadow-2xl"
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{
						type: 'spring',
						stiffness: 200,
						delay: 0.4,
						damping: 20,
					}}
				>
					{/* Enhanced SVG with better gradients and effects */}
					<defs>
						<linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
							<stop offset="50%" stopColor="#f8fafc" stopOpacity="0.9" />
							<stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.85" />
						</linearGradient>
						<linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#cbd5e1" />
							<stop offset="100%" stopColor="#94a3b8" />
						</linearGradient>
						<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="2" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
							<feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
						</filter>
					</defs>

					{/* Outer glow circle */}
					<circle cx="40" cy="40" r="35" fill="rgba(255,255,255,0.1)" filter="url(#glow)" />

					{/* Main circle */}
					<circle
						cx="40"
						cy="40"
						r="32"
						fill="url(#handleGradient)"
						stroke="url(#borderGradient)"
						strokeWidth="2"
						filter="url(#shadow)"
					/>

					{/* Inner decorative ring */}
					<circle cx="40" cy="40" r="25" fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />

					{/* Dynamic arrows that respond to position */}
					<motion.g
						animate={{ x: useTransform(springPosition, [0, 100], [-2, 2]) }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						<path
							d="M25 35 L18 40 L25 45 M55 35 L62 40 L55 45"
							stroke="#64748b"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							fill="none"
						/>
						{/* Center separator */}
						<line x1="32" y1="40" x2="48" y2="40" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
						{/* Dots for extra style */}
						<circle cx="35" cy="40" r="1.5" fill="#64748b" />
						<circle cx="40" cy="40" r="1.5" fill="#64748b" />
						<circle cx="45" cy="40" r="1.5" fill="#64748b" />
					</motion.g>
				</motion.svg>

				{/* Floating tooltip with spring animation */}
				<motion.div
					className="absolute -top-16 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-3 py-1 text-sm whitespace-nowrap text-white backdrop-blur-sm"
					initial={{ y: 10, opacity: 0 }}
					animate={{
						y: isDragging ? 0 : 10,
						opacity: isDragging ? 1 : 0,
					}}
					transition={{ type: 'spring', stiffness: 300, damping: 25 }}
				>
					{Math.round(springPosition.get())}%
				</motion.div>
			</motion.div>

			{/* Enhanced Labels with animations */}
			<motion.div
				className="absolute top-6 left-6 rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
				whileHover={{ scale: 1.05, bg: 'rgba(0,0,0,0.7)' }}
			>
				Avant
			</motion.div>
			<motion.div
				className="absolute top-6 right-6 rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
				initial={{ x: 20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 200, delay: 1 }}
				whileHover={{ scale: 1.05, bg: 'rgba(0,0,0,0.7)' }}
			>
				Après
			</motion.div>

			{/* Subtle instruction hint */}
			<motion.div
				className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, delay: 1.5 }}
				animate={{
					opacity: [1, 0.7, 1],
				}}
				transition={{
					repeat: Infinity,
					duration: 3,
					delay: 2,
				}}
			>
				Glissez en diagonal pour comparer
			</motion.div>
		</motion.div>
	)
}
