import { CSSProperties, ReactNode, useState } from 'react'

import { DisplacementOptions, getDisplacementFilter } from './getDisplacementFilter'
import { getDisplacementMap } from './getDisplacementMap'

type GlassElementProps = DisplacementOptions & {
	children?: ReactNode | undefined
	blur?: number
	debug?: boolean
}

export const GlassElement = ({
	width,
	strength,
	radius,
	height,
	depth: baseDepth,
	debug = false,
	chromaticAberration,
	children,
	blur = 2,
}: GlassElementProps) => {
	/* Change element depth on click */
	const [clicked, setClicked] = useState(false)
	const depth = baseDepth / (clicked ? 0.7 : 1)

	/* Dynamic CSS properties */
	const style: CSSProperties = {
		width: `${width}px`,
		height: `${height}px`,
		borderRadius: `${radius}px`,
		backdropFilter: `blur(${blur / 2}px) url('${getDisplacementFilter({
			width,
			strength,
			radius,
			height,
			depth,
			chromaticAberration,
		})}') blur(${blur}px) brightness(1.1) saturate(1.5) `,
	}

	/* Debug mode: display the displacement map instead of actual effect */
	if (debug === true) {
		style.background = `url("${getDisplacementMap({
			width,
			radius,
			height,
			depth,
		})}")`
		style.boxShadow = 'none'
	}
	return (
		<div
			className={'box-shadow-[inset_0_0_4px_0px_#fff] bg-[rgba(255,255,255,0.01)]'}
			style={style}
			onMouseDown={() => setClicked(true)}
			onMouseUp={() => setClicked(false)}
		>
			{children}
		</div>
	)
}
