'use client'

interface HeroExampleProps {
	title: string
	subtitle: string
	backgroundColor: string
	textColor?: string
}

export default function HeroExample({ 
	title, 
	subtitle, 
	backgroundColor,
	textColor = "white" 
}: HeroExampleProps) {
	return (
		<div 
			className="h-full w-full flex items-center justify-center"
			style={{ backgroundColor }}
		>
			<div className="text-center px-8">
				<h1 
					className="text-6xl font-bold mb-4"
					style={{ color: textColor }}
				>
					{title}
				</h1>
				<p 
					className="text-xl opacity-80"
					style={{ color: textColor }}
				>
					{subtitle}
				</p>
			</div>
		</div>
	)
}