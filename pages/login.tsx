"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(""); // new status message
  const [loading, setLoading] = useState(false); // loading flag

  const handleLogin = async () => {
    if (!email || !password) {
      setStatus("Please fill in all fields");
      return;
    }

    setLoading(true);
    setStatus("Connecting to server...");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        setStatus(`Login successful! Welcome ${data.name}`);
        setTimeout(() => router.push("/Note"), 1000); // delay to show message
      } else {
        setStatus(data.error || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "35px 25px",
    borderRadius: "20px",
    background: "linear-gradient(145deg, #ffffff, #f0f4f8)",
    boxShadow: "8px 8px 15px rgba(0,0,0,0.05), -8px -8px 15px rgba(255,255,255,0.8)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: "'Segoe UI', sans-serif",
  };

  const inputStyle: React.CSSProperties = {
    padding: "14px 12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "16px",
    outline: "none",
    transition: "0.3s",
    backgroundColor: "#fafafa",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(90deg, #4f46e5, #6366f1)",
    color: "white",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(99, 102, 241, 0.3)",
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? "none" : "auto",
  };

  const buttonHoverStyle: React.CSSProperties = {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.4)",
  };

  const headerStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "10px",
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "700",
  };

  const statusStyle: React.CSSProperties = {
    textAlign: "center",
    fontSize: "14px",
    color: status.includes("successful") ? "#1cc88a" : "#e74a3b",
    minHeight: "20px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Login to Your Account</h2>
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
      />
      <button
        style={buttonStyle}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        onClick={handleLogin}
      >
        {loading ? "Connecting..." : "Login"}
      </button>

      <div style={statusStyle}>{status}</div>
    </div>
  );
}
