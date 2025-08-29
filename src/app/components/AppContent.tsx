'use client'

import { ReactNode } from 'react'

import { AnimationProvider, useAnimationContext } from './AnimationProvider'
import RiveLoader from './RiveLoader'

interface AppContentProps {
	children: ReactNode
}

function AppContentInner({ children }: AppContentProps) {
	const { setRiveAnimationComplete, setPreloadStarted, isPreloadComplete } = useAnimationContext()

	return (
		<>
			<RiveLoader
				onAnimationComplete={setRiveAnimationComplete}
				onPreloadStart={setPreloadStarted}
				isPreloadComplete={isPreloadComplete}
			/>
			{children}
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
