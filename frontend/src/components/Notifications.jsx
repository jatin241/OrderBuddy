import { useEffect, useState } from "react";
import axios from "axios";
import "./PageLayout.css";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/orders/buddy-requests",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, [token]);

  const handleAccept = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/orders/buddy-requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(requests.filter(r => r._id !== id));
      alert("Request accepted!");
    } catch (err) {
      alert("Failed to accept request.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/orders/buddy-requests/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(requests.filter(r => r._id !== id));
      alert("Request rejected!");
    } catch (err) {
      alert("Failed to reject request.");
    }
  };

  if (requests.length === 0) return <p>No new buddy requests.</p>;

  return (
    <div className="notifications-panel">
      <h3>Buddy Requests</h3>
      <ul>
        {requests.map(r => (
          <li key={r._id}>
            <strong>{r.senderName || "Unknown User"}</strong> wants to buddy up.
            <button onClick={() => handleAccept(r._id)}>Accept</button>
            <button onClick={() => handleReject(r._id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
