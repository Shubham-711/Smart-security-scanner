import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import DiffResult from "./DiffResult";

import * as api from "./services/api";
import {
    ShieldCheck,
    ShieldAlert,
    Loader2,
    Play,
    Copy,
    Check,
    AlertTriangle,
    Lightbulb,


    Code2,
    FileSearch,
    ArrowLeft,
    XCircle,
} from "lucide-react";
import "./App.css";

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } },
};

// ── CodeCard: Tokyo Night style code block with copy button ──
function CodeCard({ code, language = "python" }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const langMap = { python: "python", java: "java" };
    const lang = langMap[language] || "text";

    return (
        <div className="code-card">
            <div className="code-card-header">
                <div className="code-card-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                </div>
                <span className="code-card-filename">
                    fixed.{language === "java" ? "java" : "py"}
                </span>
                <button className="code-card-copy" onClick={handleCopy} title="Copy fixed code">
                    {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
            </div>
            <div className="code-card-body">
                <SyntaxHighlighter
                    language={lang}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                        margin: 0, padding: "20px 16px",
                        background: "#1e1e2e", fontSize: "13px",
                        lineHeight: "1.65",
                        fontFamily: "'JetBrains Mono', monospace",
                        borderRadius: 0, overflowX: "auto",
                    }}
                    lineNumberStyle={{ color: "#3a3d4e", minWidth: "38px" }}
                >
                    {code || "// No fixed code generated."}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("python");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [scanFailed, setScanFailed] = useState(false);
    const [showFixed, setShowFixed] = useState(false);

    const handleScan = async () => {
        if (!code) return;
        setLoading(true);
        setError("");
        setResult(null);
        setScanFailed(false);
        setShowFixed(false);

        try {
            const scanData = await api.scanCode(code, language);
            const scanId = scanData.scan_id;

            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                try {
                    const statusData = await api.getScanStatus(scanId);

                    if (statusData.status === "completed") {
                        clearInterval(interval);

                        let cleanSast = {};
                        try {
                            cleanSast = JSON.parse(statusData.raw_sast_output);
                        } catch {
                            try {
                                cleanSast = JSON.parse(statusData.raw_sast_output.replace(/'/g, '"'));
                            } catch {
                                cleanSast = { error: "Could not parse security data." };
                            }
                        }

                        let parsedFix = null;
                        try {
                            parsedFix = JSON.parse(statusData.ai_fix);
                        } catch {
                            parsedFix = { risk_analysis: "Parsing Error", fixed_code: statusData.ai_fix };
                        }

                        // Check if AI returned an error object instead of a proper fix
                        if (parsedFix && parsedFix.error) {
                            setScanFailed(true);
                            setError(`Scan Failed: ${parsedFix.error}`);
                            setLoading(false);
                            return;
                        }

                        setResult({ sast: cleanSast, ai: parsedFix });
                        setLoading(false);
                    } else if (statusData.status === "failed") {
                        clearInterval(interval);
                        setScanFailed(true);
                        setError("Scan Failed — The backend encountered an error processing your code.");
                        setLoading(false);
                    }
                } catch {
                    if (attempts > 20) {
                        clearInterval(interval);
                        setScanFailed(true);
                        setError("Lost connection to server.");
                        setLoading(false);
                    }
                }

                if (attempts > 20) {
                    clearInterval(interval);
                    setScanFailed(true);
                    setError("Timeout: AI took too long.");
                    setLoading(false);
                }
            }, 2000);
        } catch {
            setScanFailed(true);
            setError("Server connection failed. Is the backend running?");
            setLoading(false);
        }
    };

    return (
        <div className="app">
            {/* ── NAVBAR ── */}
            <nav className="navbar">
                <div className="navbar-left">
                    <button
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", marginRight: 4 }}
                        onClick={() => navigate("/")}
                        title="Back to home"
                    >
                        <ArrowLeft size={15} />
                    </button>
                    <div className="navbar-logo">
                        <ShieldCheck size={18} color="white" />
                    </div>
                    <span className="navbar-title">SecureScan AI</span>
                    <span className="navbar-subtitle">/ dashboard</span>
                </div>
                <div className="navbar-right" />
            </nav>

            {/* ── HERO ── */}
            <motion.section
                className="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <h1 className="hero-title">
                    Scan. Fix. <span className="accent-word">Ship Secure.</span>
                </h1>
                <p className="hero-subtitle">
                    Paste your code below. Our AI will find vulnerabilities, generate verified fixes,
                    and explain every change.
                </p>
            </motion.section>

            {/* ── MAIN ── */}
            <main className="main-content">
                {/* LEFT PANEL: Code Input */}
                <motion.div className="panel"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="panel-header">
                        <div className="panel-title">
                            <span className="panel-title-icon"><Code2 size={14} /></span>
                            Source Code
                        </div>
                        <select
                            className="badge"
                            style={{ background: "transparent", cursor: "pointer", outline: "none", border: "1px solid var(--border-default)" }}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={loading}
                        >
                            <option style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }} value="python">Python</option>
                            <option style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }} value="java">Java</option>
                        </select>
                    </div>

                    <textarea
                        className="code-textarea"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={
                            language === "python"
                                ? "# Paste your Python code here...\nimport subprocess\nsubprocess.call(input())"
                                : '// Paste your Java code here...\nString query = "SELECT * FROM users WHERE name=" + input;'
                        }
                        spellCheck="false"
                    />

                    <div className="panel-footer">
                        <button
                            className="btn btn-primary"
                            onClick={handleScan}
                            disabled={loading || !code}
                        >
                            {loading ? (
                                <><Loader2 size={15} className="loading-spinner" /> Scanning...</>
                            ) : (
                                <><Play size={14} fill="currentColor" /> Scan & Fix</>
                            )}
                        </button>

                        {error && (
                            <motion.div
                                className={scanFailed ? "error-msg scan-failed-alert" : "error-msg"}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {scanFailed ? <XCircle size={14} /> : <AlertTriangle size={14} />}
                                {error}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* RIGHT PANEL: Results */}
                <motion.div className="panel result-panel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="panel-header">
                        <div className="panel-title">
                            <span className="panel-title-icon"><FileSearch size={14} /></span>
                            Security Report
                        </div>
                        {result && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className={`btn btn-ghost ${!showFixed ? "tab-active" : ""}`}
                                    style={{ fontSize: 12 }}
                                    onClick={() => setShowFixed(false)}
                                >Diff View</button>
                                <button
                                    className={`btn btn-ghost ${showFixed ? "tab-active" : ""}`}
                                    style={{ fontSize: 12 }}
                                    onClick={() => setShowFixed(true)}
                                >Fixed Code</button>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* EMPTY STATE */}
                        {!result && !loading && !scanFailed && (
                            <motion.div key="empty" className="placeholder-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <ShieldAlert size={48} strokeWidth={1} />
                                <p>Paste code and run a scan to see results</p>
                            </motion.div>
                        )}

                        {/* SCAN FAILED STATE */}
                        {!result && !loading && scanFailed && (
                            <motion.div key="failed" className="placeholder-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <XCircle size={48} strokeWidth={1} style={{ color: "var(--danger)" }} />
                                <p style={{ color: "var(--danger)" }}>Scan Failed</p>
                                <p style={{ fontSize: 13, color: "var(--text-tertiary)", maxWidth: 320, textAlign: "center" }}>
                                    The scanner encountered an error. Check that the backend is running and try again.
                                </p>
                            </motion.div>
                        )}

                        {/* LOADING STATE */}
                        {loading && (
                            <motion.div key="loading" className="placeholder-state scan-progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <Loader2 size={40} className="loading-spinner" style={{ color: "var(--accent)" }} />
                                <p className="loading-text">AI is analyzing your code...</p>
                                <div className="scan-progress-bar" />
                            </motion.div>
                        )}

                        {/* RESULTS */}
                        {result && (
                            <motion.div key="results" className="results-wrapper" variants={stagger} initial="hidden" animate="visible">
                                {/* Status Badge */}
                                <motion.div
                                    variants={fadeUp}
                                    className={`status-badge ${result.ai.verified_secure ? "verified" : "warning"}`}
                                >
                                    <span className="status-badge-icon">
                                        {result.ai.verified_secure ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                                    </span>
                                    {result.ai.verified_secure
                                        ? "Verified Secure — The AI fix passed re-scan."
                                        : "Manual Review Recommended — Automated verification flagged issues."}
                                </motion.div>

                                {/* Risk Analysis */}
                                <motion.div variants={fadeUp} className="result-card">
                                    <div className="result-card-header">
                                        <span className="result-card-title danger"><ShieldAlert size={14} /> Vulnerability Report</span>
                                    </div>
                                    <div className="result-card-body">
                                        <p className="result-card-text">
                                            {typeof result.ai.risk_analysis === "string" ? result.ai.risk_analysis : "Analysis available."}
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Toggle: Diff or Fixed Code */}
                                <motion.div variants={fadeUp}>
                                    {showFixed ? (
                                        <CodeCard code={result.ai.fixed_code} language={language} />
                                    ) : (
                                        <DiffResult oldCode={code} newCode={result.ai.fixed_code} />
                                    )}
                                </motion.div>

                                {/* Explanation */}
                                {result.ai.explanation && (
                                    <motion.div variants={fadeUp} className="explanation-card">
                                        <div className="explanation-header"><Lightbulb size={14} /> Why was this dangerous?</div>
                                        <div className="explanation-body">{result.ai.explanation}</div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
