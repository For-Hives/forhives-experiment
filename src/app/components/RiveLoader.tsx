'use client'

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

interface RiveLoaderProps {
	onComplete?: () => void
}

export default function RiveLoader({ onComplete }: RiveLoaderProps) {
	const [isVisible, setIsVisible] = useState(true)

	const { RiveComponent, rive } = useRive({
		stateMachines: 'State Machine 1',
		src: '/rive/load_forhives.riv',
		autoplay: true,
		autoBind: true,
		artboard: 'Artboard',
	})

	const isStartedInput = useStateMachineInput(rive, undefined, 'isStarted')
	const isStaleInput = useStateMachineInput(rive, undefined, 'isStale')
	const isLoadedInput = useStateMachineInput(rive, undefined, 'isLoaded')

	// Set initial state: only isStarted = true, others = false
	useEffect(() => {
		console.log(isStartedInput, isStaleInput, isLoadedInput)
		if (isStartedInput && isStaleInput && isLoadedInput) {
			isStartedInput.value = true
			isStaleInput.value = false
			isLoadedInput.value = false
		}
	}, [isStartedInput, isStaleInput, isLoadedInput])

	// Remove page loading detection - keeping it simple

	// Remove automatic timers - keeping loader static with isStarted = true

	// Keep the loader visible with only isStarted = true
	// Remove automatic state changes and hiding

	if (!isVisible) {
		return null
	}

	return (
		<div
			className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black"
			style={{
				transition: 'opacity 0.3s ease-out',
				pointerEvents: isVisible ? 'auto' : 'none',
				opacity: isVisible ? 1 : 0,
			}}
		>
			<div className="h-screen w-screen items-center justify-center overflow-hidden">
				<RiveComponent
					style={{
						width: '120vw',
						transform: 'translateY(-10%) translateX(-10%)',
						objectFit: 'contain',
						height: '120vh',
					}}
				/>
			</div>
		</div>
	)
}
