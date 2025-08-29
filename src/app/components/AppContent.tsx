'use client'

import { ReactNode } from 'react'

import { AnimationProvider, useAnimationContext } from './AnimationProvider'
import RiveLoader from './RiveLoader'

interface AppContentProps {
	children: ReactNode
}

function AppContentInner({ children }: AppContentProps) {
	const { setRiveAnimationComplete, setPreloadStarted, setRiveDisplayed, isPreloadComplete, isRiveDisplayed } = useAnimationContext()

	return (
		<>
			<RiveLoader
				onAnimationComplete={setRiveAnimationComplete}
				onPreloadStart={setPreloadStarted}
				onRiveDisplayed={setRiveDisplayed}
				isPreloadComplete={isPreloadComplete}
			/>
			{/* N'afficher le contenu QUE quand Rive est affiché - pas même dans le DOM avant */}
			{isRiveDisplayed && children}
		</>
	)
}

export default function AppContent({ children }: AppContentProps) {
	return (
		<AnimationProvider>
			<AppContentInner>{children}</AppContentInner>
		</AnimationProvider>
	)
}
