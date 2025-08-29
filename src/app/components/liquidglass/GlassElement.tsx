'use client'

import React, { ReactNode } from 'react'
import { getDisplacementFilter } from './getDisplacementFilter'

export interface GlassElementProps {
	children?: ReactNode
	width: number
	height: number
	radius: number
	depth: number
	blur?: number
	chromaticAberration?: number
	strength?: number
	debug?: boolean
	className?: string
	onClick?: () => void
}

export const GlassElement: React.FC<GlassElementProps> = ({
	children,
	width,
	height,
	radius,
	depth,
	blur = 2,
	chromaticAberration = 0,
	strength = 100,
	debug = false,
	className = '',
	onClick
}) => {
	const displacementFilter = getDisplacementFilter({
		height,
		width,
		radius,
		depth,
		strength,
		chromaticAberration
	})

	const glassStyles = {
		width: `${width}px`,
		height: `${height}px`,
		borderRadius: `${radius}px`,
		background: 'rgba(255, 255, 255, 0.4)',
		boxShadow: `inset 0 0 4px 0px rgba(255, 255, 255, 0.8)`,
		backdropFilter: `blur(${blur}px)`,
		WebkitBackdropFilter: `blur(${blur}px)`,
		filter: debug ? 'none' : `url("${displacementFilter}")`,
		cursor: onClick ? 'pointer' : 'default',
		border: '1px solid rgba(255, 255, 255, 0.2)',
		position: 'relative' as const,
		overflow: 'hidden' as const
	}

	return (
		<div
			className={`glass-element ${className}`}
			style={glassStyles}
			onClick={onClick}
		>
			{/* Effet de reflet supplémentaire */}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '30%',
					background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
					borderRadius: `${radius}px ${radius}px 0 0`,
					pointerEvents: 'none'
				}}
			/>
			
			{/* Contenu */}
			<div
				style={{
					padding: '16px',
					position: 'relative',
					zIndex: 2,
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'rgba(0, 0, 0, 0.8)'
				}}
			>
				{children}
			</div>
		</div>
	)
}