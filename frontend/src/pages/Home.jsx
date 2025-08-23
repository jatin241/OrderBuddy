import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MyOrders from "./MyOrders";
// import "tailwindcss";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [requests, setRequests] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const notifRef = useRef(null);
  const ordersRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
      if (ordersRef.current && !ordersRef.current.contains(event.target)) {
        setShowOrdersDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <div className="logo text-orange-500 font-bold text-xl cursor-pointer" onClick={() => navigate("/")}>
          OrderBuddy
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <a href="/join-orders" className="nav-btn px-3 py-1 text-gray-700 hover:text-orange-500 transition">Join Orders</a>
              <a href="/connections" className="nav-btn px-3 py-1 text-gray-700 hover:text-orange-500 transition">Connections</a>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                >
                  🔔
                  {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {requests.length}
                    </span>
                  )}
                </button>
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 p-2 max-h-80 overflow-y-auto">
                    {requests.length === 0 ? (
                      <p className="text-gray-500 p-2">No new requests</p>
                    ) : (
                      requests.map((req) => (
                        <div key={req._id} className="border-b border-gray-200 p-2 text-sm">
                          <p className="font-semibold">{req.senderName || "Unknown User"}</p>
                          <p>wants to join your order.</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* My Orders */}
              <div className="relative" ref={ordersRef}>
                <button
                  className="nav-btn px-3 py-1 text-gray-700 hover:text-orange-500 transition"
                  onClick={() => setShowOrdersDropdown(!showOrdersDropdown)}
                >
                  My Orders ▼
                </button>
                {showOrdersDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg z-50 p-2 max-h-80 overflow-y-auto">
                    <MyOrders token={token} />
                  </div>
                )}
              </div>

              <button
                className="nav-btn px-3 py-1 text-gray-700 hover:text-orange-500 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-btn px-3 py-1 text-gray-700 hover:text-orange-500 transition">Login</a>
              <a href="/register" className="nav-btn px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition">Register</a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero flex flex-col md:flex-row items-center justify-between p-10 bg-white shadow-sm mt-6 mx-6 rounded-lg">
        <div className="hero-text flex-1 mb-6 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Share Food Orders, <span className="text-orange-500">Save Money</span>
          </h1>
          <p className="text-gray-600 mb-6">
            Join people nearby to share bulk discounts from Swiggy, Zomato & more.
            Order together, save together, and enjoy great food!
          </p>
          <div className="flex space-x-4">
            <a href="/share-order" className="px-5 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition">Generate Order</a>
            <a href="/dashboard" className="px-5 py-2 border-2 border-orange-500 text-orange-500 rounded hover:bg-orange-500 hover:text-white transition">Find Order</a>
          </div>
        </div>
        <div className="hero-image flex-1">
          {/* Add hero image if available */}
        </div>
      </div>

  

      {/* Flow Chart Section */}
      <section className="flow-chart bg-orange-50 p-10 mt-8 mx-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">How OrderBuddy Works</h2>
        <div className="flow-steps flex flex-wrap justify-center gap-6">
          <div className="step text-center max-w-xs">
            <span className="step-icon text-white bg-orange-500 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-2">🔑</span>
            <p>Login or Register</p>
          </div>
          <div className="step text-center max-w-xs">
            <span className="step-icon text-white bg-orange-500 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-2">📦</span>
            <p>Find or Generate Order</p>
          </div>
          <div className="step text-center max-w-xs">
            <span className="step-icon text-white bg-orange-500 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-2">📍</span>
            <p>Partner with Nearby Users</p>
          </div>
          <div className="step text-center max-w-xs">
            <span className="step-icon text-white bg-orange-500 w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-2">🍽️</span>
            <p>Save Money & Enjoy</p>
          </div>
        </div>
      </section>
    </div>
  );
}
