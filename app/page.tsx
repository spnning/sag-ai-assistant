//Example page.tsx, change/delete with better ones
"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState(""); // Track error messages
  const [loading, setLoading] = useState(false);

  async function generateSchedule() {
    setLoading(true);
    setError("");      // Clear old errors
    setSchedule("");   // Clear old schedules

    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        // This catches the 503, 429, or 500 errors from our route.ts
        setError(data.error || "Something went wrong");
      } else {
        setSchedule(data.schedule);
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 600, fontFamily: 'sans-serif' }}>
      <h1>AI Schedule Planner</h1>

      <textarea
        rows={4}
        placeholder="Describe your day (e.g., 'I have gym at 8am and a meeting at 2pm')..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ 
          width: "100%", 
          padding: "8px", 
          marginBottom: "12px", 
          color: "#000", // Ensures input text is visible during typing
          backgroundColor: "#fff" 
        }}
      />

      <button 
        onClick={generateSchedule} 
        disabled={loading || !input}
        style={{ 
          padding: "10px 20px", 
          backgroundColor: loading ? "#ccc" : "#0070f3", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}
      >
        {loading ? "Generating..." : "Generate Schedule"}
      </button>

      {/* Show error message if it exists */}
      {error && (
        <div style={{ 
          color: "#721c24", 
          marginTop: 20, 
          padding: "10px", 
          border: "1px solid #f5c6cb", 
          borderRadius: "5px", 
          backgroundColor: "#f8d7da" 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Show schedule result - FORCED HIGH CONTRAST */}
      {schedule && (
        <div style={{ 
          marginTop: 20, 
          padding: "20px", 
          backgroundColor: "#111111", // Forced deep black background
          borderRadius: "8px",
          border: "2px solid #333",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
        }}>
          <h2 style={{ 
            marginTop: 0, 
            color: "#4dabf7", // Bright blue header
            borderBottom: "1px solid #333", 
            paddingBottom: "10px",
            fontSize: "1.2rem"
          }}>
            Your AI Schedule:
          </h2>
          <pre style={{ 
            whiteSpace: "pre-wrap", 
            margin: "15px 0 0 0", 
            color: "#00FF41",         // Matrix Green text for 100% visibility
            backgroundColor: "transparent", 
            fontSize: "1rem",
            lineHeight: "1.6",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: "bold"
          }}>
            {schedule}
          </pre>
        </div>
      )}
    </main>
  );
}