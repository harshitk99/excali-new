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
          <h1 className="title">SYNCART</h1>
          <p className="subtitle">
            Create, collaborate, and share your artwork in real-time. 
            Join artists from around the world in our collaborative drawing platform.
          </p>
        </div>

        <div className="section">
          <h2 className="section-title">Features</h2>
          <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Real-Time Drawing</h3>
              <p>Draw together with instant synchronization</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Multi-User Collaboration</h3>
              <p>See others draw live with cursor tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Advanced Tools</h3>
              <p>Lines, shapes, colors, and image support</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Get Started</h2>
          <p className="section-description">
            Join thousands of artists already creating on SYNCART
          </p>
          <button onClick={handleGetStarted} className="btn btn-primary">
            {isLoggedIn ? 'Start Drawing' : 'Sign Up Now'}
          </button>
        </div>

        <div className="divider">
          <span className="divider-text">or</span>
        </div>

        <div className="section">
          <h2 className="section-title">Already have an account?</h2>
          <p className="section-description">
            Sign in to continue your artistic journey
          </p>
          <button onClick={() => router.push('/login')} className="btn btn-secondary">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
