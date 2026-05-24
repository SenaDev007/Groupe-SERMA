'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { ArrowRight } from 'lucide-react';

export function Header() {
	const pathname = usePathname();
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	// Close mobile menu on route change
	React.useEffect(() => {
		setOpen(false);
	}, [pathname]);

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	// Determine context
	const isCabinet = pathname?.startsWith("/cabinet");
	const isAcademy = pathname?.startsWith("/academy");

	let navLinks: Array<{ label: string; href: string }> = [];
	let ctaText = "Nous contacter";
	let ctaHref = "#contact";
	let logoSub = "GROUPE";

	if (isCabinet) {
		logoSub = "CABINET";
		ctaText = "Prendre rendez-vous";
		ctaHref = "/cabinet#contact";
		navLinks = [
			{ label: "Nos services", href: "/cabinet#services" },
			{ label: "Notre approche", href: "/cabinet#approche" },
			{ label: "Nos clients", href: "/cabinet#clients" },
			{ label: "Témoignages", href: "/cabinet#temoignages" },
			{ label: "Espace Academy", href: "/academy" },
			{ label: "Admin", href: "/admin" },
		];
	} else if (isAcademy) {
		logoSub = "ACADEMY";
		ctaText = "S'inscrire maintenant";
		ctaHref = "/academy/inscription";
		navLinks = [
			{ label: "Les filières", href: "/academy#filieres" },
			{ label: "Formations courtes", href: "/academy#formations" },
			{ label: "Pour qui", href: "/academy#profils" },
			{ label: "Témoignages", href: "/academy#temoignages" },
			{ label: "Espace Cabinet", href: "/cabinet" },
			{ label: "Admin", href: "/admin" },
		];
	} else {
		// Homepage or other (blog)
		logoSub = "GROUPE";
		ctaText = "Nous contacter";
		ctaHref = "#contact";
		navLinks = [
			{ label: "Cabinet SERMA", href: "/cabinet" },
			{ label: "SERMA HUB Academy", href: "/academy" },
			{ label: "Ressources", href: "/blog" },
			{ label: "Contact", href: "#contact" },
			{ label: "Admin", href: "/admin" },
		];
	}

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-7xl border-b border-transparent md:transition-all md:ease-out',
				{
					'bg-[#0C193D]/95 supports-[backdrop-filter]:bg-[#0C193D]/80 border-white/10 backdrop-blur-lg md:top-4 md:max-w-6xl md:rounded-2xl md:border md:shadow-lg':
						scrolled && !open,
					'bg-[#0C193D]/95': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-20 w-full items-center justify-between px-4 md:transition-all md:ease-out',
					{
						'md:px-6 h-16': scrolled,
					},
				)}
			>
				{/* Logo */}
				<Link href="/" className="flex items-center space-x-2 group">
					<span className="font-playfair text-xl md:text-2xl font-black tracking-tight text-white transition-colors duration-200">
						SERMA <span className="text-[#E07F0A] group-hover:text-[#E58A10]">{logoSub}</span>
					</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden items-center gap-6 md:flex">
					{navLinks.map((link, i) => (
						<Link
							key={i}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-slate-300 hover:text-white font-semibold text-sm transition-colors duration-150'
							)}
							href={link.href}
						>
							{link.label}
						</Link>
					))}
					<Link
						href={ctaHref}
						className={cn(
							buttonVariants({ variant: 'default' }),
							'bg-[#E07F0A] hover:bg-[#E58A10] text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 gap-1.5 px-5 py-2.5 rounded-lg active:scale-95'
						)}
					>
						<span>{ctaText}</span>
						<ArrowRight className="w-3.5 h-3.5" />
					</Link>
				</div>

				{/* Mobile Menu Button */}
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden border-white/20 bg-transparent text-white hover:bg-white/10">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			{/* Mobile Menu */}
			<div
				className={cn(
					'bg-[#0C193D]/95 fixed top-20 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-t border-white/10 md:hidden transition-all',
					{
						'top-16': scrolled,
						'block': open,
						'hidden': !open,
					}
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-6 pb-20',
					)}
				>
					<div className="grid gap-y-3">
						{navLinks.map((link) => (
							<Link
								key={link.label}
								className={cn(
									buttonVariants({
										variant: 'ghost',
										className: 'justify-start text-slate-200 hover:text-white text-base py-3',
									})
								)}
								href={link.href}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-2 pt-4 border-t border-white/10">
						<Link
							href={ctaHref}
							className={cn(
								buttonVariants({ variant: 'default' }),
								'bg-[#E07F0A] hover:bg-[#E58A10] text-white font-bold text-sm uppercase tracking-wider py-4 rounded-xl transition-colors gap-2 w-full justify-center'
							)}
						>
							<span>{ctaText}</span>
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
