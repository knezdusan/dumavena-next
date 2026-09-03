"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

export function Hero() {
	const ref = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"],
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
	const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
	const scale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

	return (
		<section
			ref={ref}
			className="relative min-h-svh flex items-start overflow-hidden grain pt-24 pb-20 md:items-center md:py-0"
		>
			{/* Ambient glow */}
			<div
				className="absolute top-1/4 left-1/2 -translate-x-1/2 w-150 h-150 rounded-full opacity-30 pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)",
				}}
			/>

			<motion.div
				style={{ y, opacity, scale }}
				className="container-wide px-5 sm:px-6 relative z-10"
			>
				<div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
					<div className="max-w-3xl">
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-(--color-border) bg-(--color-surface)/50 backdrop-blur-sm mb-8"
						>
							<span className="w-1.5 h-1.5 rounded-full bg-(--color-accent) animate-pulse" />
							<span className="text-xs text-(--color-text-secondary) tracking-wide">
								35% off all services — limited time
							</span>
						</motion.div>

						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.7,
								delay: 0.1,
								ease: [0.22, 1, 0.36, 1],
							}}
							className="font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] tracking-tight text-(--color-text)"
						>
							Websites that convert.
							<br />
							<span className="text-(--color-text-secondary)">
								Marketing that scales.
							</span>
							<br />
							<span className="text-(--color-accent)">
								Technology that lasts.
							</span>
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.7,
								delay: 0.2,
								ease: [0.22, 1, 0.36, 1],
							}}
							className="mt-8 max-w-xl text-lg leading-relaxed text-(--color-text-secondary)"
						>
							Dumavena builds stunning websites, drives targeted traffic with
							SEO and internet marketing, and provides strategic IT consulting
							for growing businesses.
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								duration: 0.7,
								delay: 0.3,
								ease: [0.22, 1, 0.36, 1],
							}}
							className="mt-10 flex flex-col sm:flex-row gap-4"
						>
							<Link
								href="/#contact"
								className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg bg-(--color-accent) text-(--color-base) font-medium text-sm hover:bg-(--color-accent-soft) transition-colors duration-200"
							>
								Start your project
							</Link>
							<Link
								href="/#website-building"
								className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-(--color-border) text-(--color-text) font-medium text-sm hover:border-(--color-text-muted) transition-colors duration-200"
							>
								Explore services
							</Link>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
						className="order-first relative aspect-3/2 w-full overflow-hidden rounded-2xl edge-light md:order-last md:aspect-4/3"
					>
						<Image
							src="/images/dumavena-hero.png"
							alt="Dumavena LLC — digital agency services"
							fill
							sizes="(max-width: 768px) calc(100vw - 40px), 500px"
							loading="eager"
							className="object-contain"
						/>
						<div
							className="absolute inset-0 opacity-20 pointer-events-none"
							style={{
								background:
									"linear-gradient(135deg, var(--color-accent-glow) 0%, transparent 60%)",
							}}
						/>
					</motion.div>
				</div>
			</motion.div>

			{/* Scroll indicator */}
			<motion.div
				style={{ opacity }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
			>
				<span className="text-[10px] uppercase tracking-[0.3em] text-(--color-text-muted)">
					Scroll
				</span>
				<div className="w-px h-12 bg-linear-to-b from-(--color-text-muted) to-transparent" />
			</motion.div>
		</section>
	);
}
