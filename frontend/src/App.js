import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x840D650ce282D3896AD6484C097c22bE4e1B4F7b";
const CONTRACT_ABI = [
  "function logAudit(bytes32 codeHash, uint256 score) public",
  "function getAuditCount() public view returns (uint256)",
];

function App() {
  const [code, setCode] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [score, setScore] = useState(null);
  const [issues, setIssues] = useState({ critical: 0, high: 0, medium: 0, low: 0 });

  const extractScore = (reportText) => {
    const match = reportText.match(/(\d+)\s*\/\s*100/);
    return match ? parseInt(match[1]) : 50;
  };

  const extractIssues = (reportText) => {
    const critical = (reportText.match(/critical/gi) || []).length;
    const high = (reportText.match(/\bhigh\b/gi) || []).length;
    const medium = (reportText.match(/medium/gi) || []).length;
    const low = (reportText.match(/\blow\b/gi) || []).length;
    return { critical, high, medium, low };
  };

  const logToChain = async (codeText, securityScore) => {
    try {
      setLogging(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const codeHash = ethers.keccak256(ethers.toUtf8Bytes(codeText));
      const tx = await contract.logAudit(codeHash, securityScore);
      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Chain logging error:", err);
    } finally {
      setLogging(false);
    }
  };

  const handleAudit = async () => {
    if (!code.trim()) {
      setError("Please paste your Solidity code first.");
      return;
    }
    setLoading(true);
    setError("");
    setReport("");
    setTxHash("");
    setScore(null);

    try {
      const response = await fetch("https://mantle-guard-production.up.railway.app/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        const extractedScore = extractScore(data.report);
        const extractedIssues = extractIssues(data.report);
        setScore(extractedScore);
        setIssues(extractedIssues);
        await logToChain(code, extractedScore);
      } else {
        setError("No report returned. Try again.");
      }
    } catch (err) {
      setError("Could not connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return "#1D9E75";
    if (s >= 50) return "#EF9F27";
    return "#E24B4A";
  };

  const getRiskLabel = (s) => {
    if (s >= 80) return "Low risk";
    if (s >= 50) return "Medium risk";
    return "Critical risk detected";
  };

  return (
    <div style={s.page}>
      <nav style={s.navbar}>
        <div style={s.navLogo}>
          <div style={s.logoIcon}>
            <span style={{ color: "#fff", fontSize: 16 }}>🛡️</span>
          </div>
          <span style={s.logoText}>MantleGuard</span>
          <span style={s.navBadge}>Mantle Sepolia</span>
        </div>
        <div style={s.navLinks}>
          <a href="https://github.com/Rockstar18549811/mantle-guard" target="_blank" rel="noopener noreferrer" style={s.navLink}>GitHub</a>
          <a href={"https://explorer.sepolia.mantle.xyz/address/" + CONTRACT_ADDRESS} target="_blank" rel="noopener noreferrer" style={s.navLink}>Explorer</a>
        </div>
      </nav>

      <div style={s.hero}>
        <div style={s.heroTag}>
          <div style={s.heroDot}></div>
          AI-Powered Auditor on Mantle
        </div>
        <h1 style={s.heroTitle}>Audit smarter.<br /><span style={{ color: "#7B6FFF" }}>Ship safer.</span></h1>
        <p style={s.heroSub}>Paste your Solidity code and get an instant AI security audit — vulnerabilities, gas optimizations, and a permanent on-chain record on Mantle.</p>
        <div style={s.statsRow}>
          <div style={s.stat}>
            <div style={s.statNum}>On-chain</div>
            <div style={s.statLabel}>Permanent record</div>
          </div>
          <div style={s.statDivider}></div>
          <div style={s.stat}>
            <div style={s.statNum}>AI</div>
            <div style={s.statLabel}>Powered analysis</div>
          </div>
          <div style={s.statDivider}></div>
          <div style={s.stat}>
            <div style={s.statNum}>Free</div>
            <div style={s.statLabel}>No signup needed</div>
          </div>
        </div>
      </div>

      <div style={s.mainCard}>
        <div style={s.cardTabs}>
          <div style={s.tabActive}>Paste code</div>
        </div>
        <textarea
          style={s.textarea}
          placeholder={"// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract MyContract {\n  // paste your code here\n}"}
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div style={s.cardFooter}>
          <div style={s.fileInfo}>🗂 {code ? code.length + " bytes" : "No file loaded"}</div>
          <button style={loading ? s.auditBtnLoading : s.auditBtn} onClick={handleAudit} disabled={loading}>
            {loading ? "Auditing..." : "Audit my contract"}
          </button>
        </div>
      </div>

      {error && <div style={s.errorBar}>{error}</div>}

      {score !== null && (
        <div style={s.resultsRow}>
          <div style={s.resultCard}>
            <div style={s.resultLabel}>Security score</div>
            <div style={{ ...s.resultValue, color: getScoreColor(score) }}>{score}/100</div>
            <div style={s.resultSub}>{getRiskLabel(score)}</div>
          </div>
          <div style={s.resultCard}>
            <div style={s.resultLabel}>Issues found</div>
            <div style={{ ...s.resultValue, color: "#EF9F27" }}>{issues.critical + issues.high + issues.medium + issues.low}</div>
            <div style={s.resultSub}>{issues.critical} critical, {issues.high} high, {issues.medium} med</div>
          </div>
          <div style={s.resultCard}>
            <div style={s.resultLabel}>Audit status</div>
            <div style={{ ...s.resultValue, color: "#1D9E75", fontSize: 16, marginTop: 6 }}>{logging ? "Logging..." : txHash ? "On-chain" : "Complete"}</div>
            <div style={s.resultSub}>{txHash ? "Mantle Sepolia" : "AI analysis done"}</div>
          </div>
        </div>
      )}

      {txHash && (
        <div style={s.chainBar}>
          <div style={s.chainDot}></div>
          <div style={s.chainText}>Audit logged on Mantle Sepolia blockchain</div>
          <a href={"https://explorer.sepolia.mantle.xyz/tx/" + txHash} target="_blank" rel="noopener noreferrer" style={s.chainLink}>
            View on explorer
          </a>
        </div>
      )}

      {report && (
        <div style={s.reportCard}>
          <div style={s.reportHeader}>Audit report</div>
          <pre style={s.reportBody}>{report}</pre>
        </div>
      )}

      <div style={s.footer}>
        Built for Mantle Turing Test Hackathon 2026 — AI DevTools Track
      </div>
    </div>
  );
}

const s = {
  page: { background: "#0a0a12", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" },
  navbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" },
  navLogo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, background: "#5B3FE8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 16, fontWeight: 500, color: "#fff" },
  navBadge: { fontSize: 11, padding: "3px 10px", background: "rgba(91,63,232,0.2)", color: "#9B7FFF", borderRadius: 20, border: "0.5px solid rgba(91,63,232,0.4)" },
  navLinks: { display: "flex", gap: 24 },
  navLink: { fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" },
  hero: { padding: "48px 32px 32px", textAlign: "center" },
  heroTag: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9B7FFF", background: "rgba(91,63,232,0.12)", border: "0.5px solid rgba(91,63,232,0.3)", padding: "4px 12px", borderRadius: 20, marginBottom: 20 },
  heroDot: { width: 6, height: 6, background: "#5B3FE8", borderRadius: "50%" },
  heroTitle: { fontSize: 36, fontWeight: 500, color: "#fff", marginBottom: 12, lineHeight: 1.2 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 },
  statsRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: 32, marginBottom: 36 },
  stat: { textAlign: "center" },
  statNum: { fontSize: 18, fontWeight: 500, color: "#fff" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  statDivider: { width: 1, height: 32, background: "rgba(255,255,255,0.08)" },
  mainCard: { margin: "0 32px 24px", background: "#13131f", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" },
  cardTabs: { display: "flex", borderBottom: "0.5px solid rgba(255,255,255,0.08)" },
  tabActive: { padding: "12px 20px", fontSize: 13, color: "#7B6FFF", borderBottom: "1.5px solid #7B6FFF" },
  textarea: { width: "100%", minHeight: 200, background: "#0d0d18", border: "none", padding: 20, fontFamily: "monospace", fontSize: 13, color: "#61AFEF", lineHeight: 1.7, outline: "none", resize: "vertical", boxSizing: "border-box" },
  cardFooter: { padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "0.5px solid rgba(255,255,255,0.06)" },
  fileInfo: { fontSize: 12, color: "rgba(255,255,255,0.3)" },
  auditBtn: { display: "flex", alignItems: "center", gap: 8, background: "#5B3FE8", color: "#fff", fontSize: 13, fontWeight: 500, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer" },
  auditBtnLoading: { display: "flex", alignItems: "center", gap: 8, background: "#333", color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, padding: "10px 20px", borderRadius: 8, border: "none", cursor: "not-allowed" },
  errorBar: { margin: "0 32px 16px", padding: "12px 20px", background: "rgba(226,75,74,0.1)", border: "0.5px solid rgba(226,75,74,0.3)", borderRadius: 10, fontSize: 13, color: "#E24B4A" },
  resultsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "0 32px 24px" },
  resultCard: { background: "#13131f", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16 },
  resultLabel: { fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 },
  resultValue: { fontSize: 24, fontWeight: 500 },
  resultSub: { fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 },
  chainBar: { margin: "0 32px 24px", background: "#13131f", border: "0.5px solid rgba(29,158,117,0.3)", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 },
  chainDot: { width: 8, height: 8, background: "#1D9E75", borderRadius: "50%" },
  chainText: { fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 },
  chainLink: { fontSize: 11, color: "#1D9E75", textDecoration: "none" },
  reportCard: { margin: "0 32px 24px", background: "#13131f", border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" },
  reportHeader: { padding: "14px 20px", fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500, borderBottom: "0.5px solid rgba(255,255,255,0.06)" },
  reportBody: { padding: 20, fontSize: 13, color: "rgba(255,255,255,0.6)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.8 },
  footer: { textAlign: "center", padding: "24px 32px", fontSize: 11, color: "rgba(255,255,255,0.2)" },
};

export default App;