import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [tokens, setTokens] = useState([]);
  const [formData, setFormData] = useState({
    platform: "",
    tokenName: "",
    username: "",
    tokenValue: "",
  });
  const [showToast, setShowToast] = useState(false);

  const API_URL = "http://localhost:5000/api/tokens";

  // 🔄 Fetch all tokens from MongoDB on component load
  const fetchTokens = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      setTokens(response.data);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // 📝 Handle Form Input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // 📥 Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/add`, formData);
      // Reset form fields
      setFormData({
        platform: "",
        tokenName: "",
        username: "",
        tokenValue: "",
      });
      // Refresh list from DB
      fetchTokens();
    } catch (error) {
      console.error("Error saving token:", error);
      alert("Failed to save token.");
    }
  };

  // 📋 The Clipboard Magic Route
  const copyToClipboard = (value) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      })
      .catch((err) => console.error("Clipboard copy failed:", err));
  };

  return (
    <div className="container">
      <h1>📎 TokenClippy</h1>
      <p>Your local command-line access tokens, one click away.</p>

      {/* Form Submission Block */}
      <form className="token-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="platform">Platform</label>
          <input
            type="text"
            id="platform"
            value={formData.platform}
            onChange={handleChange}
            placeholder="e.g. GitLab"
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
            placeholder="e.g. Push Token"
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
            placeholder="e.g. vihanga123"
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
            placeholder="glpat-xxxxxx"
            required
          />
        </div>
        <button type="submit">Add Token</button>
      </form>

      {/* Table to display loaded data */}
      <table>
        <thead>
          <tr>
            <th>Platform</th>
            <th>Token Name</th>
            <th>Username</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tokens.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", color: "#a6adc8" }}>
                No developer tokens stored yet. Add one above!
              </td>
            </tr>
          ) : (
            tokens.map((token) => (
              <tr key={token._id}>
                <td>
                  <strong>{token.platform}</strong>
                </td>
                <td>{token.tokenName}</td>
                <td>
                  <code>{token.username}</code>
                </td>
                <td>
                  <button onClick={() => copyToClipboard(token.tokenValue)}>
                    Copy Token
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Toast Notification Element */}
      {showToast && <div className="toast">Copied to clipboard! 📋</div>}
    </div>
  );
}

export default App;
