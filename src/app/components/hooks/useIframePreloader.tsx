'use client'

import { useState, useEffect, useRef } from 'react'

interface IframePreloaderOptions {
	urls?: string[]
	delay?: number // délai avant de commencer le préchargement
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

			// Créer des iframes cachées pour précharger
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

					const timeout = setTimeout(() => {
						console.warn(`Iframe preload timeout for ${url}`)
						cleanup()
						resolve()
					}, 15000)

					const cleanup = () => {
						clearTimeout(timeout)
						if (iframe.parentNode) {
							iframe.parentNode.removeChild(iframe)
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
						resolve() // On considère comme "chargé" même en cas d'erreur
					}

					// Ajouter l'iframe au DOM pour déclencher le chargement
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
					// On considère quand même le préchargement comme terminé
					setIsPreloadComplete(true)
				})
				.finally(() => {
					setIsPreloading(false)
				})
		}, delay)

		return () => {
			clearTimeout(timeoutId)
			// Nettoyer les iframes si le composant est démonté
			iframesRef.current.forEach(iframe => {
				if (iframe?.parentNode != null) {
					iframe.parentNode.removeChild(iframe)
				}
			})
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
