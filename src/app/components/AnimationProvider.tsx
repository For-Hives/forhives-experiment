'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AnimationContextType {
	isRiveAnimationComplete: boolean
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

	const setRiveAnimationComplete = () => {
		setIsRiveAnimationComplete(true)
	}

	return (
		<AnimationContext.Provider
			value={{
				setRiveAnimationComplete,
				isRiveAnimationComplete,
			}}
		>
			{children}
		</AnimationContext.Provider>
	)
}
