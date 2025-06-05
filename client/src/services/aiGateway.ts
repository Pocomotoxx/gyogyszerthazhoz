export interface DrugInfo {
  name: string;
  activeSubstance: string;
  indication: string;
  warnings: string;
}

const GATEWAY_URL = import.meta.env.VITE_AI_GATEWAY_URL || '/ai';

export async function scanDrug(image: Blob): Promise<DrugInfo> {
  const form = new FormData();
  form.append('image', image, 'frame.jpg');
  const res = await fetch(`${GATEWAY_URL}/drugscan`, {
    method: 'POST',
    body: form
  });
  if (!res.ok) {
    throw new Error('Nem sikerült felismerni a gyógyszert');
  }
  return res.json();
}
