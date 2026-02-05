"use client";

import { useMemo, useState } from "react";
import type { EnergyLevel, ParsedItem, PlanResponse, CareResponse, PlanBlock } from "@/lib/types";

type PipelineResult = {
  items: ParsedItem[];
  plan: PlanResponse;
  care: CareResponse;
};

function badgeStyle(bg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: bg,
    color: "#fff",
    lineHeight: 1.6,
  };
}

export default function TestPage() {
  const [userInput, setUserInput] = useState("");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");

  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1) parse
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok) return setError(parseData.error || "Parse failed");

      // 2) schedule
      const scheduleRes = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parseData.items, energy }),
      });
      const scheduleData = await scheduleRes.json();
      if (!scheduleRes.ok) return setError(scheduleData.error || "Schedule failed");

      // 3) care
      const careRes = await fetch("/api/care", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: scheduleData.plan, energy, items: parseData.items }),
      });
      const careData = await careRes.json();
      if (!careRes.ok) return setError(careData.error || "Care failed");

      setResult({
        items: parseData.items,
        plan: scheduleData.plan,
        care: careData,
      });
    } catch {
      setError("Network / server error.");
    } finally {
      setLoading(false);
    }
  }

  const day = result?.plan.days?.[0];

  const blocks: PlanBlock[] = useMemo(() => {
    const list = day?.blocks ?? [];
    // already sorted by schedule endpoint, but safe to sort anyway
    return [...list].sort((a, b) => a.start.localeCompare(b.start));
  }, [day]);

  return (
    <main style={{ padding: 24, maxWidth: 900, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Care Schedule Assistant (MVP)</h1>

      <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>Describe your day</label>
      <textarea
        rows={5}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Try: 'Study 2 hours, gym 1 hour' or 'Class 10-11:15, work 3-7, homework 2h'"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #2a2a2a",
          background: "#0f0f0f",
          color: "#fff",
          outline: "none",
        }}
      />

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        <label style={{ fontWeight: 700 }}>Energy:</label>
        <select
          value={energy}
          onChange={(e) => setEnergy(e.target.value as EnergyLevel)}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #2a2a2a",
            background: "#0f0f0f",
            color: "#fff",
          }}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>

        <button
          onClick={run}
          disabled={!userInput.trim() || loading}
          style={{
            marginLeft: "auto",
            padding: "10px 16px",
            borderRadius: 12,
            border: "1px solid #2a2a2a",
            background: loading ? "#333" : "#2563eb",
            color: "#fff",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            background: "#2a1111",
            border: "1px solid #7f1d1d",
            color: "#fecaca",
            fontWeight: 700,
          }}
        >
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {/* LEFT: Schedule */}
          <section
            style={{
              gridColumn: "1 / span 1",
              padding: 14,
              borderRadius: 14,
              border: "1px solid #2a2a2a",
              background: "#0b0b0b",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Schedule</h2>

            <div style={{ opacity: 0.85, marginBottom: 10 }}>
              Date: <b>{day?.date ?? "—"}</b>
            </div>

            {blocks.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No blocks scheduled.</div>
            ) : (
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #222" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 120px",
                    gap: 0,
                    padding: "10px 12px",
                    background: "#121212",
                    fontWeight: 800,
                  }}
                >
                  <div>Time</div>
                  <div>Task</div>
                  <div>Type</div>
                </div>

                {blocks.map((b, idx) => (
                  <div
                    key={`${b.start}-${b.end}-${idx}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 120px",
                      padding: "10px 12px",
                      borderTop: "1px solid #222",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                      {b.start}–{b.end}
                    </div>
                    <div style={{ fontWeight: 700 }}>{b.label}</div>
                    <div>
                      {b.fixed ? (
                        <span style={badgeStyle("#6b7280")}>fixed</span>
                      ) : (
                        <span style={badgeStyle("#16a34a")}>flex</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.plan.notes?.length ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>Notes</div>
                <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
                  {result.plan.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* RIGHT: Care + Parsed */}
          <section
            style={{
              gridColumn: "2 / span 1",
              padding: 14,
              borderRadius: 14,
              border: "1px solid #2a2a2a",
              background: "#0b0b0b",
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>Care</h2>

            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "#111827",
                border: "1px solid #1f2937",
                marginBottom: 10,
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Gentle summary</div>
              <div style={{ opacity: 0.95 }}>{result.care.gentle_summary}</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Suggestions</div>
              <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.95 }}>
                {result.care.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {result.care.low_energy_alternatives?.length ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>Low-energy alternatives</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {result.care.low_energy_alternatives.map((alt, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid #222",
                        background: "#0f0f0f",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        Target: <span style={{ fontWeight: 700 }}>{alt.target ?? "—"}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <b>Change:</b> {alt.change}
                      </div>
                      <div style={{ marginTop: 4, opacity: 0.9 }}>
                        <b>Reason:</b> {alt.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <hr style={{ borderColor: "#222", margin: "14px 0" }} />

            <h3 style={{ margin: "0 0 8px 0" }}>Parsed items</h3>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.95 }}>
              {result.items.map((it, i) => (
                <li key={i}>
                  <b>{it.title}</b>{" "}
                  {it.type === "fixed" ? (
                    <>
                      <span style={badgeStyle("#6b7280")}>fixed</span>{" "}
                      <span style={{ opacity: 0.9 }}>
                        {it.start}–{it.end}
                      </span>
                    </>
                  ) : (
                    <>
                      <span style={badgeStyle("#16a34a")}>flex</span>{" "}
                      <span style={{ opacity: 0.9 }}>{it.durationMin} min</span>
                    </>
                  )}
                  {it.notes ? <span style={{ opacity: 0.8 }}> — {it.notes}</span> : null}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </main>
  );
}
