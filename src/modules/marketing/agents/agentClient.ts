const AGENT_API_URL = import.meta.env.VITE_DCA_API_URL || 'http://localhost:8010';

export interface AgentResult {
  run_id: string;
  status: string;
  output: string | null;
}

export async function runAgent(prompt: string): Promise<AgentResult> {
  const response = await fetch(`${AGENT_API_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Agent API error (${response.status}): ${error}`);
  }

  return response.json();
}
