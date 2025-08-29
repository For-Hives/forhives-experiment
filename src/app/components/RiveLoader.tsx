'use client'

import { Fit, Layout, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

import AnimationExplanation from './AnimationExplanation'
import { GlassElement } from './liquidglass'

interface RiveLoaderProps {
	onAnimationComplete?: () => void
	onPreloadStart?: () => void // Nouveau callback pour démarrer le préchargement 1s avant
	isPreloadComplete?: boolean // État du préchargement depuis le contexte
}

export default function RiveLoader({ onAnimationComplete, isPreloadComplete }: RiveLoaderProps) {
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
			console.info('Rive loaded successfully')
		},
		layout: new Layout({
			fit: Fit.Cover,
		}),
		autoplay: true,
		artboard: 'Artboard',
	})

	// Use the correct state machine name
	const isStartedInput = useStateMachineInput(rive, 'State Machine 1', 'isStarted')
	const isStaleInput = useStateMachineInput(rive, 'State Machine 1', 'isStale')
	const isLoadedInput = useStateMachineInput(rive, 'State Machine 1', 'isLoaded')

	// Debug state machine inputs
	useEffect(() => {
		console.info('Debug - Rive instance:', rive)
		console.info('Debug - isStartedInput:', isStartedInput)
		console.info('Debug - isStaleInput:', isStaleInput)
		console.info('Debug - isLoadedInput:', isLoadedInput)

		if (rive) {
			console.info('Rive state machine names:', rive.stateMachineNames)
			// Try to get all inputs to see what's available
			const inputs = rive.stateMachineInputs('State Machine 1')
			console.info(
				'Available inputs in State Machine 1:',
				inputs?.map(i => i.name)
			)
		}
	}, [isStartedInput, isStaleInput, isLoadedInput, rive])

	// Track if we've already initialized to prevent multiple triggers
	const [isInitialized, setIsInitialized] = useState(false)

	// Set initial state and launch sequence
	useEffect(() => {
		console.info('Checking initialization conditions:', {
			initialized: isInitialized,
			hasStarted: !!isStartedInput,
			hasStale: !!isStaleInput,
			hasLoaded: !!isLoadedInput,
		})

		if (isStartedInput && isStaleInput && isLoadedInput && !isInitialized) {
			console.info('Initializing Rive state machine inputs')

			// First, log current values
			console.info('Current values BEFORE setting:', {
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
				console.info('First animation launched (isStarted = true)', {
					isStarted: isStartedInput.value,
					isStale: isStaleInput.value,
					isLoaded: isLoadedInput.value,
				})
			}, 100)

			setIsInitialized(true)

			// Launch the timer to set isStale to true after 7s
			const staleTimer = setTimeout(() => {
				console.info('7s elapsed - triggering stale animation (isStale = true)')
				isStaleInput.value = true
				console.info('Values after setting isStale:', {
					isStarted: isStartedInput.value,
					isStale: isStaleInput.value,
					isLoaded: isLoadedInput.value,
				})
				setCanCheckIsLoaded(true)
			}, 7000)

			return () => clearTimeout(staleTimer)
		}
	}, [isStartedInput, isStaleInput, isLoadedInput])

	useEffect(() => {
		// trigger this when the second animation is launched completely
		if (canCheckIsLoaded && isLoadedInput) {
			// check if the page is loaded AND preload is complete
			const checkReadyForFinalAnimation = () => {
				const isPageReady = document.readyState === 'complete'
				console.info('Checking readiness:', { isPreloadComplete, isPageReady })

				if (isPageReady && isPreloadComplete != null) {
					console.info('Page and preload ready - triggering final animation immediately')
					isLoadedInput.value = true

					// Wait 3s for final animation to complete, then start fade out
					setTimeout(() => {
						console.info('Final animation completed - starting immediate fade out')
						onLastAnimationCompleted()
					}, 3000)
				} else if (isPageReady && isPreloadComplete != null) {
					console.info('Page ready but preload still in progress - waiting for preload')
					// On attend que le préchargement soit terminé
				} else {
					// If page not loaded yet, wait for it
					window.addEventListener('load', checkReadyForFinalAnimation)
					return () => window.removeEventListener('load', checkReadyForFinalAnimation)
				}
			}

			checkReadyForFinalAnimation()
		}
	}, [canCheckIsLoaded, isLoadedInput, isPreloadComplete])

	// Effect pour déclencher l'animation finale quand le préchargement se termine
	useEffect(() => {
		if (canCheckIsLoaded && isLoadedInput && isPreloadComplete != null && document.readyState === 'complete') {
			console.info('Preload just completed - checking if final animation should start')
			if (isLoadedInput.value == false) {
				console.info('Triggering final animation now that preload is complete')
				isLoadedInput.value = true

				setTimeout(() => {
					console.info('Final animation completed - starting immediate fade out')
					onLastAnimationCompleted()
				}, 3000)
			}
		}
	}, [isPreloadComplete, canCheckIsLoaded, isLoadedInput])

	const onLastAnimationCompleted = () => {
		console.info('Animation complete - starting fade out and enabling content')

		// Call the callback to notify that animation is complete (enable shader and content)
		onAnimationComplete?.()

		// Start fade out after a short delay to let shader start loading
		setTimeout(() => {
			console.info('Starting loader fade out')
			setIsVisible(false)

			// After fade transition completes (1s), remove from DOM completely
			setTimeout(() => {
				console.info('Removing loader from DOM completely')
				setIsCompletelyHidden(true)
			}, 1000)
		}, 500)
	}

	// Completely remove from DOM after fade out
	if (isCompletelyHidden) {
		return null
	}

	return (
		<div
			className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center transition-opacity duration-1000 ease-out ${
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
				<div className="absolute bottom-10 left-1/2 hidden -translate-x-1/2 lg:block">
					<GlassElement width={350} height={180} radius={50} depth={10} blur={2} chromaticAberration={5}>
						<div className="relative flex h-full w-full flex-col items-center justify-end gap-4 pb-5 text-center">
							<AnimationExplanation />
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
								<div className="flex items-center gap-2">
									<p className="text-sm text-white">Loading...</p>
								</div>
							</div>
						</div>
					</GlassElement>
				</div>
				<div className="absolute bottom-24 left-1/2 block -translate-x-1/2 lg:hidden">
					<GlassElement width={300} height={150} radius={50} depth={10} blur={2} chromaticAberration={5}>
						<div className="relative flex h-full w-full flex-col items-center justify-end gap-4 pb-5 text-center">
							<AnimationExplanation />
							<div className="absolute bottom-4 left-1/2 -translate-x-1/2">
								<div className="flex items-center gap-2">
									<p className="text-sm text-white">Loading...</p>
								</div>
							</div>
						</div>
					</GlassElement>
				</div>
			</div>
		</div>
	)
}
