'use client'

import { motion, useSpring, useMotionValue, useTransform } from 'motion/react'
import { useRef, useCallback } from 'react'

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

	// Motion values for smooth animations
	const basePosition = 75 // Position de base de la diagonale
	const sliderPosition = useMotionValue(basePosition)
	const springPosition = useSpring(sliderPosition, {
		stiffness: 400,
		mass: 0.6,
		damping: 25,
	})

	// Mouse position tracking
	const mouseX = useMotionValue(50)
	const mouseY = useMotionValue(50)

	// UNIFIED DIAGONAL GEOMETRY
	const getDiagonalPoints = useCallback((position: number) => {
		const diagonalOffset = 50 // Creates the diagonal angle
		return {
			topX: position,
			bottomX: Math.max(0, position - diagonalOffset),
		}
	}, [])

	// Calculate organic repelling effect - more responsive across entire screen
	const calculateRepellingPosition = useCallback(
		(mouseXPercent: number, mouseYPercent: number) => {
			// Calculate the distance from mouse to the current diagonal line position
			const currentDiagonalPoints = getDiagonalPoints(basePosition)
			const diagonalCenterX = (currentDiagonalPoints.topX + currentDiagonalPoints.bottomX) / 2
			const diagonalCenterY = 50 // Center of screen vertically

			// Distance from mouse to diagonal center
			const deltaX = mouseXPercent - diagonalCenterX
			const deltaY = mouseYPercent - diagonalCenterY

			// Calculate distance (simplified for performance)
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

			// More generous tolerance zone for better responsiveness
			const toleranceZone = 25 // Increased from 15 to 25 for wider effect
			
			if (distance < toleranceZone) {
				// Repelling strength based on distance
				const repelStrength = (toleranceZone - distance) / toleranceZone
				const maxRepel = 25 // Increased repel strength
				
				// Repel direction based on X position primarily (more intuitive)
				let repelDirection = 0
				if (Math.abs(deltaX) > Math.abs(deltaY)) {
					// Horizontal repelling is stronger
					repelDirection = deltaX > 0 ? -1 : 1 // Repel away from mouse
				} else {
					// Vertical influence on diagonal position
					repelDirection = deltaY > 0 ? 1 : -1
				}
				
				const repelAmount = repelStrength * maxRepel * repelDirection
				return Math.max(20, Math.min(90, basePosition + repelAmount))
			}

			// Gradual return to base position
			const currentPosition = sliderPosition.get()
			const returnSpeed = 0.1
			return currentPosition + (basePosition - currentPosition) * returnSpeed
		},
		[basePosition, getDiagonalPoints, sliderPosition]
	)

	// Handle mouse movement
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!containerRef.current) return

			const rect = containerRef.current.getBoundingClientRect()
			const x = e.clientX - rect.left
			const y = e.clientY - rect.top
			const xPercent = (x / rect.width) * 100
			const yPercent = (y / rect.height) * 100

			mouseX.set(xPercent)
			mouseY.set(yPercent)

			const newPosition = calculateRepellingPosition(xPercent, yPercent)
			sliderPosition.set(newPosition)
		},
		[calculateRepellingPosition, mouseX, mouseY, sliderPosition]
	)

	// Handle mouse leave
	const handleMouseLeave = useCallback(() => {
		sliderPosition.set(basePosition)
	}, [basePosition, sliderPosition])

	return (
		<motion.div
			ref={containerRef}
			className="relative h-screen w-screen cursor-none overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
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

			{/* Before Image with diagonal clip */}
			<motion.div
				className="absolute inset-0"
				style={{
					clipPath: useTransform(springPosition, value => {
						const { topX, bottomX } = getDiagonalPoints(value)
						return `polygon(0% 0%, ${topX}% 0%, ${bottomX}% 100%, 0% 100%)`
					}),
				}}
				initial={{ scale: 1.1 }}
				animate={{ scale: 1 }}
				transition={{ ease: 'easeOut', duration: 1, delay: 0.2 }}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</motion.div>

			{/* Diagonal Line */}
			<motion.svg
				className="pointer-events-none absolute inset-0 z-10"
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
					stroke="white"
					strokeWidth="0.2"
					strokeOpacity="0.9"
					filter="drop-shadow(0 0 2px rgba(255,255,255,0.5))"
				/>
			</motion.svg>

			{/* Custom cursor that follows mouse */}
			<motion.div
				className="pointer-events-none absolute z-30"
				style={{
					y: '-50%',
					x: '-50%',
					top: useTransform(mouseY, y => `${y}%`),
					left: useTransform(mouseX, x => `${x}%`),
				}}
				initial={{ scale: 0, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 300, damping: 25 }}
			>
				<svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-lg">
					<defs>
						<linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
							<stop offset="100%" stopColor="rgba(255,255,255,0.6)" />
						</linearGradient>
					</defs>
					<circle
						cx="20"
						cy="20"
						r="18"
						fill="url(#cursorGradient)"
						stroke="rgba(255,255,255,0.8)"
						strokeWidth="1"
						filter="drop-shadow(0 2px 8px rgba(0,0,0,0.2))"
					/>
					<g transform="translate(20,20)">
						<path
							d="M-8,-2 L8,-2 M-8,2 L8,2 M-2,-8 L-2,8 M2,-8 L2,8"
							stroke="rgba(100,116,139,0.8)"
							strokeWidth="1.5"
							strokeLinecap="round"
						/>
					</g>
				</svg>
			</motion.div>

			{/* Visual indicator on diagonal line */}
			<motion.div
				className="pointer-events-none absolute z-20"
				style={{
					y: '-50%',
					x: '-50%',
					top: '50%',
					scale: useTransform(springPosition, value => {
						const distance = Math.abs(value - basePosition)
						return 1 + distance / 30
					}),
					opacity: useTransform(springPosition, value => {
						const distance = Math.abs(value - basePosition)
						return distance > 2 ? 0.6 : 0
					}),
					left: useTransform(springPosition, value => {
						const { topX, bottomX } = getDiagonalPoints(value)
						return `${(topX + bottomX) / 2}%`
					}),
				}}
			>
				<svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-md">
					<circle
						cx="30"
						cy="30"
						r="25"
						fill="none"
						stroke="rgba(255,255,255,0.4)"
						strokeWidth="2"
						strokeDasharray="4 4"
					/>
					<circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.8)" />
				</svg>
			</motion.div>

			{/* Labels */}
			<motion.div
				className="absolute top-6 left-6 rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
				initial={{ x: -20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 200, delay: 0.8 }}
				whileHover={{ scale: 1.05 }}
			>
				Avant
			</motion.div>
			<motion.div
				className="absolute top-6 right-6 rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
				initial={{ x: 20, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ type: 'spring', stiffness: 200, delay: 1 }}
				whileHover={{ scale: 1.05 }}
			>
				Après
			</motion.div>

			{/* Instruction hint */}
			<motion.div
				className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, delay: 1.5 }}
			>
				Survolez pour repousser la ligne diagonale
			</motion.div>
		</motion.div>
	)
}
