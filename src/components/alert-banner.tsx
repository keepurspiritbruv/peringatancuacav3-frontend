"use client";

import type { AlertFeedItem } from "@/lib/types";
import { ShieldCheck, TriangleAlert, Loader2 } from "lucide-react";
import { deriveAlertTitle } from "@/lib/alert-utils";

type AlertBannerProps = {
	alerts: AlertFeedItem[];
	loading?: boolean;
};

const UNSAFE_KEYWORDS = ["unsafe", "tidak aman", "high"];

function isDanger(alerts: AlertFeedItem[]): boolean {
	return alerts.some((a) =>
		UNSAFE_KEYWORDS.some((kw) => a.riskLevel.toLowerCase().includes(kw)),
	);
}

function getDangerSubtitle(alerts: AlertFeedItem[]): string {
	const unsafe = alerts.find((a) =>
		UNSAFE_KEYWORDS.some((kw) => a.riskLevel.toLowerCase().includes(kw)),
	);
	if (!unsafe) return "";
	return deriveAlertTitle(unsafe);
}

export function AlertBanner({ alerts, loading }: AlertBannerProps) {
	if (loading && alerts.length === 0) {
		return (
			<div
				className="w-full rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
				style={{ backgroundColor: "#0EA5E9" }}
			>
				<Loader2
					className="text-white animate-spin"
					size={40}
				/>
				<span className="text-white text-lg">Memuat data...</span>
			</div>
		);
	}

	if (isDanger(alerts)) {
		return (
			<div
				className="w-full rounded-2xl p-5 flex flex-col items-center gap-2 text-center animate-pulse"
				style={{ backgroundColor: "#DC2626" }}
			>
				<TriangleAlert className="text-white" size={40} />
				<span className="text-white text-2xl font-bold">
					BAHAYA! JANGAN MELAUT
				</span>
				<span
					className="text-sm"
					style={{ color: "rgba(255, 255, 255, 0.7)" }}
				>
					{getDangerSubtitle(alerts)}
				</span>
			</div>
		);
	}

	return (
		<div
			className="w-full rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
			style={{ backgroundColor: "#16A34A" }}
		>
			<ShieldCheck className="text-white" size={40} />
			<span className="text-white text-2xl font-bold">
				AMAN UNTUK MELAUT
			</span>
			<span
				className="text-sm"
				style={{ color: "rgba(255, 255, 255, 0.7)" }}
			>
				BMKG: Aman. Tanda Alam: Aman.
			</span>
		</div>
	);
}
