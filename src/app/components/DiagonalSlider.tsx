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

	// Base diagonal position
	const basePosition = 75
	const diagonalPosition = useMotionValue(basePosition)
	const springDiagonal = useSpring(diagonalPosition, {
		stiffness: 150, // More organic movement
		mass: 1.2, // More inertia for magnetic feel
		damping: 15, // Less damping for more fluid motion
	})

	// Mouse tracking for cursor
	const mouseX = useMotionValue(50)
	const mouseY = useMotionValue(50)

	// Simple diagonal geometry
	const getDiagonalPoints = (position: number) => ({
		topX: position,
		bottomX: Math.max(0, position - 50),
	})

	// Calculate if cursor is within the diagonal path zone and determine push direction
	const calculatePathInteraction = useCallback((mouseXPercent: number, mouseYPercent: number, currentPos: number) => {
		const { topX, bottomX } = getDiagonalPoints(currentPos)

		// Line from top (topX, 0) to bottom (bottomX, 100)
		const lineStartX = topX
		const lineStartY = 0
		const lineEndX = bottomX
		const lineEndY = 100

		// Line vector
		const lineX = lineEndX - lineStartX
		const lineY = lineEndY - lineStartY
		const lineLength = Math.sqrt(lineX * lineX + lineY * lineY)

		if (lineLength === 0)
			return { t: 0, side: 0, screenProgress: 0.5, lineScreenProgress: 0.5, isInZone: false, distance: Infinity }

		// Vector from line start to mouse
		const toMouseX = mouseXPercent - lineStartX
		const toMouseY = mouseYPercent - lineStartY

		// Project mouse position onto the line (clamped to line segment)
		const dot = (toMouseX * lineX + toMouseY * lineY) / (lineLength * lineLength)
		const t = Math.max(0, Math.min(1, dot))

		// Closest point on line segment
		const closestX = lineStartX + t * lineX
		const closestY = lineStartY + t * lineY

		// Distance from mouse to closest point
		const distance = Math.sqrt((mouseXPercent - closestX) ** 2 + (mouseYPercent - closestY) ** 2)

		// Determine which side of line (cross product for direction)
		const cross = (mouseXPercent - lineStartX) * lineY - (mouseYPercent - lineStartY) * lineX
		const side = cross > 0 ? 1 : -1

		// Check if cursor is in the polygon detection zone
		// The zone follows the same path as the visible diagonal
		const detectionWidth = 30 // Width of detection zone around the line
		const isInZone = distance < detectionWidth && t > 0.05 && t < 0.95

		// Calculate screen progression based on cursor position
		// Left side of screen = 0, right side = 1
		const screenProgress = mouseXPercent / 100

		// Calculate where the line is on screen at cursor's Y position
		const cursorY = mouseYPercent
		const lineXAtCursorY = lineStartX + (cursorY / 100) * lineX
		const lineScreenProgress = lineXAtCursorY / 100

		return {
			t,
			side,
			screenProgress,
			lineScreenProgress,
			isInZone,
			distance,
			cursorY: mouseYPercent,
		}
	}, [])

	// Progressive cursor pushing with screen-edge boosting
	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!containerRef.current) return

			const rect = containerRef.current.getBoundingClientRect()
			const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100
			const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100

			// Update cursor position
			mouseX.set(mouseXPercent)
			mouseY.set(mouseYPercent)

			// Get current position and interaction data
			const currentPos = diagonalPosition.get()
			const { screenProgress, lineScreenProgress, isInZone, distance } = calculatePathInteraction(
				mouseXPercent,
				mouseYPercent,
				currentPos
			)

			if (isInZone) {
				// Calculate push direction based on cursor position relative to line
				const pushDirection = screenProgress < lineScreenProgress ? -1 : 1 // Left of line = push left, right = push right

				// Calculate how close cursor is to screen edges (0 = center, 1 = edge)
				const edgeProximity = Math.abs(screenProgress - 0.5) * 2

				// Boost effect when cursor is near screen edges
				const edgeBoost = Math.pow(edgeProximity, 1.8) * 1.5 + 1

				// Distance-based intensity (closer = stronger push)
				const proximityStrength = Math.pow(Math.max(0, 1 - distance / 30), 2)

				// Calculate progression boost: push toward the side of screen cursor is on
				let progressionBoost = 0
				if (pushDirection > 0) {
					// Pushing right: boost progression toward right edge (increase position)
					const rightProgress = Math.max(0, screenProgress - lineScreenProgress)
					progressionBoost = rightProgress * edgeBoost * proximityStrength * 25
				} else {
					// Pushing left: boost progression toward left edge (decrease position)
					const leftProgress = Math.max(0, lineScreenProgress - screenProgress)
					progressionBoost = -leftProgress * edgeBoost * proximityStrength * 25
				}

				// Apply the progression boost to diagonal position
				const targetPosition = basePosition + progressionBoost
				diagonalPosition.set(Math.max(15, Math.min(95, targetPosition)))
			} else {
				// Smooth return to base position when not in zone
				const current = diagonalPosition.get()
				const diff = basePosition - current
				const returnSpeed = Math.abs(diff) > 5 ? 0.15 : 0.08
				diagonalPosition.set(current + diff * returnSpeed)
			}
		},
		[calculatePathInteraction, mouseX, mouseY, basePosition]
	)

	const handleMouseLeave = useCallback(() => {
		// Smooth return to base position on mouse leave
		const current = diagonalPosition.get()
		const diff = basePosition - current
		if (Math.abs(diff) > 1) {
			// Animate back smoothly using spring
			diagonalPosition.set(basePosition)
		}
	}, [basePosition])

	return (
		<motion.div
			ref={containerRef}
			className="relative h-screen w-screen cursor-none overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
		>
			{/* After Image */}
			<div className="absolute inset-0">
				<Image src={afterImage} alt={afterAlt} fill className="object-cover" unoptimized priority />
			</div>

			{/* Before Image with diagonal clip */}
			<motion.div
				className="absolute inset-0"
				style={{
					clipPath: useTransform(springDiagonal, value => {
						const { topX, bottomX } = getDiagonalPoints(value)
						return `polygon(0% 0%, ${topX}% 0%, ${bottomX}% 100%, 0% 100%)`
					}),
				}}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</motion.div>

			{/* Simple diagonal line */}
			<motion.svg
				className="pointer-events-none absolute inset-0 z-10"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				<motion.line
					x1={useTransform(springDiagonal, value => getDiagonalPoints(value).topX)}
					y1={0}
					x2={useTransform(springDiagonal, value => getDiagonalPoints(value).bottomX)}
					y2={100}
					stroke="white"
					strokeWidth="0.15"
					strokeOpacity="0.8"
				/>
			</motion.svg>

			{/* Labels */}
			<div className="absolute top-6 left-6 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">Avant</div>
			<div className="absolute top-6 right-6 rounded-lg bg-black/50 px-3 py-2 text-sm font-medium text-white">
				Après
			</div>

			{/* Magnetic cursor */}
			<motion.div
				className="pointer-events-none absolute z-30"
				style={{
					y: '-50%',
					x: '-50%',
					top: useTransform(mouseY, y => `${y}%`),
					scale: useTransform(springDiagonal, value => {
						// Cursor grows when repelling (away from base position)
						const repelStrength = Math.abs(value - basePosition) / 20
						return 1 + repelStrength * 0.3
					}),
					left: useTransform(mouseX, x => `${x}%`),
				}}
			>
				{/* Magnetic cursor design */}
				<motion.svg
					width="60"
					height="60"
					viewBox="0 0 60 60"
					className="drop-shadow-lg"
					style={{
						rotate: useTransform(springDiagonal, value => {
							// Subtle rotation based on magnetic field
							return (value - basePosition) * 2
						}),
					}}
				>
					<defs>
						<radialGradient id="magnetGradient">
							<stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
							<stop offset="70%" stopColor="rgba(59,130,246,0.6)" />
							<stop offset="100%" stopColor="rgba(59,130,246,0.2)" />
						</radialGradient>
					</defs>

					{/* Magnetic field visualization */}
					<circle cx="30" cy="30" r="25" fill="url(#magnetGradient)" stroke="rgba(59,130,246,0.4)" strokeWidth="2" />

					{/* Magnetic core */}
					<circle cx="30" cy="30" r="12" fill="rgba(255,255,255,0.95)" stroke="rgba(59,130,246,0.8)" strokeWidth="2" />

					{/* Magnetic poles indicator */}
					<g transform="translate(30,30)">
						<path d="M-6,-3 L6,-3 M-6,3 L6,3" stroke="rgba(239,68,68,0.8)" strokeWidth="2.5" strokeLinecap="round" />
						<path d="M-3,-6 L-3,6 M3,-6 L3,6" stroke="rgba(59,130,246,0.8)" strokeWidth="2.5" strokeLinecap="round" />
					</g>
				</motion.svg>
			</motion.div>

			{/* Magnetic field strength indicator */}
			<motion.div
				className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
				style={{
					opacity: useTransform(springDiagonal, value => {
						const strength = Math.abs(value - basePosition) / 20
						return Math.min(1, 0.4 + strength)
					}),
				}}
			>
				Champ magnétique actif
			</motion.div>
		</motion.div>
	)
}
