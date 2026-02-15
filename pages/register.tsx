"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPass, setRegisterPass] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPass) {
      setStatusMsg("Please fill all fields");
      return;
    }
    setLoading(true);
    setStatusMsg("Registering...");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPass,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMsg("Registered successfully! Redirecting...");
        setTimeout(() => router.push("/login"), 1000);
      } else {
        setStatusMsg(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#F9FAFB",
    display: "flex",
    flexDirection: "column" as "column",
    gap: "15px",
    fontFamily: "Arial, sans-serif",
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6366F1",
    color: "white",
    fontWeight: "bold" as "bold",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const headerStyle = {
    textAlign: "center" as "center",
    marginBottom: "10px",
    color: "#4B5563",
    fontSize: "22px",
    fontWeight: "bold" as "bold",
  };

  const statusStyle = {
    textAlign: "center" as "center",
    color: "#333",
    fontSize: "14px",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Create Your Account</h2>
      <input
        style={inputStyle}
        type="text"
        placeholder="Name"
        value={registerName}
        onChange={(e) => setRegisterName(e.target.value)}
      />
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={registerEmail}
        onChange={(e) => setRegisterEmail(e.target.value)}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={registerPass}
        onChange={(e) => setRegisterPass(e.target.value)}
      />
      <button
        style={buttonStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#4F46E5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#6366F1")
        }
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
      {statusMsg && <p style={statusStyle}>{statusMsg}</p>}
    </div>
  );
}
