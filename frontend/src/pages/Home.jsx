import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import MyOrders from "./MyOrders";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Sync login state
  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Fetch pending buddy requests
  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders/buddy-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, [token]);

  // Accept/Reject buddy requests
  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/buddy-requests/${requestId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to accept request");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/buddy-requests/${requestId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to reject request");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/"); // redirect to homepage
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">OrderBuddy</div>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <a href="/join-orders" className="nav-btn">Join Orders</a>

              {/* Notification Bell */}
              <div
                className="nav-btn notification"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ position: "relative", cursor: "pointer" }}
              >
                🔔
                {requests.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "12px",
                    }}
                  >
                    {requests.length}
                  </span>
                )}

                {/* Dropdown */}
                {showDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "25px",
                      right: "0",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      borderRadius: "6px",
                      zIndex: 100,
                      width: "220px",
                    }}
                  >
                    {requests.length === 0 ? (
                      <p style={{ padding: "10px" }}>No new requests</p>
                    ) : (
                      requests.map((req) => (
                        <div
                          key={req._id}
                          style={{
                            padding: "8px 10px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <p style={{ margin: "0 0 5px 0" }}>
                            {req.senderName || "Unknown User"} wants to join your order.
                          </p>
                          <button
                            onClick={() => handleAccept(req._id)}
                            style={{ marginRight: "5px" }}
                          >
                            Accept
                          </button>
                          <button onClick={() => handleReject(req._id)}>Reject</button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* My Orders dropdown */}
              <div className="nav-btn dropdown">
                <span>My Orders ▼</span>
                <div className="dropdown-content">
                  <MyOrders token={token} />
                </div>
              </div>

              {/* Logout Button */}
              <button className="nav-btn logout" onClick={handleLogout}>Logout</button>
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
