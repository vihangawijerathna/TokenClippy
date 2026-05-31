Here's your content properly formatted in Markdown:

````md
# 🚀 TokenClippy

TokenClippy is a secure, privacy-focused token manager designed for developers who are tired of losing track of their developer keys, GitLab Push Tokens, and API credentials.

## 💡 The Inspiration

If you use GitLab or similar platforms, you know the drill: you generate a GitLab Push Token, it displays **exactly once**, and you copy it to set up your workflow. But what happens a few weeks later when you need that exact same token for another machine or configuration?

Platforms won't show it to you again, forcing you to constantly create annoying new tokens. If you save them in a standard notepad file or a messy Google Doc, they are disorganized, hard to search, and completely exposed to anyone looking at your computer screen.

**TokenClippy was built to solve this exact problem.** It serves as your personal, secure vault that lets you store tokens under designated profiles with "click-to-copy" ease, while keeping the actual values hidden from shoulder-surfers.

---

## ✨ Features

- **🔒 Double-Layer Security:** Google OAuth keeps unwanted strangers out, while backend `AES-256` encryption protects your data at rest in MongoDB.
- **👁️ Screen Privacy:** Token values remain masked and "mysterious" by default so nobody looking at your screen can read them.
- **📋 One-Click Clipboard:** Fast copy-to-clipboard functionality means you never have to highlight, struggle with line breaks, or search through text files again.
- **⏳ Expiration Lifespans:** Set tokens to automatically expire and clean themselves up after a set duration, or keep them forever.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- `@react-oauth/google`

### Backend

- Node.js
- Express
- `google-auth-library`

### Database

- MongoDB Atlas (Mongoose)

### Encryption

- `crypto-js` (AES)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have:

- [Node.js](https://nodejs.org/) installed
- A Google Cloud Developer account (for OAuth)
- A MongoDB Atlas cluster configured

---

### 2. Backend Setup

#### Navigate to the backend directory

```bash
cd backend
```

#### Create a `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
SECRET_KEY=your_custom_cryptojs_aes_encryption_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

#### Install dependencies and start the development server

```bash
npm install
npm run dev
```

---

### 3. Frontend Setup

#### Navigate to the frontend directory

```bash
cd ../frontend
```

#### Install dependencies and launch the UI

```bash
npm install
npm run dev
```

#### Open your browser

Visit the local address provided by Vite (usually):

```text
http://localhost:5173
```

---

## 🛡️ Security Architecture

TokenClippy takes a Zero-Trust approach on the backend:

1. When you request your tokens, the client passes your Google JWT in the `Authorization: Bearer` header.
2. The custom `authUser` middleware securely decodes and validates this token against Google's core authentication engines.
3. The server queries only the records matching your unique Google sub-ID, decrypts the value server-side using your environment's `SECRET_KEY`, and returns it to your authenticated browser session.

---

## 📌 Why TokenClippy?

Instead of repeatedly generating new tokens or storing sensitive credentials in insecure notes, TokenClippy provides:

- Secure encrypted storage
- Fast retrieval and copying
- Privacy-friendly masked views
- Automatic expiration management
- Google-based authentication

All designed specifically for developers who manage multiple credentials every day.
````
