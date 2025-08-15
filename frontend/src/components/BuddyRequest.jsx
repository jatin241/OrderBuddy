import React, { useEffect, useState } from "react";

export default function BuddyRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch pending buddy requests
  useEffect(() => {
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

  // Accept request
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

  // Reject request
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

  return (
    <div>
      <h2>Buddy Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req._id}>
              {req.senderName || "Unknown User"} wants to join your order.
              <button onClick={() => handleAccept(req._id)}>Accept</button>
              <button onClick={() => handleReject(req._id)}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
