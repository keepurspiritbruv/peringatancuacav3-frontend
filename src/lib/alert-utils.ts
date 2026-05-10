import { BEACHES, LIK_SIGNS } from "./constants";
import type { AlertFeedItem } from "./types";

type RawAlertEvent = {
	alertId?: string;
	serverTimestamp?: number;
	reporterCount?: number;
	riskLevel?: string;
	firstReportAt?: number;
	lastReportAt?: number;
	decision?: {
		community_characteristics?: string;
		is_actionable?: boolean;
		is_multisign?: boolean;
	};
	input?: {
		beach_location?: string;
		lik_codes?: string[];
	};
	ml?: {
		sign_description?: string;
		action_recommendation?: string;
		community_characteristics?: string;
		triggered_lik_codes?: string[];
	};
	beachLocation?: string;
	triggeredCodes?: string[];
	signDescription?: string;
	actionRecommendation?: string;
	communityCharacteristics?: string;
};

function deriveRiskLevel(raw: RawAlertEvent): string {
	if (raw.riskLevel) return raw.riskLevel;
	const cc = raw.decision?.community_characteristics ?? raw.ml?.community_characteristics ?? "";
	if (cc === "Actionable") {
		return raw.decision?.is_multisign ? "unsafe-high" : "unsafe";
	}
	return "safe";
}

export function transformAlert(raw: RawAlertEvent): AlertFeedItem {
	return {
		alertId: raw.alertId ?? "",
		beachLocation: raw.beachLocation ?? raw.input?.beach_location ?? "",
		riskLevel: deriveRiskLevel(raw),
		reporterCount: raw.reporterCount ?? 0,
		firstReportAt: raw.firstReportAt ?? raw.serverTimestamp ?? 0,
		lastReportAt: raw.lastReportAt ?? raw.serverTimestamp ?? 0,
		signDescription: raw.signDescription ?? raw.ml?.sign_description ?? "",
		actionRecommendation: raw.actionRecommendation ?? raw.ml?.action_recommendation ?? "",
		triggeredCodes: raw.triggeredCodes ?? raw.ml?.triggered_lik_codes ?? raw.input?.lik_codes ?? [],
		serverTimestamp: raw.serverTimestamp ?? 0,
		communityCharacteristics: raw.communityCharacteristics ?? raw.decision?.community_characteristics,
	};
}

export function isUnsafe(risk: string): boolean {
	const lower = risk.toLowerCase();
	return lower.includes("unsafe") || lower.includes("tidak aman") || lower.includes("high") || lower.includes("actionable");
}

export function beachName(slug: string): string {
	const b = BEACHES.find((x) => x.id === slug);
	return b?.name ?? slug.replace(/_/g, " ");
}

export function codeToLabel(code: string): string {
	const sign = LIK_SIGNS.find((s) => s.code === code);
	return sign?.label ?? code;
}

export function deriveAlertTitle(alert: AlertFeedItem): string {
	const name = beachName(alert.beachLocation);
	if (isUnsafe(alert.riskLevel)) {
		return `Peringatan Bahaya di ${name}`;
	}
	return `Kondisi Aman di ${name}`;
}

export function deriveStartDate(alert: AlertFeedItem): string {
	return new Date(alert.firstReportAt).toISOString();
}

export function deriveEndDate(alert: AlertFeedItem): string {
	return new Date(alert.lastReportAt).toISOString();
}
