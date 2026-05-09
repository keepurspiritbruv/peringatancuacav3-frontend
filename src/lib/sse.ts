"use client";

import type { AlertFeedItem } from "./types";

const SSE_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

export function connectSSE(onAlert: (data: AlertFeedItem) => void): () => void {
	const url = `${SSE_BASE}/sse`;
	const es = new EventSource(url);

	es.addEventListener("alert", (event) => {
		try {
			const data = JSON.parse(event.data) as AlertFeedItem;
			onAlert(data);
		} catch {
			// ignore malformed
		}
	});

	return () => {
		es.close();
	};
}
