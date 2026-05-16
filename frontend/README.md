# 🛡️ MantleGuard

> AI-Powered Smart Contract Auditor for Mantle Network

## What is MantleGuard?

MantleGuard is an AI-powered smart contract auditing tool built specifically for the Mantle Network. Developers paste their Solidity code and instantly receive a detailed security audit — powered by AI and permanently logged on the Mantle blockchain.

## Features

- AI-powered vulnerability detection (Critical, High, Medium, Low)
- Security scoring out of 100
- Gas optimization suggestions
- Mantle-specific recommendations
- On-chain audit logging via smart contract
- Verifiable audit history on Mantle Explorer

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **AI:** Groq API (Llama 3.3 70B)
- **Blockchain:** Solidity on Mantle Sepolia Testnet
- **Library:** Ethers.js

## Smart Contract

Deployed on Mantle Sepolia Testnet:
`0x840D650ce282D3896AD6484C097c22bE4e1B4F7b`

## How It Works

1. Paste your Solidity smart contract
2. Click "Audit My Contract"
3. AI analyzes for vulnerabilities, gas issues, and Mantle-specific recommendations
4. Security score is calculated
5. Audit result is permanently logged on Mantle blockchain
6. View your audit transaction on Mantle Explorer

## Setup

### Backend
cd backend
npm install
node index.js

### Frontend
cd frontend
npm install
npm start

## Hackathon

Built for the Mantle Turing Test Hackathon 2026 — AI DevTools Track