import type { CanonicalRoot } from "../types/canonical-token.js";

export type NormalizeSuccess = { success: true; data: CanonicalRoot };
export type NormalizeError = { success: false; error: string };
