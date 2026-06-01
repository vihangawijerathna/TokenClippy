import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin, googleLogout } from "@react-oauth/google";

function App() {
  const [userToken, setUserToken] = useState(() => {
    // Read directly from storage synchronously during initialization to avoid array casting
    const saved = localStorage.getItem("token");
    return saved ? String(saved).trim() : null;
  });
  const [tokens, setTokens] = useState([]);
  const [formData, setFormData] = useState({
    platform: "",
    tokenName: "",
    username: "",
    tokenValue: "",
    expirationOption: "never",
  });
  const [showToast, setShowToast] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ⚡ Guaranteed pure string header evaluation
  const getAuthHeader = (explicitToken = null) => {
    const rawToken =
      explicitToken || userToken || localStorage.getItem("token");
    const sanitizedToken = rawToken ? String(rawToken).trim() : "";
    return {
      headers: {
        Authorization: `Bearer ${sanitizedToken}`,
      },
    };
  };

  // 📥 Central Fetch Engine
  const fetchTokens = async (explicitToken = null) => {
    const tokenToUse = explicitToken || userToken;
    if (!tokenToUse) return;

    try {
      const response = await axios.get(
        `${API_URL}/all`,
        getAuthHeader(tokenToUse),
      );
      setTokens(response.data);
      setFailedAttempts(0); // Reset consecutive failure counters
    } catch (error) {
      console.error("Error fetching tokens:", error);

      if (error.response?.status === 401) {
        const nextFailCount = failedAttempts + 1;
        setFailedAttempts(nextFailCount);

        // Only clear session state if authentication completely fails 3 times consecutively
        if (nextFailCount >= 3) {
          alert("Your session has expired. Please log in again.");
          handleLogout();
          setFailedAttempts(0);
        }
      }
    }
  };

  useEffect(() => {
    let interval = null;

    if (userToken) {
      // Fire immediately on load
      fetchTokens();

      // Setup the background loop cleanly
      interval = setInterval(() => {
        fetchTokens();
      }, 30000);
    }

    // 🔥 THE FIX: This cleanup function destroys the previous timer
    // when Strict Mode remounts the component!
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [userToken]);

  const handleLoginSuccess = (credentialResponse) => {
    const token = String(credentialResponse.credential).trim();
    localStorage.setItem("token", token);
    setUserToken(token);

    // Direct execution injection to completely bypass async React hook delays
    fetchTokens(token);
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem("token");
    setUserToken(null);
    setTokens([]);
    setFailedAttempts(0);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/add`, formData, getAuthHeader());

      setFormData({
        platform: "",
        tokenName: "",
        username: "",
        tokenValue: "",
        expirationOption: "never",
      });
      fetchTokens();
    } catch (error) {
      console.error("Error saving token:", error);
    }
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this token permanently?")
    ) {
      try {
        await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        fetchTokens();
      } catch (error) {
        console.error("Error deleting token:", error);
      }
    }
  };

  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return { text: "Never", className: "expiry-never" };
    const diffMs = new Date(expiresAt) - new Date();
    if (diffMs <= 0) return { text: "Expired", className: "expiry-danger" };
    const diffHrs = diffMs / (1000 * 60 * 60);
    if (diffHrs < 1)
      return {
        text: `${Math.max(1, Math.round(diffMs / (1000 * 60)))}m left`,
        className: "expiry-danger",
      };
    if (diffHrs < 24)
      return {
        text: `${Math.round(diffHrs)}h left`,
        className: "expiry-warning",
      };
    return {
      text: `${Math.round(diffHrs / 24)}d left`,
      className: "expiry-safe",
    };
  };

  if (!userToken) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", paddingTop: "100px" }}
      >
        <h1>📎 TokenClippy</h1>
        <p>
          Authenticate with your Google account to unlock your developer token
          vaults.
        </p>
        <div style={{ display: "inline-block", marginTop: "20px" }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => alert("Google Login Failed")}
            theme="filled_dark"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1>📎 TokenClippy</h1>
          <p>
            Secure local command-line access tokens with automated cloud
            auto-destruct.
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{ background: "#f38ba8", color: "#11111b" }}
        >
          Logout
        </button>
      </div>

      <form className="token-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="platform">Platform</label>
          <input
            type="text"
            id="platform"
            value={formData.platform}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tokenName">Token Name</label>
          <input
            type="text"
            id="tokenName"
            value={formData.tokenName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="tokenValue">Token/Key</label>
          <input
            type="password"
            id="tokenValue"
            value={formData.tokenValue}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="expirationOption">Expires In</label>
          <select
            id="expirationOption"
            value={formData.expirationOption}
            onChange={handleChange}
          >
            <option value="never">Never (Persistent)</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
          </select>
        </div>
        <button type="submit">Add Token</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Platform</th>
            <th>Token Name</th>
            <th>Username</th>
            <th style={{ width: "70px", textAlign: "center" }}>Copy</th>
            <th style={{ width: "160px" }}>Expiration Time</th>
            <th style={{ width: "70px", textAlign: "center" }}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {tokens.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", color: "#a6adc8" }}>
                No secure tokens active. Provision one above!
              </td>
            </tr>
          ) : (
            tokens.map((token) => {
              const status = getExpirationStatus(token.expiresAt);
              return (
                <tr key={token._id}>
                  <td>
                    <strong>{token.platform}</strong>
                  </td>
                  <td>{token.tokenName}</td>
                  <td>
                    <code>{token.username}</code>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="icon-btn copy"
                      onClick={() => copyToClipboard(token.tokenValue)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0-2-.9-2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                      </svg>
                    </button>
                  </td>
                  <td>
                    <div className={`expiry-badge ${status.className}`}>
                      <svg viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                      </svg>
                      <span>{status.text}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(token._id)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {showToast && <div className="toast">Copied to clipboard! 📋</div>}
    </div>
  );
}

export default App;
