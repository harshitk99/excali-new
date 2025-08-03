"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router=useRouter();
  
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3001/signin", {
        email,
        password,
      });
      // Handle success (e.g., redirect, save token, etc)
      console.log(response.data);
      alert("Login successful!");
      router.push("/join");
    } catch (err) {
      setError(
        //@ts-ignore
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:outline-none"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && (
            <div className="text-red-500 text-center mt-2">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
