import React, { useEffect, useState } from "react";
import api from "./api"; // ✅ Centralized Axios instance
import "./PageLayout.css";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [formData, setFormData] = useState({ email: "", phone: "" });

  // Fetch buddy requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/orders/buddy-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching buddy requests:", err);
      }
    };

    fetchRequests();
  }, []);

  // Accept buddy request
  const handleAcceptSubmit = async (id, e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/orders/buddy-requests/${id}/accept`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((req) => req._id !== id)); // remove after accept
      setActiveForm(null);
      setFormData({ email: "", phone: "" });
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  // Reject buddy request
  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/orders/buddy-requests/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((req) => req._id !== id)); // remove after reject
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="notifications">
      <button
        className="notification-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        Notifications ({requests.length})
      </button>

      {showDropdown && (
        <div className="dropdown-panel">
          {requests.length === 0 ? (
            <p>No new buddy requests</p>
          ) : (
            requests.map((r) => (
              <div key={r._id} className="request-item">
                <p>
                  <strong>{r.sender?.username}</strong> wants to buddy up!
                </p>

                {activeForm === r._id ? (
                  <form
                    onSubmit={(e) => handleAcceptSubmit(r._id, e)}
                    onClick={(e) => e.stopPropagation()} // prevent dropdown from closing
                  >
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Enter your phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    <button type="submit">Submit</button>
                    <button type="button" onClick={() => setActiveForm(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="request-actions flex gap-2 mt-2">
                    <button
                      className="px-3 py-1 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                      onClick={() => setActiveForm(r._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400 transition"
                      onClick={() => handleReject(r._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
