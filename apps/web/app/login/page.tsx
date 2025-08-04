"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/join');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/signin", {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userName', response.data.userName);
      router.push("/join");
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <ThemeToggle />
      <div className="content">
        <div className="header">
          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">
            Sign in to your account to continue chatting with others
          </p>
        </div>

        <form onSubmit={handleLogin} className="section">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            <div className="btn-content">
              {isLoading && <div className="spinner"></div>}
              {isLoading ? "Signing In..." : "Sign In"}
            </div>
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">or</span>
        </div>

        <div className="section">
          <h2 className="section-title">Don't have an account?</h2>
          <p className="section-description">
            Create a new account to start chatting
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="btn btn-secondary"
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="alert error">
            <div className="alert-icon error-icon">!</div>
            <p className="alert-message error-message">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
