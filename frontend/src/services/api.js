const BASE = "http://127.0.0.1:8000";

export async function fetchProvider(ccn) {
  const res = await fetch(`${BASE}/provider/${ccn}`);
  if (!res.ok) throw new Error("Facility not found");
  return res.json();
}

export async function fetchQuality(ccn) {
  const res = await fetch(`${BASE}/quality/${ccn}`);
  if (!res.ok) throw new Error("Quality data unavailable");
  return res.json();
}

export async function fetchAverages(state) {
  const res = await fetch(`${BASE}/averages/${state}`);
  if (!res.ok) throw new Error("Averages unavailable");
  return res.json();
}