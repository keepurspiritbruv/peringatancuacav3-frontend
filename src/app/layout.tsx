import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav } from "@/components/bottom-nav";
import { WhatsAppFloatButton } from "@/components/whatsapp-float";
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar";
import "./globals.css";

const outfit = Outfit({
	variable: "--font-heading",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
	variable: "--font-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
	title: "CuacaPesisir",
	description: "Sistem peringatan cuaca pesisir untuk nelayan",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "CuacaPesisir",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	themeColor: "#0A2540",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" className={`${outfit.variable} ${jakarta.variable} h-full antialiased`}>
			<body className="min-h-full flex flex-col bg-background text-foreground">
				{children}
			<WhatsAppFloatButton />
			<BottomNav />
			<Toaster position="top-center" />
			<ServiceWorkerRegistrar />
			</body>
		</html>
	);
}
