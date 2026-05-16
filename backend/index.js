const express = require("express");
const cors = require("cors");
const { Groq } = require("groq-sdk");

const app = express();
const port = process.env.PORT || 5000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post("/audit", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No Solidity code provided" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are MantleGuard, an expert Solidity smart contract auditor specialized in the Mantle blockchain. 
          Analyze the provided smart contract and return a structured audit report with:
          1. Security Vulnerabilities (critical, high, medium, low)
          2. Gas Optimization Suggestions
          3. Mantle-specific Recommendations
          4. Overall Security Score out of 100
          5. Summary
          Be specific, technical, and actionable.`,
        },
        {
          role: "user",
          content: `Audit this Solidity smart contract:\n\n${code}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const report = completion.choices[0]?.message?.content;
    res.json({ report });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ error: "AI audit failed. Check your API key." });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "MantleGuard API is running!" });
});

app.listen(port, () => {
  console.log(`MantleGuard backend running on port ${port}`);
});