'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

import { useIframePreloader } from './hooks/useIframePreloader'

interface AnimationContextType {
	isRiveAnimationComplete: boolean
	isContentReady: boolean
	isPreloadComplete: boolean
	isRiveDisplayed: boolean
	setRiveAnimationComplete: () => void
	setPreloadStarted: () => void
	setRiveDisplayed: () => void
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined)

export function useAnimationContext() {
	const context = useContext(AnimationContext)
	if (!context) {
		throw new Error('useAnimationContext must be used within an AnimationProvider')
	}
	return context
}

interface AnimationProviderProps {
	children: ReactNode
}

export function AnimationProvider({ children }: AnimationProviderProps) {
	const [isRiveAnimationComplete, setIsRiveAnimationComplete] = useState(false)
	const [isRiveDisplayed, setIsRiveDisplayedState] = useState(false)

	// Only preload iframes when Rive is displayed and functional
	const { totalCount, loadedCount, isPreloadComplete } = useIframePreloader({
		urls: isRiveDisplayed ? ['https://andy-cinquin.com', 'https://brev.al'] : [],
		delay: 2000, // Additional delay after Rive is displayed
	})

	// Log progress for debug
	console.info(`Rive displayed: ${isRiveDisplayed}, Iframe preload progress: ${loadedCount}/${totalCount}`, {
		isPreloadComplete,
	})

	// Content is ready when preloading is complete AND Rive animation is finished
	const isContentReady = isRiveAnimationComplete && isPreloadComplete

	const setRiveAnimationComplete = () => {
		setIsRiveAnimationComplete(true)
	}

	const setRiveDisplayed = () => {
		console.info('Rive is now displayed and functional - starting background preload')
		setIsRiveDisplayedState(true)
	}

	// Legacy function for compatibility with RiveLoader
	const setPreloadStarted = () => {
		console.info('Iframe preload managed by Rive display state')
	}

	return (
		<AnimationContext.Provider
			value={{
				setRiveDisplayed,
				setRiveAnimationComplete,
				setPreloadStarted,
				isRiveDisplayed,
				isRiveAnimationComplete,
				isPreloadComplete,
				isContentReady,
			}}
		>
			{children}
		</AnimationContext.Provider>
	)
}
