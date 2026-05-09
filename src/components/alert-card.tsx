"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { BEACHES } from "@/lib/constants";
import type { AlertFeedItem } from "@/lib/types";

function relativeTime(ts: number): string {
	const diff = Date.now() - ts;
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "Baru saja";
	if (mins < 60) return `${mins} menit lalu`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours} jam lalu`;
	return `${Math.floor(hours / 24)} hari lalu`;
}

function beachName(slug: string): string {
	const b = BEACHES.find((x) => x.id === slug);
	return b?.label ?? slug.replace(/_/g, " ");
}

function isUnsafe(risk: string): boolean {
	const lower = risk.toLowerCase();
	return lower.includes("unsafe") || lower.includes("tidak aman") || lower.includes("high");
}

export function AlertCard({ alert }: { alert: AlertFeedItem }) {
	const unsafe = isUnsafe(alert.riskLevel);
	const visibleCodes = alert.triggeredCodes.slice(0, 3);
	const extraCount = alert.triggeredCodes.length - 3;

	return (
		<Card
			className={`rounded-xl shadow-sm border-l-4 ${
				unsafe ? "border-l-[#DC2626]" : "border-l-[#16A34A]"
			}`}
		>
			<CardContent className="p-3">
				<div className="flex items-center justify-between">
					<span className="text-sm font-semibold">{beachName(alert.beachLocation)}</span>
					<span className="text-xs text-muted-foreground">
						{relativeTime(alert.serverTimestamp)}
					</span>
				</div>

				<div className="mt-1.5">
					<span
						className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
							unsafe
								? "bg-[#DC2626]/10 text-[#DC2626]"
								: "bg-[#16A34A]/10 text-[#16A34A]"
						}`}
					>
						{unsafe ? (
							<ShieldAlert className="h-3.5 w-3.5" />
						) : (
							<ShieldCheck className="h-3.5 w-3.5" />
						)}
						{unsafe ? "Tidak Aman" : "Aman"}
					</span>
				</div>

				{alert.triggeredCodes.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-2">
						{visibleCodes.map((code) => (
							<span
								key={code}
								className="rounded-full bg-[#E2E8F0] px-2 py-0.5 text-xs text-[#475569]"
							>
								{code}
							</span>
						))}
						{extraCount > 0 && (
							<span className="text-xs text-muted-foreground">+{extraCount}</span>
						)}
					</div>
				)}

				{alert.actionRecommendation && (
					<p className="text-xs text-[#475569] mt-1">
						{alert.actionRecommendation}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
