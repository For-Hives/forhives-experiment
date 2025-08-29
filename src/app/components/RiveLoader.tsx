'use client'

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'

export default function RiveLoader() {
	const [isVisible, setIsVisible] = useState(true)
	// we use that one when the rive animation is launched, so we can check if the page is loaded
	// but ONLY when the first and second animation are launched completely
	// we don't want to trigger the animation before
	const [canCheckIsLoaded, setCanCheckIsLoaded] = useState(false)

	const { RiveComponent, rive } = useRive({
		stateMachines: 'State Machine 1',
		src: '/rive/load_forhives.riv',
		artboard: 'Artboard',
		autoplay: true,
		onLoad: () => {
			console.log('Rive loaded successfully')
		},
		onLoadError: (error) => {
			console.error('Rive loading error:', error)
		},
	})

	const isStartedInput = useStateMachineInput(rive, 'State Machine 1', 'isStarted')
	const isStaleInput = useStateMachineInput(rive, 'State Machine 1', 'isStale')
	const isLoadedInput = useStateMachineInput(rive, 'State Machine 1', 'isLoaded')

	// Set initial state: only isStarted = true, others = false
	useEffect(() => {
		if (isStartedInput && isStaleInput && isLoadedInput) {
			// we get there when the page is loaded

			// If it's the first load, we have everything as false, so we can setup the first ( isStarted value to 'true' )
			// to launch the first animation
			if (isStartedInput.value === false && isStaleInput.value === false && isLoadedInput.value === false) {
				isStartedInput.value = true
				isStaleInput.value = false
				isLoadedInput.value = false
				console.log('First animation launched (isStarted = true)')
				
				// at the same time, launch the timer to set isStale to true ( so we can launch the second animation [stale] )
				const staleTimer = setTimeout(() => {
					console.log('staleTimer launched - triggering isStale')
					isStaleInput.value = true
					setCanCheckIsLoaded(true)
				}, 7000)
				
				return () => clearTimeout(staleTimer)
			}
		}
	}, [isStartedInput, isStaleInput, isLoadedInput])

	useEffect(() => {
		// trigger this when the second animation is launched completely
		if (canCheckIsLoaded && isLoadedInput) {
			// check if the page is loaded
			const checkPageLoad = () => {
				if (document.readyState === 'complete') {
					// launch 3s counter then launch the last part of the animation
					console.log('Page loaded, waiting 3s before triggering isLoaded')
					const loadedTimer = setTimeout(() => {
						console.log('Triggering final animation (isLoaded = true)')
						isLoadedInput.value = true
						
						// Launch "onLastAnimationCompleted" after 3s
						setTimeout(() => {
							console.log('Starting fade out')
							onLastAnimationCompleted()
						}, 3000)
					}, 3000)
					
					return () => clearTimeout(loadedTimer)
				} else {
					// If page not loaded yet, wait for it
					window.addEventListener('load', checkPageLoad)
					return () => window.removeEventListener('load', checkPageLoad)
				}
			}
			
			checkPageLoad()
		}
	}, [canCheckIsLoaded, isLoadedInput])

	const onLastAnimationCompleted = () => {
		console.log('Hiding loader with fade out')
		setIsVisible(false)
	}

	return (
		<div
			className={`fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black transition-opacity duration-500 ease-out ${
				isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
			}`}
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