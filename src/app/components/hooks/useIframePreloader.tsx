'use client'

import { useState, useEffect, useRef } from 'react'

interface IframePreloaderOptions {
	urls?: string[]
	delay?: number // delay before starting preloading
}

export function useIframePreloader({ urls = [], delay = 1000 }: IframePreloaderOptions = {}) {
	const [isPreloading, setIsPreloading] = useState(false)
	const [isPreloadComplete, setIsPreloadComplete] = useState(false)
	const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set())
	const iframesRef = useRef<HTMLIFrameElement[]>([])

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (urls.length === 0) {
				setIsPreloadComplete(true)
				return
			}

			console.info('Starting iframe preloading for URLs:', urls)
			setIsPreloading(true)

			// Create hidden iframes to preload
			const preloadPromises = urls.map((url, index) => {
				return new Promise<void>(resolve => {
					const iframe = document.createElement('iframe')
					iframe.src = url
					iframe.style.position = 'absolute'
					iframe.style.top = '-9999px'
					iframe.style.left = '-9999px'
					iframe.style.width = '1px'
					iframe.style.height = '1px'
					iframe.style.visibility = 'hidden'
					iframe.style.opacity = '0'

					let isCleanedUp = false

					const timeout = setTimeout(() => {
						console.warn(`Iframe preload timeout for ${url}`)
						cleanup()
						resolve()
					}, 15000)

					const cleanup = () => {
						if (isCleanedUp) return
						isCleanedUp = true

						clearTimeout(timeout)
						try {
							if (iframe.parentNode?.contains(iframe) === true) {
								iframe.parentNode.removeChild(iframe)
							}
						} catch (error) {
							// Silently handle the case where the node was already removed
							console.debug(`Node already removed for ${url}:`, error)
						}
					}

					iframe.onload = () => {
						console.info(`Iframe preloaded successfully: ${url}`)
						setLoadedUrls(prev => new Set(prev).add(url))
						cleanup()
						resolve()
					}

					iframe.onerror = error => {
						console.warn(`Iframe preload failed for ${url}:`, error)
						cleanup()
						resolve()
					}

					// Add the iframe to the DOM to trigger the loading
					document.body.appendChild(iframe)
					iframesRef.current[index] = iframe
				})
			})

			// Handle the Promise.all properly
			void Promise.all(preloadPromises)
				.then(() => {
					console.info('All iframes preloaded successfully')
					setIsPreloadComplete(true)
				})
				.catch(error => {
					console.warn('Some iframes failed to preload:', error)
					// We consider the preloading as complete even if some iframes fail
					setIsPreloadComplete(true)
				})
				.finally(() => {
					setIsPreloading(false)
				})
		}, delay)

		return () => {
			clearTimeout(timeoutId)
			// Clean up the iframes if the component is unmounted
			iframesRef.current.forEach(iframe => {
				try {
					if (iframe?.parentNode?.contains(iframe) === true) {
						iframe.parentNode.removeChild(iframe)
					}
				} catch (error) {
					// Silently handle the case where the node was already removed
					console.debug('Node already removed during cleanup:', error)
				}
			})
			// Clear the refs array
			iframesRef.current = []
		}
	}, [urls, delay])

	return {
		totalCount: urls.length,
		loadedUrls,
		loadedCount: loadedUrls.size,
		isPreloading,
		isPreloadComplete,
	}
}
