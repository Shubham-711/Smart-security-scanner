import React from "react";
import DiffResult from './DiffResult';
import { useState } from "react";
import axios from "axios";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ShieldAlert, CheckCircle, Loader2, Play, Copy, Check } from "lucide-react";
import "./App.css";

function App() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleScan = async () => {
    if (!code) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Start Scan
      const { data: scanData } = await axios.post("http://127.0.0.1:8000/scan", { code });
      const scanId = scanData.scan_id;

      // 2. Poll for results
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const { data: statusData } = await axios.get(`http://127.0.0.1:8000/scan/${scanId}`);
          
          if (statusData.status === "completed") {
            clearInterval(interval);
            
            // --- SAFETY BLOCK START ---
            let cleanSast = {};
            try {
              // Try parsing as normal JSON first
              cleanSast = JSON.parse(statusData.raw_sast_output);
            } catch (e) {
              // Fallback: Try the single-quote fix if it's Python string format
              try {
                cleanSast = JSON.parse(statusData.raw_sast_output.replace(/'/g, '"'));
              } catch (e2) {
                console.error("Could not parse SAST output:", statusData.raw_sast_output);
                cleanSast = { error: "Could not parse security data." };
              }
            }

            let parsedFix = null;
            try {
               parsedFix = JSON.parse(statusData.ai_fix);
            } catch (e) {
               parsedFix = { risk_analysis: "Parsing Error", fixed_code: statusData.ai_fix };
            }
            // --- SAFETY BLOCK END ---

            setResult({
              sast: cleanSast,
              ai: parsedFix
            });
            setLoading(false); // Stop loading!
            
          } else if (statusData.status === "failed") {
            clearInterval(interval);
            setError("Scan failed on server.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Polling Error:", err);
          // Only stop if it's a critical network error, otherwise keep trying
          if (attempts > 20) {
             clearInterval(interval);
             setError("Lost connection to server.");
             setLoading(false);
          }
        }
        
        if (attempts > 20) { 
          clearInterval(interval);
          setError("Timeout: AI took too long.");
          setLoading(false);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("Server connection failed.");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result?.ai?.fixed_code) return;
    navigator.clipboard.writeText(result.ai.fixed_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container">
      <header className="navbar">
        <div className="logo">
          <ShieldAlert color="#00d4ff" size={28} />
          <h1>SecureScan AI</h1>
        </div>
        <p>Automated Vulnerability Patcher</p>
      </header>

      <main className="main-content">
        {/* LEFT: Input Area */}
        <div className="panel input-panel">
          <div className="panel-header">
            <h2>📝 Input Code</h2>
            <span className="badge">Python</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste vulnerable Python code here..."
            spellCheck="false"
          />
          <button onClick={handleScan} disabled={loading || !code} className="scan-btn">
            {loading ? <><Loader2 className="spin" /> Scanning...</> : <><Play size={18} fill="currentColor" /> Scan & Fix</>}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </div>

        {/* RIGHT: Results Area */}
        <div className="panel result-panel">
          <div className="panel-header">
            <h2>🛡️ Security Report</h2>
          </div>
          
          {!result && !loading && (
            <div className="placeholder fade-in">
              <ShieldAlert size={64} color="#333" />
              <p>Ready to analyze.</p>
            </div>
          )}

          {loading && (
            <div className="placeholder fade-in">
              <Loader2 size={64} className="spin" color="#00d4ff" />
              <p>AI is analyzing logic...</p>
            </div>
          )}

          {result && (
        <div style={{ marginTop: "30px", animation: "fadeIn 0.5s ease-in-out" }}>
          
          {/* Status Badge */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '20px',
            padding: '10px',
            background: result.ai.verified_secure ? 'rgba(0, 255, 128, 0.1)' : 'rgba(255, 165, 0, 0.1)',
            border: result.ai.verified_secure ? '1px solid #00e676' : '1px solid orange',
            borderRadius: '8px',
            color: result.ai.verified_secure ? '#00e676' : 'orange'
          }}>
            {result.ai.verified_secure 
              ? "🛡️ Verified Secure: The AI fix was tested and approved." 
              : "⚠️ Warning: Automated verification failed. Please review manually."}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Risk Analysis Card */}
            <div className="p-6 bg-gray-800 rounded-lg border border-red-500/30 shadow-lg shadow-red-900/20">
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-400">
                🔍 Vulnerability Report
              </h2>
              <div className="prose prose-invert text-sm text-gray-300">
                 {/* Display raw text if simple, or map if it's a list */}
                 <p>{typeof result.ai.risk_analysis === 'string' 
                     ? result.ai.risk_analysis 
                     : "Analysis available in dashboard."}
                 </p>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="p-6 bg-gray-800 rounded-lg border border-blue-500/30">
               <h2 className="text-xl font-bold mb-4 text-blue-400">🚀 Actions</h2>
               <button 
                 onClick={() => navigator.clipboard.writeText(result.ai.fixed_code)}
                 className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-bold transition"
               >
                 Copy Fixed Code
               </button>
               <p className="mt-4 text-xs text-gray-500">
                 This code has been re-scanned for safety.
               </p>
            </div>
          </div>

          {/* 👇 THE NEW PRO DIFF VIEWER 👇 */}
          <DiffResult oldCode={code} newCode={result.ai.fixed_code} />

          {result.ai.explanation && (
            <div style={{ 
              marginTop: '24px', 
              padding: '24px', 
              background: '#111827', // Dark gray/blue background
              borderRadius: '8px', 
              border: '1px solid rgba(59, 130, 246, 0.2)', // Subtle blue border
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
            }}>
              <h3 style={{ 
                color: '#60a5fa', // Blue text
                fontSize: '1.125rem', 
                fontWeight: 'bold', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                💡 Why was this dangerous?
              </h3>
              <p style={{ 
                color: '#d1d5db', // Light gray text
                lineHeight: '1.625',
                fontSize: '0.95rem'
              }}>
                {result.ai.explanation}
              </p>
            </div>
          )}
          
          
        </div>
      )}
        </div>
      </main>
    </div>
  );
}

export default App;