"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ThemeToggle from "../components/ThemeToggle";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/signup", {
        name,
        email,
        password,
      });

      localStorage.setItem('userName', name);
      console.log("Signup successful:", response.data);
      router.push("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <ThemeToggle />
      <div className="content">
        <div className="header">
          <h1 className="title">Create Account</h1>
          <p className="subtitle">
            Join our community and start chatting with others
          </p>
        </div>

        <form onSubmit={handleSignup} className="section">
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

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
              {isLoading ? "Creating Account..." : "Create Account"}
            </div>
          </button>
        </form>

        <div className="divider">
          <span className="divider-text">or</span>
        </div>

        <div className="section">
          <h2 className="section-title">Already have an account?</h2>
          <p className="section-description">
            Sign in to your existing account
          </p>
          <button
            onClick={() => router.push("/login")}
            className="btn btn-secondary"
          >
            Sign In
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
