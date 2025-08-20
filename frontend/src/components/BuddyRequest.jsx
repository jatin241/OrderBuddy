import React, { useEffect, useState } from "react";

export default function BuddyRequests() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch pending buddy requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/orders/buddy-requests",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch requests");
        const data = await res.json();

        // Add extra fields for showing form
        const formatted = data.map((r) => ({
          ...r,
          showForm: false,
          email: "",
          phone: "",
        }));

        setRequests(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, [token]);

  // Show the contact info form
  const showForm = (id) => {
    setRequests(
      requests.map((r) =>
        r._id === id ? { ...r, showForm: true } : r
      )
    );
  };

  // Handle form field changes
  const handleChange = (id, field, value) => {
    setRequests(
      requests.map((r) =>
        r._id === id ? { ...r, [field]: value } : r
      )
    );
  };

  // Accept request
  const handleAccept = async (requestId, email, phone) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/buddy-requests/${requestId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, phone }),
        }
      );
      if (!res.ok) throw new Error("Failed to accept request");
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  // Reject request
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

  return (
    <div>
      <h2>Buddy Requests</h2>
      {requests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul>
          {requests.map((req) => (
            <li key={req._id} style={{ marginBottom: "10px" }}>
              {req.senderName} wants to join your order.

              {req.showForm ? (
                <>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={req.email}
                    onChange={(e) =>
                      handleChange(req._id, "email", e.target.value)
                    }
                    style={{ marginLeft: "10px" }}
                  />
                  <input
                    type="text"
                    placeholder="Your phone"
                    value={req.phone}
                    onChange={(e) =>
                      handleChange(req._id, "phone", e.target.value)
                    }
                    style={{ marginLeft: "10px" }}
                  />
                  <button
                    onClick={() =>
                      handleAccept(req._id, req.email, req.phone)
                    }
                    style={{ marginLeft: "10px" }}
                  >
                    Submit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => showForm(req._id)}
                  style={{ marginLeft: "10px" }}
                >
                  Accept
                </button>
              )}

              <button
                onClick={() => handleReject(req._id)}
                style={{ marginLeft: "10px" }}
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
