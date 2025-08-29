'use client'

import { ReactNode } from 'react'

import { AnimationProvider, useAnimationContext } from './AnimationProvider'
import RiveLoader from './RiveLoader'

interface AppContentProps {
	children: ReactNode
}

function AppContentInner({ children }: AppContentProps) {
	const { setRiveAnimationComplete, isContentReady } = useAnimationContext()

	return (
		<>
			<RiveLoader onAnimationComplete={setRiveAnimationComplete} />
			{isContentReady && children}
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
