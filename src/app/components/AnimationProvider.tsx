'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

import { useIframePreloader } from './hooks/useIframePreloader'

interface AnimationContextType {
	isRiveAnimationComplete: boolean
	isContentReady: boolean
	isPreloadComplete: boolean
	setRiveAnimationComplete: () => void
	setPreloadStarted: () => void
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

	// Précharger les iframes immédiatement quand l'app se charge
	const { totalCount, loadedCount, isPreloadComplete } = useIframePreloader({
		urls: ['https://andy-cinquin.com', 'https://brev.al'],
		delay: 1000, // Commencer après 1s pour laisser Rive s'initialiser
	})

	// Log du progress pour debug
	console.info(`Iframe preload progress: ${loadedCount}/${totalCount}`, { isPreloadComplete })

	// Le contenu est prêt quand le préchargement est terminé ET l'animation Rive terminée
	const isContentReady = isRiveAnimationComplete && isPreloadComplete

	const setRiveAnimationComplete = () => {
		setIsRiveAnimationComplete(true)
	}

	// Fonction legacy pour compatibilité avec RiveLoader
	const setPreloadStarted = () => {
		console.info('Iframe preload already started automatically')
	}

	return (
		<AnimationContext.Provider
			value={{
				setRiveAnimationComplete,
				setPreloadStarted,
				isRiveAnimationComplete,
				isPreloadComplete,
				isContentReady,
			}}
		>
			{children}
		</AnimationContext.Provider>
	)
}
