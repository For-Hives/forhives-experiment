'use client'

import { motion, AnimatePresence } from 'motion/react'
import React from 'react'

import { GlassElement } from './GlassElement'

export interface LoadingPopupProps {
	isVisible: boolean
	title?: string
	message?: string
	onClose?: () => void
	className?: string
}

export const LoadingPopup: React.FC<LoadingPopupProps> = ({
	title = 'Loading...',
	onClose,
	message = 'Please wait while we process your request.',
	isVisible,
	className = '',
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
							initial={{ y: 20, scale: 0.8, opacity: 0 }}
							animate={{ y: 0, scale: 1, opacity: 1 }}
							exit={{ y: 20, scale: 0.8, opacity: 0 }}
							transition={{
								ease: [0.16, 1, 0.3, 1], // Apple-like easing
								duration: 0.4,
							}}
							onClick={e => e.stopPropagation()}
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
											repeat: Infinity,
											ease: 'linear',
											duration: 1,
										}}
										className="mb-4"
									>
										<svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-600">
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
									<h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>

									{/* Message */}
									<p className="max-w-xs text-sm leading-relaxed text-gray-600">{message}</p>

									{/* Close Button (optionnel) */}
									{onClose && (
										<motion.button
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={onClose}
											className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
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

// Utility hook to manage loading state
export const useLoadingPopup = () => {
	const [isLoading, setIsLoading] = React.useState(false)

	const showLoading = React.useCallback(() => setIsLoading(true), [])
	const hideLoading = React.useCallback(() => setIsLoading(false), [])

	return {
		showLoading,
		isLoading,
		hideLoading,
	}
}
