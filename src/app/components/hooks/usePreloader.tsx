'use client'

import { useState, useEffect } from 'react'

interface PreloaderOptions {
	images?: string[]
	delay?: number // delay before starting the preloading
}

export function usePreloader({ images = [], delay = 1000 }: PreloaderOptions = {}) {
	const [isPreloading, setIsPreloading] = useState(false)
	const [isPreloadComplete, setIsPreloadComplete] = useState(false)

	useEffect(() => {
		const timeoutId = setTimeout(() => {
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

			// Handle the Promise.all properly
			void Promise.all(preloadPromises)
				.then(() => {
					setIsPreloadComplete(true)
				})
				.catch(() => {
					setIsPreloadComplete(true)
				})
				.finally(() => {
					setIsPreloading(false)
				})
		}, delay)

		return () => {
			clearTimeout(timeoutId)
		}
	}, [images, delay])

	return {
		isPreloading,
		isPreloadComplete,
	}
}
