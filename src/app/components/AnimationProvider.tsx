'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

import { usePreloader } from './hooks/usePreloader'

interface AnimationContextType {
	isRiveAnimationComplete: boolean
	isContentReady: boolean
	setRiveAnimationComplete: () => void
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

	// Précharger les images pendant que le loader s'affiche
	const { isPreloadComplete } = usePreloader({
		images: ['/screens/bre.png', '/screens/dydy.png'],
		delay: 2000, // Commencer le préchargement après 2s
	})

	// Le contenu est prêt quand le préchargement est terminé ET l'animation Rive terminée
	const isContentReady = isRiveAnimationComplete && isPreloadComplete

	const setRiveAnimationComplete = () => {
		setIsRiveAnimationComplete(true)
	}

	return (
		<AnimationContext.Provider
			value={{
				setRiveAnimationComplete,
				isRiveAnimationComplete,
				isContentReady,
			}}
		>
			{children}
		</AnimationContext.Provider>
	)
}
