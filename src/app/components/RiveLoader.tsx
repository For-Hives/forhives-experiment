'use client'

import { Fit, Layout, useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

import AnimationExplanation from './AnimationExplanation'
import { GlassElement } from './liquidglass'

interface RiveLoaderProps {
	onAnimationComplete?: () => void
	onPreloadStart?: () => void // New callback to start preloading 1s before
	onRiveDisplayed?: () => void // Callback when Rive is displayed and functional
	isPreloadComplete?: boolean // Preload state from context
}

export default function RiveLoader({ onRiveDisplayed, onAnimationComplete, isPreloadComplete }: RiveLoaderProps) {
	const [isVisible, setIsVisible] = useState(true)
	const [isCompletelyHidden, setIsCompletelyHidden] = useState(false)

	const { RiveComponent, rive } = useRive({
		stateMachines: 'State Machine 1',
		src: '/rive/load_forhives.riv',
		onLoadError: error => {
			console.error('Rive loading error:', error)
		},
		onLoad: () => {
			console.info('Rive loaded successfully')
			// Trigger callback with a small delay to ensure Rive is properly displayed
			setTimeout(() => {
				console.info('Rive is now displayed and ready - triggering background preload')
				onRiveDisplayed?.()
			}, 500)
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

	// Track animation phases and their completion times
	const [animationPhase, setAnimationPhase] = useState<'idle' | 'autostart' | 'idle_anim' | 'end_anim' | 'fade_up'>(
		'idle'
	)
	const [idleStartTime, setIdleStartTime] = useState<number>(0)

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

			// Set initial values - force them explicitly
			isStartedInput.value = false
			isStaleInput.value = false
			isLoadedInput.value = false

			setIsInitialized(true)

			// PHASE 1: Animation autostart - exactly 7 seconds
			setTimeout(() => {
				console.info('🚀 PHASE 1: Starting AUTOSTART animation (7s fixed)')
				setAnimationPhase('autostart')
				isStartedInput.value = true

				// After exactly 7 seconds, move to idle animation
				setTimeout(() => {
					console.info('⏰ 7 seconds elapsed - AUTOSTART complete, starting IDLE animation')
					setAnimationPhase('idle_anim')
					setIdleStartTime(Date.now())
					isStaleInput.value = true
				}, 7000)
			}, 100)
		}
	}, [isStartedInput, isStaleInput, isLoadedInput])

	// Monitor animation phases and trigger end animation when ready
	useEffect(() => {
		// Only proceed if we're in idle phase and inputs are available
		if (animationPhase !== 'idle_anim' || !isStaleInput || !isLoadedInput) return

		const checkIfReadyForEndAnimation = () => {
			const idleDuration = Date.now() - idleStartTime
			const isPageReady = document.readyState === 'complete'
			const minimumIdleDuration = 4000 // Minimum 3 seconds in idle

			console.info('🔍 Checking end animation readiness:', {
				minimumRequired: `${minimumIdleDuration}ms`,
				isPreloadComplete,
				isPageReady,
				idleDuration: `${idleDuration}ms`,
				canStartEnd: idleDuration >= minimumIdleDuration && isPageReady && isPreloadComplete,
			})

			if (idleDuration >= minimumIdleDuration && isPageReady && isPreloadComplete === true) {
				console.info('✅ Ready for END animation - IDLE minimum duration reached AND everything loaded')

				// PHASE 3: Animation end - 3 seconds
				setAnimationPhase('end_anim')
				isLoadedInput.value = true

				// After 3 seconds of end animation, trigger fade up
				setTimeout(() => {
					console.info('🎯 END animation complete (3s) - starting FADE UP')
					setAnimationPhase('fade_up')
					onLastAnimationCompleted()
				}, 5000)
			} else if (idleDuration < minimumIdleDuration) {
				// Wait for minimum idle duration
				const remainingTime = minimumIdleDuration - idleDuration
				console.info(`⏳ Waiting ${remainingTime}ms for minimum idle duration`)
				setTimeout(checkIfReadyForEndAnimation, remainingTime)
			} else {
				// Wait for loading to complete
				console.info('⏳ IDLE minimum reached, waiting for loading to complete...')
				setTimeout(checkIfReadyForEndAnimation, 500)
			}
		}

		checkIfReadyForEndAnimation()
	}, [animationPhase, idleStartTime, isStaleInput, isLoadedInput, isPreloadComplete])

	// Listen for preload completion to potentially speed up idle animation
	useEffect(() => {
		if (animationPhase === 'idle_anim' && isPreloadComplete === true) {
			console.info('📦 Preload completed - checking if we can speed up idle animation')

			const idleDuration = Date.now() - idleStartTime
			const minimumIdleDuration = 3000

			// If we've already waited the minimum and everything is loaded, trigger end animation immediately
			if (idleDuration >= minimumIdleDuration && document.readyState === 'complete') {
				console.info('🚀 Preload complete + minimum idle reached - triggering END animation early')
				// The existing useEffect will handle this automatically
			}
		}
	}, [isPreloadComplete, animationPhase, idleStartTime])

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
			className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center transition-opacity duration-1000 ease-out select-none ${
				isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
			}`}
			style={{ userSelect: 'none' }}
		>
			<div className="pointer-events-none relative h-screen w-screen items-center justify-center overflow-hidden select-none">
				<RiveComponent
					style={{
						width: '120vw',
						userSelect: 'none',
						transform: 'translateY(-10%) translateX(-10%)',
						pointerEvents: 'none',
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
