"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Calendar, Users, Clock, CheckCircle, ChevronDown, ChevronUp, Info } from "lucide-react";
import { BEACHES, LIK_SIGNS } from "@/lib/constants";
import type { AlertFeedItem, ExplanationData } from "@/lib/types";
import { deriveAlertTitle, deriveStartDate, deriveEndDate } from "@/lib/alert-utils";
import { ExplanationPanel } from "./explanation-panel";
import { fetchAlertExplanation } from "@/lib/api";

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
	return b?.name ?? slug.replace(/_/g, " ");
}

function formatDateTime(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatTime(iso: string): string {
	const d = new Date(iso);
	return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function codeToLabel(code: string): string {
	const sign = LIK_SIGNS.find((s) => s.code === code);
	return sign?.label ?? code;
}

function isUnsafe(risk: string): boolean {
	const lower = risk.toLowerCase();
	return lower.includes("unsafe") || lower.includes("tidak aman") || lower.includes("high");
}

export function AlertCard({ alert }: { alert: AlertFeedItem }) {
	const unsafe = isUnsafe(alert.riskLevel);
	const Icon = unsafe ? AlertTriangle : CheckCircle;
	const [expanded, setExpanded] = useState(false);
	const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
	const [reassuranceData, setReassuranceData] = useState<{ shapRisk: string; bmkgRisk: string; agreed: boolean; finalLevel: string; bmkgDetails: { waveHeight: number; windSpeed: number; hasWarning: boolean } | null } | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleShowExplanation() {
		if (expanded) {
			setExpanded(false);
			return;
		}

		if (alert.explanation) {
			setExplanationData(alert.explanation);
			setExpanded(true);
			return;
		}

		setLoading(true);
		try {
			const result = await fetchAlertExplanation(alert.alertId);
			if (result) {
				setExplanationData({
					summary_id: result.summary_id,
					summary_en: result.summary_en,
					contributions: result.contributions,
					community_profile: result.communityProfile ?? { beach: "", overall: "", factors: [] },
				});
				if (result.reassurance) {
					setReassuranceData(result.reassurance);
				}
			}
			setExpanded(true);
		} catch {
		} finally {
			setLoading(false);
		}
	}

	return (
		<Card
			className={`rounded-xl shadow-sm border-l-4 ${
				unsafe ? "border-l-[#DC2626]" : "border-l-[#16A34A]"
			}`}
		>
			<CardContent className="p-4 space-y-3">
				<div className="flex items-start gap-2">
					<Icon
						size={20}
						className={unsafe ? "text-[#DC2626] mt-0.5 flex-shrink-0" : "text-[#16A34A] mt-0.5 flex-shrink-0"}
					/>
					<div className="flex-1 min-w-0">
						<h3 className="text-sm font-semibold leading-tight">{deriveAlertTitle(alert)}</h3>
					</div>
					<span className="text-xs text-muted-foreground flex-shrink-0">
						{relativeTime(alert.serverTimestamp)}
					</span>
				</div>

				<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
					<Calendar size={12} />
					<span>{new Date(alert.serverTimestamp).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
				</div>

				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<Users size={12} />
						{alert.reporterCount} nelayan
					</span>
					<span className="flex items-center gap-1">
						<Clock size={12} />
						Pantauan: {formatTime(deriveStartDate(alert))} – {formatTime(deriveEndDate(alert))}
					</span>
				</div>

				<div>
					<p className="text-xs font-medium text-muted-foreground mb-1">Tanda Alam Terdeteksi:</p>
					<ul className="space-y-0.5">
						{alert.triggeredCodes.map((code) => (
							<li key={code} className="text-xs text-foreground flex items-start gap-1.5">
								<span className="text-muted-foreground mt-0.5">-</span>
								<span>{codeToLabel(code)}</span>
							</li>
						))}
					</ul>
					{alert.signDescription && (
						<p className="text-xs text-muted-foreground mt-1 italic">{alert.signDescription}</p>
					)}
				</div>

				<div>
					<p className="text-xs font-medium text-muted-foreground mb-1">Rekomendasi Aksi:</p>
					<p className="text-xs text-foreground leading-relaxed">{alert.actionRecommendation}</p>
				</div>

				<button
					type="button"
					onClick={handleShowExplanation}
					disabled={loading}
					className="flex items-center gap-1.5 text-xs text-[#0EA5E9] font-medium hover:underline disabled:opacity-50 w-full"
				>
					<Info size={14} />
					{loading ? "Memuat..." : expanded ? "Sembunyikan Penjelasan" : "Kenapa bahaya?"}
					{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
				</button>

				{expanded && explanationData && (
					<ExplanationPanel explanation={explanationData} reassurance={reassuranceData} />
				)}
			</CardContent>
		</Card>
	);
}
