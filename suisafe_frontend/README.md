# 💸 Sui Safe – A Decentralized Savings & Staking Platform

Sui Safe is a Web3-native financial app that re-imagines traditional saving apps like PiggyVest and Cowrywise through a decentralized lens. Built on the Sui blockchain, it enables users to **save**, **stake**, and **earn interest**—all without relying on centralized intermediaries.

We aim to replace traditional identity systems (like usernames/passwords or phone numbers) with **Sui’s wallet abstraction** and a **zero-knowledge proof system** that ensures users can verify ownership and access without exposing private data.

---

## 🖼️ UI Preview

Explore our design system and layout:

[Figma Preview →](https://www.figma.com/design/tLzlNWl6c6YW3SZ7wvsQyf/SuiSafe?node-id=1-3&p=f)

---

## 🚀 Features

- 💰 **Decentralized Savings**: Users deposit crypto into smart vaults that grow over time.
- 🔒 **Zero-Knowledge Identity**: No phrases, no logins. Wallet-based and private.
- 📈 **Staking Pools**: Stake tokens with selected partners and earn passive yield.
- 🌐 **Multi-chain Ready** (future scope): Modular design to scale beyond Sui.
- 🧠 **Smart Contracts Integration**: Interact seamlessly with Sui’s smart modules using `sui.js`.

---

## 🧾 File Structure Overview

Here’s how the project is organized:

sui-safe/

├── public/                # Static assets

├── src/

│   ├── assets/            # Logos, icons, and media

│   ├── authentication/   

│   ├── admin/       

│   ├── components/        # UI building blocks (Buttons, Sidebar, Navbar, etc.)

│   ├── pages/             # Main route components (Home, Dashboard, Vaults)

│   ├── services/          # Sui-specific service logic (wallet, staking, etc.)

│   ├── utils/             # Helper functions (e.g., formatDate, calculateInterest)

│   ├── App.jsx            # Root component with routes

│   └── main.jsx           # Entry point

├── .env                  # API keys, chain config

├── package.json

└── README.md

---


## 🔌 Tech Stack

| Tech             | Use Case                                   |
|-----------------|--------------------------------------------|
| React            | Frontend UI                                |
| Vite             | Fast dev bundler                           |
| Sui.js / dapp-kit | Wallet connections & transaction handling |
| React Router DOM | Routing and protected routes               |
| UUID             | Lightweight ID generation                  |
| Tailwind CSS     | Styling (where used)                       |

---

## 🛡️ Authentication & Security Flow

1. Users open `/connect` to connect a supported wallet.
2. If already connected, `/connect` and `/` redirect automatically to `/dashboard`.
3. Wallet sessions persist in `localStorage` using `sui_session` and `sui_session_proof`.
4. Logout is performed by **clicking the Sui network badge**, which disconnects the wallet and clears the session.
5. Optional **zero-knowledge signing** is available for additional verification.
6. No private keys, seed phrases, or passwords are stored on the client.

This ensures:
- Privacy 🔐
- Self-custody 💼
- Seamless Web3 authentication experience

---

## 📈 Vision

Sui Safe aims to provide a **transparent**, **secure**, and **permissionless** alternative to centralized fintech platforms. Users will:

- Save and grow funds on-chain.
- Stake assets securely in vetted vaults.
- Maintain full control over their wallets, keys, and session data.
- Experience a frictionless Web3 authentication flow that doesn’t rely on usernames or passwords.

---

## ⚡ Current Roadmap

- ✅ Wallet connection & session persistence  
- ✅ Protected dashboard & pages  
- ✅ Optional zero-knowledge proof signing  
- 🔜 Multi-chain support  
- 🔜 Staking pools & interest accrual  
- 🔜 Advanced analytics & transaction history  
