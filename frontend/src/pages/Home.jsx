import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import MyOrders from "./MyOrders";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContactFormFor, setShowContactFormFor] = useState(null);
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" });
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");

  // Sync login state
  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  // Fetch logged-in user's email for pre-filling
  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");
        const data = await res.json();
        setUserEmail(data.user?.email || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [token]);

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

  // Accept buddy request
  const handleAccept = async (requestId, contactInfo) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/buddy-requests/${requestId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(contactInfo),
        }
      );
      if (!res.ok) throw new Error("Failed to accept request");
      setRequests(requests.filter((req) => req._id !== requestId));
      setShowContactFormFor(null);
      setContactInfo({ email: "", phone: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // Reject buddy request
  const handleReject = async (requestId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/buddy-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to reject request");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/");
  };

  // ✅ Close dropdown if clicked outside (but keep form clickable)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowContactFormFor(null); // also close any form
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
              <a href="/connections" className="nav-btn">Connections</a>

      {/* Notification Bell */}
<div
  className="nav-btn notification"
  style={{ position: "relative", cursor: "pointer" }}
  ref={dropdownRef} // ✅ Wrap bell + dropdown together
>
  <span onClick={() => setShowDropdown(!showDropdown)}>🔔</span>
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
        width: "240px",
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

            {showContactFormFor === req._id ? (
              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  value={contactInfo.email || userEmail}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: "5px" }}
                />
                <input
                  type="text"
                  placeholder="Your phone"
                  value={contactInfo.phone || ""}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: "5px" }}
                />
                <button
                  onClick={() => handleAccept(req._id, contactInfo)}
                  style={{ marginRight: "5px" }}
                >
                  Submit
                </button>
                <button onClick={() => setShowContactFormFor(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowContactFormFor(req._id)}
                style={{ marginRight: "5px" }}
              >
                Accept
              </button>
            )}

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
              <button className="nav-btn logout" onClick={handleLogout}>
                Logout
              </button>
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
