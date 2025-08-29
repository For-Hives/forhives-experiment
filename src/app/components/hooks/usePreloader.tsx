'use client'

import { useState, useEffect } from 'react'

interface PreloaderOptions {
	images?: string[]
	delay?: number // délai avant de commencer le préchargement
}

export function usePreloader({ images = [], delay = 1000 }: PreloaderOptions = {}) {
	const [isPreloading, setIsPreloading] = useState(false)
	const [isPreloadComplete, setIsPreloadComplete] = useState(false)

	useEffect(() => {
		let timeoutId: NodeJS.Timeout = null

		const startPreloading = () => {
			if (images.length === 0) {
				setIsPreloadComplete(true)
				return
			}

			setIsPreloading(true)

			const preloadPromises = images.map(src => {
				return new Promise<void>((resolve, reject) => {
					const img = new Image()
					img.onload = () => resolve()
					img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
					img.src = src
				})
			})

			Promise.all(preloadPromises)
				.then(() => {
					setIsPreloadComplete(true)
				})
				.catch(() => {
					setIsPreloadComplete(true)
				})
				.finally(() => {
					setIsPreloading(false)
				})
		}

		timeoutId = setTimeout(startPreloading, delay)

		return () => {
			if (timeoutId != null) {
				clearTimeout(timeoutId)
			}
		}
	}, [images, delay])

	return {
		isPreloading,
		isPreloadComplete,
	}
}
