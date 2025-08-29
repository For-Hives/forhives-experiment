'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GlassElement } from './GlassElement'

export interface LoadingPopupProps {
	isVisible: boolean
	title?: string
	message?: string
	onClose?: () => void
	className?: string
}

export const LoadingPopup: React.FC<LoadingPopupProps> = ({
	isVisible,
	title = 'Loading...',
	message = 'Please wait while we process your request.',
	onClose,
	className = ''
}) => {
	return (
		<AnimatePresence>
			{isVisible && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
						onClick={onClose}
					>
						{/* Popup Container */}
						<motion.div
							initial={{ scale: 0.8, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.8, opacity: 0, y: 20 }}
							transition={{
								duration: 0.4,
								ease: [0.16, 1, 0.3, 1] // Apple-like easing
							}}
							onClick={(e) => e.stopPropagation()}
							className={className}
						>
							<GlassElement
								width={320}
								height={200}
								radius={20}
								depth={10}
								blur={4}
								chromaticAberration={2}
								strength={80}
							>
								<div className="flex flex-col items-center text-center">
									{/* Loading Spinner */}
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: 'linear'
										}}
										className="mb-4"
									>
										<svg
											width="32"
											height="32"
											viewBox="0 0 24 24"
											fill="none"
											className="text-blue-600"
										>
											<circle
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeDasharray="32"
												strokeDashoffset="8"
											/>
										</svg>
									</motion.div>

									{/* Title */}
									<h3 className="text-lg font-semibold text-gray-800 mb-2">
										{title}
									</h3>

									{/* Message */}
									<p className="text-sm text-gray-600 leading-relaxed max-w-xs">
										{message}
									</p>

									{/* Close Button (optionnel) */}
									{onClose && (
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={onClose}
											className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
										>
											Cancel
										</motion.button>
									)}
								</div>
							</GlassElement>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

// Hook utilitaire pour gérer l'état du loading
export const useLoadingPopup = () => {
	const [isLoading, setIsLoading] = React.useState(false)

	const showLoading = React.useCallback(() => setIsLoading(true), [])
	const hideLoading = React.useCallback(() => setIsLoading(false), [])

	return {
		isLoading,
		showLoading,
		hideLoading
	}
}