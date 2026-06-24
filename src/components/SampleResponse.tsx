import { useEffect, useState } from 'react';

// The concrete artifact on the API page. Shows a real measured reading.
// If VITE_CONTEXTIVE_API_URL is set (once the API is deployed), it fetches the
// reading live — a real round-trip — and falls back to this static measured
// sample on any error or when no URL is configured. Numbers are real either way.
const STATIC_SAMPLE = `GET /v1/terms/ceasefire

{
  "term": "ceasefire",
  "as_of": "2026-06-21",
  "source": "gdelt-doc-2.0",
  "status": "measured",
  "velocity_index": 100,
  "adoption_stage": "spreading",
  "change": { "d30": -2.4, "d90": 424.9, "yoy": 250.6 },
  "sentiment": -3.48,
  "inflections": [
    { "date": "2026-04-15", "z": 3.37 },
    { "date": "2026-04-05", "z": 2.02 }
  ],
  "co_occurrence": ["MOU", "truce", "60 days", "negotiations"],
  "methodology_version": "1.0"
}`;

// import.meta cast locally — the project has no vite-env.d.ts; Vite still provides
// import.meta.env at runtime (VITE_* baked in at build, undefined when unset).
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const API_URL = env.VITE_CONTEXTIVE_API_URL;
const API_KEY = env.VITE_CONTEXTIVE_API_KEY || 'ctx_demo_key';

export function SampleResponse() {
  const [text, setText] = useState(STATIC_SAMPLE);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!API_URL) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(`${API_URL.replace(/\/$/, '')}/v1/terms/ceasefire`, {
      headers: { 'X-API-Key': API_KEY },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        setText(`GET /v1/terms/ceasefire\n\n${JSON.stringify(data, null, 2)}`);
        setLive(true);
      })
      .catch(() => {
        /* keep the static measured sample — never show a broken state */
      })
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, []);

  return (
    <>
      <div className="border border-rule bg-ink text-paper overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-paper/15">
          <span className="small-caps text-paper/50 text-[10px]">
            {live ? 'Live response' : 'Sample response'}
          </span>
          <span className="small-caps text-paper/50 text-[10px] inline-flex items-center gap-1.5">
            {live && <span className="velocity-pulse inline-block w-1.5 h-1.5 rounded-full bg-paper" />}
            {live ? 'live · contextive-api' : 'measured · 21 Jun 2026'}
          </span>
        </div>
        <pre className="px-4 py-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-paper/90">
{text}
        </pre>
      </div>
      <p className="small-caps text-whisper text-[10px] mt-3 leading-relaxed">
        {live ? 'A live call to the Contextive API.' : 'A real measured reading.'} Terms we cannot yet
        measure return <span className="text-muted">status: pending</span> — never a fabricated number.
      </p>
    </>
  );
}
