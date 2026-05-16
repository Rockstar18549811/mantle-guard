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

  const extractScore = (reportText) => {
    const match = reportText.match(/(\d+)\s*\/\s*100/);
    return match ? parseInt(match[1]) : 50;
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
      const response = await fetch("http://localhost:5000/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (data.report) {
        setReport(data.report);
        const extractedScore = extractScore(data.report);
        setScore(extractedScore);
        await logToChain(code, extractedScore);
      } else {
        setError("No report returned. Try again.");
      }
    } catch (err) {
      setError("Could not connect to backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s) => {
    if (s >= 80) return "#00ff88";
    if (s >= 50) return "#ffaa00";
    return "#ff4d4d";
  };

  const explorerUrl = "https://explorer.sepolia.mantle.xyz/tx/" + txHash;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>MantleGuard</h1>
        <p style={styles.subtitle}>
          AI-Powered Smart Contract Auditor for Mantle Network
        </p>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>Paste your Solidity code below:</label>
        <textarea
          style={styles.textarea}
          placeholder="pragma solidity ^0.8.0; contract MyContract { }"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          style={loading ? styles.buttonLoading : styles.button}
          onClick={handleAudit}
          disabled={loading}
        >
          {loading ? "Auditing..." : "Audit My Contract"}
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </div>

      {score !== null && (
        <div style={styles.scoreCard}>
          <h2 style={styles.scoreLabel}>Security Score</h2>
          <div style={{ fontSize: "72px", fontWeight: "bold", color: getScoreColor(score) }}>
            {score}/100
          </div>
        </div>
      )}

      {logging && (
        <p style={styles.chainStatus}>Logging audit to Mantle blockchain...</p>
      )}

      {txHash && (
        <div style={styles.txCard}>
          <p style={styles.txLabel}>Audit logged on-chain!</p>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={styles.txLink}>
            View on Mantle Explorer
          </a>
        </div>
      )}

      {report && (
        <div style={styles.reportCard}>
          <h2 style={styles.reportTitle}>Audit Report</h2>
          <pre style={styles.report}>{report}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#0a0a0f",
    color: "#ffffff",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "40px 20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #00d4ff, #7b2ff7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0",
  },
  subtitle: {
    color: "#888",
    fontSize: "18px",
    marginTop: "10px",
  },
  card: {
    backgroundColor: "#13131a",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "800px",
    margin: "0 auto",
    border: "1px solid #2a2a3a",
  },
  label: {
    fontSize: "16px",
    color: "#aaa",
    marginBottom: "12px",
    display: "block",
  },
  textarea: {
    width: "100%",
    height: "300px",
    backgroundColor: "#0d0d14",
    color: "#00d4ff",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "14px",
    fontFamily: "monospace",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#7b2ff7",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonLoading: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    backgroundColor: "#444",
    color: "#aaa",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "not-allowed",
  },
  error: {
    color: "#ff4d4d",
    marginTop: "12px",
    textAlign: "center",
  },
  scoreCard: {
    textAlign: "center",
    margin: "32px auto 0",
    maxWidth: "800px",
  },
  scoreLabel: {
    color: "#aaa",
    marginBottom: "8px",
  },
  chainStatus: {
    textAlign: "center",
    color: "#00d4ff",
    marginTop: "16px",
  },
  txCard: {
    textAlign: "center",
    marginTop: "16px",
  },
  txLabel: {
    color: "#00ff88",
    fontSize: "16px",
  },
  txLink: {
    color: "#00d4ff",
    fontSize: "14px",
  },
  reportCard: {
    backgroundColor: "#13131a",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "800px",
    margin: "32px auto 0",
    border: "1px solid #2a2a3a",
  },
  reportTitle: {
    color: "#00d4ff",
    marginTop: "0",
  },
  report: {
    color: "#ccc",
    fontSize: "14px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    lineHeight: "1.8",
  },
};

export default App;