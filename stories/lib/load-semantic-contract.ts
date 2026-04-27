export interface SemanticContractEntry {
  token: string;
  canonicalPath: string;
  intent?: string;
  role?: string;
  derivedFrom?: string;
  introducedIn?: string;
  deprecatedIn?: string | null;
  stability: string;
  status: string;
  platformMap?: Record<string, string>;
  accessibility?: {
    minContrast?: number;
  };
}

export interface SemanticContract {
  version: number;
  tokens: Record<string, SemanticContractEntry>;
}

export async function loadSemanticContract(): Promise<SemanticContract> {
  const base = window.location.pathname.replace(/\/[^/]*$/, "/");
  const response = await fetch(`${base}canonical/semantic-tokens.json`);

  if (!response.ok) {
    throw new Error(`Failed to fetch canonical/semantic-tokens.json: ${response.status}`);
  }

  return (await response.json()) as SemanticContract;
}