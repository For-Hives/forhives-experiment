import Image from 'next/image'

export default function Home() {
	return (
		<main className="flex min-h-screen min-w-screen flex-col items-center justify-between">
			<div className="h-screen w-screen">
				<div className="relative h-full w-full bg-blue-500">
					<Image src="/screens/bre.png" alt="logo" sizes="100vw" fill className="object-cover" unoptimized />
				</div>
			</div>
			<div className="h-screen w-screen">
				<div className="relative h-full w-full bg-red-500">
					<Image src="/screens/dydy.png" alt="logo" sizes="100vw" fill className="object-cover" unoptimized />
				</div>
			</div>
		</main>
	)
}
