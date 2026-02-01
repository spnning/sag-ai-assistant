"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateSchedule() {
    setLoading(true);

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput: input }),
    });

    const data = await res.json();
    setSchedule(data.schedule);
    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 600 }}>
      <h1>AI Schedule Planner</h1>

      <textarea
        rows={4}
        placeholder="Describe your day..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%" }}
      />

      <button onClick={generateSchedule} disabled={loading}>
        {loading ? "Generating..." : "Generate Schedule"}
      </button>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {schedule}
      </pre>
    </main>
  );
}