'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'motion/react'

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
	const [sliderPosition, setSliderPosition] = useState(50) // Percentage
	const [isDragging, setIsDragging] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const handleMouseDown = useCallback(() => {
		setIsDragging(true)
	}, [])

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	const updateSliderPosition = useCallback((clientX: number, clientY: number) => {
		if (!containerRef.current) return

		const rect = containerRef.current.getBoundingClientRect()
		const containerWidth = rect.width
		const containerHeight = rect.height

		// Calculate position along diagonal (top-left to bottom-right)
		const x = clientX - rect.left
		const y = clientY - rect.top

		// Project point onto diagonal line
		const diagonalLength = Math.sqrt(containerWidth * containerWidth + containerHeight * containerHeight)
		const dotProduct = (x * containerWidth + y * containerHeight) / diagonalLength
		const percentage = Math.max(0, Math.min(100, (dotProduct / diagonalLength) * 100))

		setSliderPosition(percentage)
	}, [])

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (!isDragging) return
			updateSliderPosition(e.clientX, e.clientY)
		},
		[isDragging, updateSliderPosition]
	)

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!isDragging) return
			const touch = e.touches[0]
			updateSliderPosition(touch.clientX, touch.clientY)
		},
		[isDragging, updateSliderPosition]
	)

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			updateSliderPosition(e.clientX, e.clientY)
		},
		[updateSliderPosition]
	)

	// Calculate diagonal line position
	const diagonalOffset = sliderPosition
	const clipPath = `polygon(0% 0%, ${diagonalOffset}% 0%, ${Math.max(0, diagonalOffset - 20)}% 100%, 0% 100%)`

	return (
		<div
			ref={containerRef}
			className="relative h-screen w-screen cursor-grab overflow-hidden select-none"
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleMouseUp}
			onClick={handleClick}
			style={{ touchAction: 'none' }}
		>
			{/* After Image (Right/Bottom) */}
			<div className="absolute inset-0">
				<Image src={afterImage} alt={afterAlt} fill className="object-cover" unoptimized priority />
			</div>

			{/* Before Image (Left/Top) with diagonal clip */}
			<div
				className="absolute inset-0 transition-all duration-100 ease-out"
				style={{
					clipPath,
				}}
			>
				<Image src={beforeImage} alt={beforeAlt} fill className="object-cover" unoptimized priority />
			</div>

			{/* Diagonal Line */}
			<div
				className="pointer-events-none absolute top-0 left-0 h-full w-full"
				style={{
					background: `linear-gradient(135deg, transparent ${diagonalOffset - 0.1}%, #fff ${diagonalOffset}%, transparent ${diagonalOffset + 0.1}%)`,
				}}
			/>

			{/* SVG Slider Handle */}
			<div
				className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transform cursor-grab active:cursor-grabbing"
				style={{
					top: `${100 - diagonalOffset}%`,
					left: `${diagonalOffset}%`,
				}}
				onMouseDown={handleMouseDown}
				onTouchStart={handleMouseDown}
			>
				<svg
					width="60"
					height="60"
					viewBox="0 0 60 60"
					className="drop-shadow-lg transition-transform duration-200 hover:scale-110"
				>
					{/* Outer circle with gradient */}
					<defs>
						<linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#ffffff" />
							<stop offset="100%" stopColor="#f3f4f6" />
						</linearGradient>
						<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
							<feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
						</filter>
					</defs>
					<circle
						cx="30"
						cy="30"
						r="28"
						fill="url(#handleGradient)"
						stroke="#e5e7eb"
						strokeWidth="2"
						filter="url(#shadow)"
					/>
					{/* Inner arrows */}
					<path
						d="M20 25 L15 30 L20 35 M40 25 L45 30 L40 35"
						stroke="#6b7280"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						fill="none"
					/>
					{/* Center line */}
					<line x1="25" y1="30" x2="35" y2="30" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
				</svg>
			</div>

			{/* Labels */}
			<div className="absolute top-4 left-4 rounded-lg bg-black/50 px-3 py-1 text-sm font-medium text-white">Avant</div>
			<div className="absolute top-4 right-4 rounded-lg bg-black/50 px-3 py-1 text-sm font-medium text-white">
				Après
			</div>
		</div>
	)
}
