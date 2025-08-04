"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push('/join');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="container">
      <ThemeToggle />
      <div className="content" style={{ maxWidth: '800px' }}>
        <div className="header">
          <h1 className="title">Real-Time Chat App</h1>
          <p className="subtitle">
            Connect with others instantly through our modern, real-time chat platform. 
            Create rooms, join conversations, and experience seamless communication.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Features</h2>
          <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Real-Time Messaging</h3>
              <p>Instant message delivery with live updates</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure Authentication</h3>
              <p>Safe and protected user accounts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Room Management</h3>
              <p>Create and join chat rooms easily</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Get Started</h2>
          <p className="section-description">
            Join thousands of users already connecting on our platform
          </p>
          <button onClick={handleGetStarted} className="btn btn-primary">
            {isLoggedIn ? 'Go to Rooms' : 'Sign Up Now'}
          </button>
        </div>

        <div className="divider">
          <span className="divider-text">or</span>
        </div>

        <div className="section">
          <h2 className="section-title">Already have an account?</h2>
          <p className="section-description">
            Sign in to continue your conversations
          </p>
          <button onClick={() => router.push('/login')} className="btn btn-secondary">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
