export type BeachLocation = "pantai_lampuuk" | "pantai_lhoknga" | "pantai_ulee_lheue" | "pantai_depok" | "pantai_samas";

export type AlertFeedItem = {
	alertId: string;
	beachLocation: string;
	riskLevel: string;
	communityCharacteristics: string;
	actionRecommendation: string;
	signDescription: string;
	triggeredCodes: string[];
	serverTimestamp: number;
};

export type BmkgData = {
	beach: string;
	weather: string;
	waveHeight: number;
	windSpeed: number;
	windDirection: string;
	temperature: number;
	isSafe: boolean;
	fetchedAt: number;
};

export interface IObservation {
  label: string;
  attribute: string;
  object: string;
  value: string;
}

export type ReportResult = {
	ok: boolean;
	reportId?: string;
	serverTimestamp?: number;
	status?: string;
	alertEvent?: Record<string, unknown>;
	reportCounts?: Record<string, number>;
	deduped?: boolean;
	error?: string;
};
