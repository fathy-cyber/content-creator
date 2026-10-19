const DCA_API_URL = import.meta.env.VITE_DCA_API_URL || 'http://localhost:8010';

export interface AnalysisResult {
  run_id: string;
  status: string;
  output: string | null;
}

export async function analyzeCompetitors(
  companyA: string,
  companyB: string,
  focusAreas: string[] = ['products', 'pricing', 'market_position', 'strengths_weaknesses']
): Promise<AnalysisResult> {
  const response = await fetch(`${DCA_API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company_a: companyA, company_b: companyB, focus_areas: focusAreas }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deep Analyst API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function analyzeCompanyProfile(
  company: string,
  focusAreas: string[] = ['products', 'pricing', 'market_position', 'strengths_weaknesses']
): Promise<AnalysisResult> {
  const response = await fetch(`${DCA_API_URL}/analyze/company-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, focus_areas: focusAreas }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Deep Analyst API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${DCA_API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
