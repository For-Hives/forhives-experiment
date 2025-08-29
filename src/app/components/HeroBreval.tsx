'use client'

interface HeroBrevalProps {
	isNavigationMode?: boolean
}

export default function HeroBreval({ isNavigationMode = false }: HeroBrevalProps) {
	return (
		<div className="h-full w-full">
			{/* <div className="h-full w-full bg-red-950"></div> */}
			{/* Iframe */}
			<iframe 
				src="https://brev.al" 
				className={`h-full w-full border-0 ${
					isNavigationMode ? 'pointer-events-auto' : 'pointer-events-none'
				}`} 
				title="Breval Portfolio" 
			/>
		</div>
	)
}
