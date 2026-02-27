import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, Zap, Lock, Eye } from "lucide-react";
import "./LandingPage.css";

/* ── Floating animation helper ── */
const floatAnim = (delay = 0, range = 12) => ({
    animate: { y: [0, -range, 0], rotate: [-1.5, 1.5, -1.5] },
    transition: { duration: 6 + delay, ease: "easeInOut", repeat: Infinity, delay },
});

/* ── Actual SVG logos for each language ── */
const LogoSVGs = {
    Python: (
        <svg viewBox="0 0 256 255" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pyBlu" x1="12%" y1="12%" x2="88%" y2="88%">
                    <stop offset="0" stopColor="#387EB8" />
                    <stop offset="1" stopColor="#366994" />
                </linearGradient>
                <linearGradient id="pyYel" x1="12%" y1="12%" x2="88%" y2="88%">
                    <stop offset="0" stopColor="#FFE052" />
                    <stop offset="1" stopColor="#FFC331" />
                </linearGradient>
            </defs>
            <path fill="url(#pyBlu)" d="M126.9 0C62.4 0 66.2 27.8 66.2 27.8l.1 28.8h61.7v8.6H41.5S0 60.5 0 125.6c0 65.1 36 62.7 36 62.7h21.5v-30.2s-1.2-36 35.4-36h61c0 0 34.2.6 34.2-33.1V34.4C188.1 34.4 191.3 0 126.9 0zm-34 19.6c6.1 0 11.1 5 11.1 11.1s-5 11.1-11.1 11.1-11.1-5-11.1-11.1 5-11.1 11.1-11.1z" />
            <path fill="url(#pyYel)" d="M128.9 255c64.5 0 60.7-27.8 60.7-27.8l-.1-28.8h-61.7v-8.6h86.5s41.5 4.7 41.5-60.4c0-65.1-36-62.7-36-62.7H198.3v30.2s1.2 36-35.4 36h-61s-34.2-.6-34.2 33.1v55.6c0 0-3.2 33.4 61.2 33.4zm34-19.6c-6.1 0-11.1-5-11.1-11.1s5-11.1 11.1-11.1 11.1 5 11.1 11.1-5 11.1-11.1 11.1z" />
        </svg>
    ),
    JavaScript: (
        <svg viewBox="0 0 256 256" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" rx="20" fill="#F7DF1E"/>
            <text x="28" y="210" fontFamily="Arial Black, Arial, sans-serif" fontSize="128" fontWeight="900" fill="#323230">JS</text>
        </svg>
    ),
    TypeScript: (
        <svg viewBox="0 0 256 256" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" rx="20" fill="#3178C6" />
            <path fill="white" d="M150.6 200.8v27.3c4.4 2.3 9.7 4 15.7 5.1 6 1.1 12.3 1.7 18.9 1.7 6.4 0 12.5-.7 18.3-2 5.8-1.3 10.9-3.5 15.3-6.6 4.4-3.1 7.9-7.1 10.4-12 2.6-4.9 3.9-10.9 3.9-18 0-5.2-.8-9.7-2.3-13.6-1.5-3.9-3.8-7.4-6.8-10.4-3-3-6.7-5.7-11.1-8.1-4.4-2.4-9.4-4.7-15.1-6.9-4.1-1.6-7.7-3.1-10.7-4.6-3-1.5-5.5-3-7.5-4.6-2-1.6-3.4-3.2-4.4-5-.9-1.8-1.4-3.8-1.4-6.1 0-2.1.5-4 1.5-5.7 1-1.7 2.4-3.1 4.2-4.3 1.8-1.2 4-2.1 6.5-2.8 2.5-.6 5.3-.9 8.3-.9 2.2 0 4.5.2 6.8.5 2.3.3 4.6.9 6.9 1.6 2.3.8 4.5 1.7 6.6 2.9 2.1 1.2 4 2.5 5.7 4v-25.4c-3.7-1.4-7.8-2.4-12.3-3.1-4.5-.7-9.5-1-14.9-1-6.4 0-12.4.7-18.1 2.2-5.7 1.5-10.7 3.7-15 6.8-4.3 3.1-7.7 7-10.2 11.7-2.5 4.7-3.7 10.3-3.7 16.8 0 8.3 2.4 15.3 7.1 21.1 4.7 5.8 11.9 10.7 21.6 14.7 4.3 1.7 8.3 3.4 11.8 5.1 3.5 1.7 6.5 3.4 9 5.2 2.4 1.8 4.3 3.8 5.7 5.9 1.3 2.1 2 4.5 2 7.2 0 2-.5 3.9-1.4 5.6-.9 1.7-2.3 3.2-4.1 4.4-1.8 1.2-4 2.2-6.7 2.9-2.7.7-5.8 1-9.3 1-6 0-12-.9-17.8-2.8-5.8-1.8-11.2-4.7-16.1-8.6zm-48.4-89.2H64v-23H168v23h-37.9v108.3h-27.9V111.6z" />
        </svg>
    ),
    Java: (
        <svg viewBox="0 0 256 346" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA2D2E" d="M82.6 267.4s-13.2 7.7 9.4 10.3c27.3 3.1 41.3 2.7 71.4-3.1 0 0 7.9 5 19 9.3-67.5 28.9-152.9-1.7-99.8-16.5z" />
            <path fill="#EA2D2E" d="M74.4 229.5s-14.8 11 7.8 13.3c29.2 3 52.3 3.2 92.2-4.3 0 0 5.5 5.6 14.2 8.6-81.7 23.9-172.7 1.9-114.2-17.6z" />
            <path fill="#EA2D2E" d="M140.9 165.3c16.6 19.1-4.4 36.3-4.4 36.3s42.2-21.8 22.8-49.1c-18-25.4-31.9-38 43.1-81.5 0 0-117.8 29.4-61.5 94.3z" />
            <path fill="#EA2D2E" d="M228.4 295.6s9.8 8-10.8 14.2c-39.2 11.9-163.1 15.5-197.6.5-12.4-5.4 10.8-12.9 18.1-14.5 7.6-1.6 11.9-1.3 11.9-1.3-13.7-9.7-88.6 18.9-38 27.1 137.8 22.3 251.2-10 216.4-26z" />
            <path fill="#EA2D2E" d="M88.8 190.3s-62.8 14.9-22.3 20.3c17.1 2.3 51.1 1.8 82.8-.9 25.9-2.2 52-6.9 52-6.9s-9.2 3.9-15.8 8.5c-63.8 16.8-187.1 9-151.6-8.2 29.9-14.9 54.9-12.8 54.9-12.8z" />
            <path fill="#EA2D2E" d="M195.3 250.8c64.9-33.7 34.9-66.1 13.9-61.8-5.1 1.1-7.4 2-7.4 2s1.9-3 5.5-4.3c41-14.4 72.6 42.5-13.3 65.1 0 0 1-.9 1.3-1z" />
            <path fill="#EA2D2E" d="M152.4 0s35.9 35.9-34.1 91.1c-56.1 44.3-12.8 69.6 0 98.5-32.8-29.6-56.8-55.7-40.7-79.9C99.7 75.5 168.6 58.2 152.4 0z" />
            <path fill="#EA2D2E" d="M95.2 344.3c62.3 4 158-.4 160.3-16.3 0 0-4.3 11.2-51.5 20.1-53.5 10-119.5 8.8-158.6 2.4 0 0 8 6.6 49.8 6.6v-12.8z" />
        </svg>
    ),
};

function FloatingLogo({ lang, top, left, right, bottom, delay }) {
    return (
        <motion.div
            className="float-logo"
            style={{ top, left, right, bottom }}
            animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 6 + delay, ease: "easeInOut", repeat: Infinity, delay }}
        >
            {LogoSVGs[lang]}
            <span className="float-logo-label">{lang}</span>
        </motion.div>
    );
}

const features = [
    {
        icon: <Zap size={18} />,
        title: "AI-Powered Fixes",
        desc: "Llama 3.3 70B hunts vulnerabilities and generates battle-tested patches automatically.",
    },
    {
        icon: <Lock size={18} />,
        title: "Multi-Language",
        desc: "Python via Bandit, Java via OWASP regex — with more languages on the roadmap.",
    },
    {
        icon: <Eye size={18} />,
        title: "Verified Secure",
        desc: "Every fix is re-scanned before delivery. Verified badge or manual-review warning.",
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            {/* ── GEOMETRIC BG SHAPES ── */}
            <div className="geo-shapes" aria-hidden="true">
                <div className="geo-circle geo-circle-1" />
                <div className="geo-circle geo-circle-2" />
                <div className="geo-rect geo-rect-1" />
                <div className="geo-rect geo-rect-2" />
                <div className="geo-ring geo-ring-1" />
            </div>

            {/* ── FLOATING LANGUAGE LOGOS ── */}
            <FloatingLogo lang="Python" top="22%" left="5%" delay={0} />
            <FloatingLogo lang="Java" top="38%" right="4%" delay={1.5} />
            <FloatingLogo lang="JavaScript" bottom="30%" left="6%" delay={0.8} />
            <FloatingLogo lang="TypeScript" bottom="22%" right="5%" delay={2} />

            {/* ── FLOATING NAVBAR ── */}
            <nav className="land-nav">
                <div className="land-nav-left">
                    <div className="land-logo">
                        <ShieldCheck size={15} color="white" />
                    </div>
                    <span className="land-brand">SecureScan AI</span>
                </div>

                <div className="land-nav-center">
                    <button className="land-link" onClick={() => navigate("/dashboard")}>
                        Dashboard
                    </button>
                    <a
                        className="land-link"
                        href="https://github.com/Shubham-711/Smart-security-scanner"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                    </a>
                </div>

                <div className="land-nav-right">
                    <motion.button
                        className="land-nav-cta"
                        onClick={() => navigate("/dashboard")}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        Get Started
                    </motion.button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="land-hero">
                <motion.div
                    className="land-hero-content"
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="land-headline">
                        Scan vulnerabilities.<br />
                        <span className="land-headline-plain">Ship secure code.</span>
                    </h1>
                    <p className="land-sub">
                        AI-powered static analysis that finds bugs, generates verified fixes,
                        and explains every change — in seconds.
                    </p>

                    <div className="land-cta-row">
                        <motion.button
                            className="land-cta-primary"
                            onClick={() => navigate("/dashboard")}
                            whileHover={{ scale: 1.04, boxShadow: "0 0 32px rgba(75,110,245,0.5)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Get Started <ArrowRight size={15} />
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* ── FEATURE CARDS ── */}
            <section className="land-features">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        className="land-feature-card"
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="land-feat-icon">{f.icon}</div>
                        <h3 className="land-feat-title">{f.title}</h3>
                        <p className="land-feat-desc">{f.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* ── FOOTER ── */}
            <footer className="land-footer">
                <span>© 2026 SecureScan AI.</span>
            </footer>
        </div>
    );
}

