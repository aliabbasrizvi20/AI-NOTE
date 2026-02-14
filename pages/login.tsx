"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and userName in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name);
        alert(`Login successful! Welcome ${data.name}`);
        router.push("/Note"); // redirect to Note page
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Try again.");
    }
  };

  // Inline styles
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

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Login to Your Account</h2>
      <input
        style={inputStyle}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        style={inputStyle}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        style={buttonStyle}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#4F46E5")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#6366F1")
        }
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
