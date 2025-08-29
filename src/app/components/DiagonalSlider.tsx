'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import { motion } from 'motion/react'

import Image from 'next/image'

// Global configuration for the "electric arc" divider. Tweak values here.
export const ELECTRIC_CONFIG = {
	timeClampSec: 0.05, // clamp for RAF delta to avoid big jumps
	// SVG/styling
	svg: {
		strokes: {
			outer: { width: 3, color: 'rgba(173,216,230,0.75)' }, // wide soft halo
			mid: { width: 2.2, color: 'rgba(135,206,250,0.55)' }, // sky-blue glow
			core: { width: 1.2, opacity: 0.95, color: 'white' }, // bright inner line
		},
		glowBlur: 0.9,
	},

	speeds: [-1.32, 0.42, 0.95],
	// Extra shimmer/noise layer
	shimmer: {
		speed: 4.2,
		freq: 8.5,
		amp: 0.25,
	},
	// Geometry/details
	segments: 48, // polyline resolution (higher = smoother, heavier)

	freqs: [0.7, 2.7, 3.9],

	// Motion smoothing for divider position
	easeStiffness: 6, // higher = faster easing
	clipOffset: 25, // diagonal offset between top and bottom X in percent

	// Multi-frequency wave settings
	amps: [0.4, -0.8, 0.6],
} as const

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
	// Smooth display position (manual spring-ish lerp) to keep motion organic
	const [displayPos, setDisplayPos] = useState(60)
	// Time accumulator for wave animation
	const [time, setTime] = useState(0)

	// Animation loop: advance time and gently ease displayPos towards target position
	useEffect(() => {
		let raf = 0
		let last = performance.now()
		const tick = (now: number) => {
			const dt = Math.min(ELECTRIC_CONFIG.timeClampSec, (now - last) / 1000) // clamp to avoid large jumps
			last = now

			// Advance time for wave motion
			setTime(t => t + dt)

			// Critically damped-like easing (manual spring-ish)
			setDisplayPos(p => {
				const target = position
				const stiffness = ELECTRIC_CONFIG.easeStiffness // larger = faster
				return p + (target - p) * (1 - Math.exp(-stiffness * dt))
			})

			raf = requestAnimationFrame(tick)
		}
		raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(raf)
	}, [position])
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

	// Utility: clamp a number between 0..100
	const clamp01_100 = (v: number) => Math.max(0, Math.min(100, v))

	// Generate wavy diagonal points and corresponding clip-path polygon
	const { polyPointsStr, clipPolygonStr } = useMemo<{ polyPointsStr: string; clipPolygonStr: string }>(() => {
		// How many segments to approximate the wave (more => smoother but heavier)
		const SEGMENTS = ELECTRIC_CONFIG.segments
		// Wave palette: multi-frequency sines for "electric" chaos
		const AMPS = ELECTRIC_CONFIG.amps
		const FREQS = ELECTRIC_CONFIG.freqs
		const SPEEDS = ELECTRIC_CONFIG.speeds

		const topX = clamp01_100(displayPos)
		const bottomX = clamp01_100(displayPos - ELECTRIC_CONFIG.clipOffset)

		const pts: Array<{ x: number; y: number }> = []
		for (let i = 0; i <= SEGMENTS; i++) {
			const tNorm = i / SEGMENTS // 0..1 top->bottom
			const y = tNorm * 100
			const base = topX * (1 - tNorm) + bottomX * tNorm
			// Multi-layer wave offset
			let off = 0
			for (let k = 0; k < AMPS.length; k++) {
				off += AMPS[k] * Math.sin(2 * Math.PI * (FREQS[k] * tNorm + SPEEDS[k] * time) + k * 1.3)
			}
			// A tiny high-frequency shimmer
			off +=
				ELECTRIC_CONFIG.shimmer.amp *
				Math.sin(2 * Math.PI * (ELECTRIC_CONFIG.shimmer.freq * tNorm + ELECTRIC_CONFIG.shimmer.speed * time))

			const x = clamp01_100(base + off)
			pts.push({ y, x })
		}

		// Build SVG polyline points string (viewBox 0..100)
		const polyPointsStr = pts.map(p => `${p.x},${p.y}`).join(' ')

		// Build CSS polygon() for clipping the left layer (clockwise)
		// Start top-left corner, then along the wavy edge from top->bottom, then bottom-left
		const edgePoints = pts
			// Ensure we include explicit top and bottom edge with precise y (already have 0 and 100)
			.map(p => `${p.x}% ${p.y}%`)
			.join(', ')
		const clipPolygonStr = `polygon(0% 0%, ${edgePoints}, 0% 100%)`

		return { polyPointsStr, clipPolygonStr }
	}, [displayPos, time])

	// Typed style for vendor-prefixed clip-path
	const leftClipStyle: CSSProperties & { WebkitClipPath?: string } = {
		WebkitClipPath: clipPolygonStr,
		clipPath: clipPolygonStr,
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

			{/* Left Component/Image - Wavy Clipped Layer */}
			<div className="absolute inset-0 overflow-hidden" style={leftClipStyle}>
				<div className="h-full w-full">
					{leftComponent ??
						(leftImage != null && (
							<Image src={leftImage} alt={leftAlt} fill className="object-cover" unoptimized priority />
						))}
				</div>
			</div>
			{/* Minimalist center border SVG - motion animated */}
			<svg
				className="pointer-events-none absolute inset-0 z-30"
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
			>
				<defs>
					<filter id="electric-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation={ELECTRIC_CONFIG.svg.glowBlur} result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Electric multi-layer polylines */}
				<polyline
					points={polyPointsStr}
					fill="none"
					stroke={ELECTRIC_CONFIG.svg.strokes.mid.color}
					strokeWidth={ELECTRIC_CONFIG.svg.strokes.mid.width}
					vectorEffect="non-scaling-stroke"
					filter="url(#electric-glow)"
				/>
				<polyline
					points={polyPointsStr}
					fill="none"
					stroke={ELECTRIC_CONFIG.svg.strokes.core.color}
					strokeOpacity={ELECTRIC_CONFIG.svg.strokes.core.opacity}
					strokeWidth={ELECTRIC_CONFIG.svg.strokes.core.width}
					vectorEffect="non-scaling-stroke"
				/>
				<polyline
					points={polyPointsStr}
					fill="none"
					stroke={ELECTRIC_CONFIG.svg.strokes.outer.color}
					strokeWidth={ELECTRIC_CONFIG.svg.strokes.outer.width}
					vectorEffect="non-scaling-stroke"
					filter="url(#electric-glow)"
				/>
			</svg>
		</motion.div>
	)
}
