import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MyOrders from "./MyOrders";
import api from "./api";
import {
  Bell,
  Key,
  Box,
  MapPin,
  Utensils,
} from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [requests, setRequests] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showOrdersDropdown, setShowOrdersDropdown] = useState(false);
  const notifRef = useRef(null);
  const ordersRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchRequests = async () => {
      try {
        const res = await api.get("/api/orders/buddy-requests");
        setRequests(res.data || []);
      } catch (err) {
        console.error(
          "Failed to fetch buddy requests:",
          err.response?.data || err.message
        );
      }
    };
    fetchRequests();
  }, [isLoggedIn]);

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

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/orders/buddy-requests/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/orders/buddy-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen antialiased text-gray-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div
          className="logo text-orange-500 font-extrabold text-2xl tracking-tight cursor-pointer"
          onClick={() => navigate("/")}
        >
          OrderBuddy
        </div>

        <div className="flex items-center space-x-6">
          {isLoggedIn ? (
            <>
              <a
                href="/join-orders"
                className="nav-btn font-medium text-gray-600 hover:text-orange-500 transition duration-300"
              >
                Join Orders
              </a>
              <a
                href="/connections"
                className="nav-btn font-medium text-gray-600 hover:text-orange-500 transition duration-300"
              >
                Connections
              </a>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2 rounded-full hover:bg-gray-100 transition duration-300"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                >
                  <Bell size={24} className={requests.length > 0 ? "text-orange-500 animate-wiggle" : "text-gray-600"} />
                  {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {requests.length}
                    </span>
                  )}
                </button>
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl z-50 p-3 max-h-80 overflow-y-auto border border-gray-200">
                    <p className="font-bold text-lg text-gray-800 mb-2">Requests</p>
                    {requests.length === 0 ? (
                      <p className="text-gray-500 text-sm">No new requests.</p>
                    ) : (
                      requests.map((req) => (
                        <div key={req._id} className="border-b border-gray-200 py-2 last:border-b-0">
                          <p className="font-semibold text-gray-800">{req.senderName || "Unknown User"}</p>
                          <p className="text-gray-600 text-sm">wants to join your order.</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              className="flex-1 py-1 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition duration-300 text-sm"
                              onClick={() => handleAccept(req._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="flex-1 py-1 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition duration-300 text-sm"
                              onClick={() => handleReject(req._id)}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* My Orders */}
              <div className="relative" ref={ordersRef}>
                <button
                  className="nav-btn font-medium text-gray-600 hover:text-orange-500 transition duration-300"
                  onClick={() => setShowOrdersDropdown(!showOrdersDropdown)}
                >
                  My Orders
                  <span className="ml-1 text-xs">▼</span>
                </button>
                {showOrdersDropdown && (
                  <div className="absolute right-0 mt-3 w-72 bg-white shadow-xl rounded-xl z-50 p-3 max-h-80 overflow-y-auto border border-gray-200">
                    <MyOrders />
                  </div>
                )}
              </div>

              <button
                className="nav-btn font-medium text-gray-600 hover:text-orange-500 transition duration-300"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="nav-btn font-medium text-gray-600 hover:text-orange-500 transition duration-300"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-5 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition duration-300 transform hover:scale-105"
              >
                Register
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero relative bg-gradient-to-br from-orange-50 to-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#f97316"
              fillOpacity="0.1"
              d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,133.3C672,139,768,213,864,229.3C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between py-24 px-8 mx-auto max-w-7xl">
          <div className="hero-text flex-1 mb-10 md:mb-0 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              Share Food Orders, <br />
              <span className="text-orange-500">Save Money.</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto md:mx-0">
              Join people nearby to share bulk discounts from Swiggy, Zomato & more. Order together, save together, and enjoy great food!
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a
                href="/share-order"
                className="px-8 py-3 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition duration-300 transform hover:scale-105 shadow-lg"
              >
                Generate Order
              </a>
              <a
                href="/dashboard"
                className="px-8 py-3 border-2 border-orange-500 text-orange-500 rounded-full font-bold hover:bg-orange-500 hover:text-white transition duration-300 transform hover:scale-105"
              >
                Find Order
              </a>
            </div>
          </div>
          <div className="hero-image flex-1 w-full max-w-md">{/* Add a stylish hero image or illustration here */}</div>
        </div>
      </div>

      {/* Flow Chart Section */}
      <section className="flow-chart py-16 bg-white mx-auto rounded-2xl my-10 max-w-7xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          How It Works
        </h2>
        <div className="flow-steps flex flex-wrap justify-center gap-8 px-4">
          <div className="step text-center max-w-xs bg-gray-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
            <span className="step-icon text-white bg-orange-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
              <Key size={30} className="text-white" />
            </span>
            <p className="font-bold text-lg text-gray-700">Login or Register</p>
            <p className="text-gray-500 text-sm mt-2">Create your account to start sharing and saving.</p>
          </div>
          <div className="step text-center max-w-xs bg-gray-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
            <span className="step-icon text-white bg-orange-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
              <Box size={30} className="text-white" />
            </span>
            <p className="font-bold text-lg text-gray-700">Find or Generate an Order</p>
            <p className="text-gray-500 text-sm mt-2">Look for nearby orders or create your own to share with others.</p>
          </div>
          <div className="step text-center max-w-xs bg-gray-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
            <span className="step-icon text-white bg-orange-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
              <MapPin size={30} className="text-white" />
            </span>
            <p className="font-bold text-lg text-gray-700">Partner with Nearby Users</p>
            <p className="text-gray-500 text-sm mt-2">Connect with "Order Buddies" in your area to split the cost.</p>
          </div>
          <div className="step text-center max-w-xs bg-gray-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
            <span className="step-icon text-white bg-orange-500 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-4">
              <Utensils size={30} className="text-white" />
            </span>
            <p className="font-bold text-lg text-gray-700">Save Money & Enjoy</p>
            <p className="text-gray-500 text-sm mt-2">Get your favorite food at a reduced price. It's a win-win!</p>
          </div>
        </div>
      </section>
    </div>
  );
}