'use client'

interface HeroAndyProps {
	isNavigationMode?: boolean
}

export default function HeroAndy({ isNavigationMode = false }: HeroAndyProps) {
	return (
		<div className="h-full w-full">
			{/* <div className="h-full w-full bg-blue-950"></div> */}
			{/* Iframe */}
			<iframe 
				src="https://andy-cinquin.com" 
				className={`h-full w-full border-0 ${
					isNavigationMode ? 'pointer-events-auto' : 'pointer-events-none'
				}`} 
				title="Andy Portfolio" 
			/>
		</div>
	)
}
