'use client'

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

import AnimationExplanation from './AnimationExplanation'
import { GlassElement } from './liquidglass'

export default function RiveLoader() {
	const [isVisible, setIsVisible] = useState(true)
	const [isCompletelyHidden, setIsCompletelyHidden] = useState(false)
	// we use that one when the rive animation is launched, so we can check if the page is loaded
	// but ONLY when the first and second animation are launched completely
	// we don't want to trigger the animation before
	const [canCheckIsLoaded, setCanCheckIsLoaded] = useState(false)

	const { RiveComponent, rive } = useRive({
		stateMachines: 'State Machine 1',
		src: '/rive/load_forhives.riv',
		onLoadError: error => {
			console.error('Rive loading error:', error)
		},
		onLoad: () => {
			console.log('Rive loaded successfully')
		},
		autoplay: true,
		artboard: 'Artboard',
	})

	// Use the correct state machine name
	const isStartedInput = useStateMachineInput(rive, 'State Machine 1', 'isStarted')
	const isStaleInput = useStateMachineInput(rive, 'State Machine 1', 'isStale')
	const isLoadedInput = useStateMachineInput(rive, 'State Machine 1', 'isLoaded')

	// Debug state machine inputs
	useEffect(() => {
		console.log('Debug - Rive instance:', rive)
		console.log('Debug - isStartedInput:', isStartedInput)
		console.log('Debug - isStaleInput:', isStaleInput)
		console.log('Debug - isLoadedInput:', isLoadedInput)

		if (rive) {
			console.log('Rive state machine names:', rive.stateMachineNames)
			// Try to get all inputs to see what's available
			const inputs = rive.stateMachineInputs('State Machine 1')
			console.log(
				'Available inputs in State Machine 1:',
				inputs?.map(i => i.name)
			)
		}
	}, [isStartedInput, isStaleInput, isLoadedInput, rive])

	// Track if we've already initialized to prevent multiple triggers
	const [isInitialized, setIsInitialized] = useState(false)

	// Set initial state and launch sequence
	useEffect(() => {
		console.log('Checking initialization conditions:', {
			initialized: isInitialized,
			hasStarted: !!isStartedInput,
			hasStale: !!isStaleInput,
			hasLoaded: !!isLoadedInput,
		})

		if (isStartedInput && isStaleInput && isLoadedInput && !isInitialized) {
			console.log('Initializing Rive state machine inputs')

			// First, log current values
			console.log('Current values BEFORE setting:', {
				isStarted: isStartedInput.value,
				isStale: isStaleInput.value,
				isLoaded: isLoadedInput.value,
			})

			// Set initial values - force them explicitly
			isStartedInput.value = false // Start with false
			isStaleInput.value = false
			isLoadedInput.value = false

			// Wait a bit then set isStarted to true to trigger transition
			setTimeout(() => {
				isStartedInput.value = true
				console.log('First animation launched (isStarted = true)', {
					isStarted: isStartedInput.value,
					isStale: isStaleInput.value,
					isLoaded: isLoadedInput.value,
				})
			}, 100)

			setIsInitialized(true)

			// Launch the timer to set isStale to true after 7s
			const staleTimer = setTimeout(() => {
				console.log('7s elapsed - triggering stale animation (isStale = true)')
				isStaleInput.value = true
				console.log('Values after setting isStale:', {
					isStarted: isStartedInput.value,
					isStale: isStaleInput.value,
					isLoaded: isLoadedInput.value,
				})
				setCanCheckIsLoaded(true)
			}, 7000)

			return () => clearTimeout(staleTimer)
		}
	}, [isStartedInput, isStaleInput, isLoadedInput])

	// useEffect(() => {
	// 	// trigger this when the second animation is launched completely
	// 	if (canCheckIsLoaded && isLoadedInput) {
	// 		// check if the page is loaded
	// 		const checkPageLoad = () => {
	// 			if (document.readyState === 'complete') {
	// 				// launch 3s counter then launch the last part of the animation
	// 				console.log('Page loaded, waiting 3s before triggering isLoaded')
	// 				const loadedTimer = setTimeout(() => {
	// 					console.log('Triggering final animation (isLoaded = true)')
	// 					isLoadedInput.value = true

	// 					// Wait 5s for final animation to complete, then wait 3s more before fade out
	// 					setTimeout(() => {
	// 						console.log('Final animation completed, waiting 3s more before fade out')
	// 						setTimeout(() => {
	// 							console.log('Starting fade out after final animation + 3s')
	// 							// todo: reactivate
	// 							// onLastAnimationCompleted()
	// 						}, 3000)
	// 					}, 3000)
	// 				}, 3000)

	// 				return () => clearTimeout(loadedTimer)
	// 			} else {
	// 				// If page not loaded yet, wait for it
	// 				window.addEventListener('load', checkPageLoad)
	// 				return () => window.removeEventListener('load', checkPageLoad)
	// 			}
	// 		}

	// 		checkPageLoad()
	// 	}
	// }, [canCheckIsLoaded, isLoadedInput])

	const onLastAnimationCompleted = () => {
		console.log('Hiding loader with fade out')
		setIsVisible(false)

		// After fade transition completes (0.5s), remove from DOM completely
		setTimeout(() => {
			console.log('Removing loader from DOM completely')
			setIsCompletelyHidden(true)
		}, 100)
	}

	// Completely remove from DOM after fade out
	if (isCompletelyHidden) {
		return null
	}

	return (
		<div
			className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center transition-opacity duration-500 ease-out ${
				isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
			}`}
		>
			<div className="relative h-screen w-screen items-center justify-center overflow-hidden">
				<RiveComponent
					style={{
						width: '120vw',
						transform: 'translateY(-10%) translateX(-10%)',
						objectFit: 'contain',
						height: '120vh',
					}}
				/>
				<div className="absolute bottom-10 left-1/2 -translate-x-1/2">
					<GlassElement width={350} height={180} radius={50} depth={10} blur={2} chromaticAberration={5}>
						<div className="relative flex h-full w-full flex-col items-center justify-end gap-4 pb-5 text-center">
							<AnimationExplanation />
							<div className="absolute bottom-0 left-1/2 -translate-x-1/2">
								<div className="flex items-center gap-2">
									<p className="text-sm text-white">Loading...</p>
									<div className="loader scale-[40%]" />
								</div>
							</div>
						</div>
					</GlassElement>
				</div>
			</div>
		</div>
	)
}
