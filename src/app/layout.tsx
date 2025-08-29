import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'

import AppContent from './components/AppContent'

import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata = {
	title: 'ForHives - Collaborative Project Community',
	openGraph: {
		url: 'https://forhives.com',
		type: 'website',
		title: 'ForHives - Bring Your Projects to Life',
		images: [
			{
				width: 1200,
				url: 'https://forhives.com/og-image.svg',
				height: 630,
				alt: 'ForHives Logo',
			},
		],
		description: 'A collaborative community to transform your ideas into concrete projects',
	},
	keywords: ['ForHives', 'collaborative projects', 'innovation', 'community', 'project development'],
	description:
		"Join ForHives, the community where every hive is a project, every idea is a bee, and passion is the queen that governs them. Let's work together to bring your projects to life and change the world!",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="bg-black antialiased" suppressHydrationWarning>
			<Script
				async
				src="https://umami.wadefade.fr/script.js"
				strategy={'afterInteractive'}
				data-website-id="94a58ce1-c90b-4492-ae25-d3e894084c44"
			/>
			<body className={`${geistSans.variable} ${geistMono.variable} bg-black antialiased`}>
				<AppContent>{children}</AppContent>
			</body>
		</html>
	)
}
