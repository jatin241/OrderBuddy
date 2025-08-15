import React, { useEffect, useState } from "react";
import "./Home.css";
import MyOrders from "./MyOrders";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">OrderBuddy</div>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <a href="/join-orders" className="nav-btn">Join Orders</a>

              {/* My Orders dropdown */}
              <div className="nav-btn dropdown">
                <span>My Orders ▼</span>
                <div className="dropdown-content">
                  <MyOrders token={localStorage.getItem("token")} />
                </div>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="nav-btn">Login</a>
              <a href="/register" className="nav-btn register">Register</a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <h1>
            Share Food Orders, <span className="highlight">Save Money</span>
          </h1>
          <p>
            Join people nearby to share bulk discounts from Swiggy, Zomato & more.  
            Order together, save together, and enjoy great food!
          </p>
          <div className="hero-buttons">
            <a href="/share-order" className="btn-primary">Generate Order</a>
            <a href="/dashboard" className="btn-secondary">Find Order</a>
          </div>
        </div>

        <div className="hero-image">
          <img src="https://via.placeholder.com/400x250" alt="Food Sharing" />
        </div>
      </div>

      {/* Flow Chart Section */}
      <section className="flow-chart">
        <h2>How OrderBuddy Works</h2>
        <div className="flow-steps">
          <div className="step">
            <span className="step-icon">🔑</span>
            <p>Login or Register</p>
          </div>
          <div className="step">
            <span className="step-icon">📦</span>
            <p>Find or Generate Order</p>
          </div>
          <div className="step">
            <span className="step-icon">📍</span>
            <p>Partner with Nearby Users</p>
          </div>
          <div className="step">
            <span className="step-icon">🍽️</span>
            <p>Save Money & Enjoy</p>
          </div>
        </div>
      </section>
    </div>
  );
}
