import { useEffect, useState } from "react";
import axios from "axios";
import "./PageLayout.css";

export default function Notifications() {
  const [requests, setRequests] = useState([]);
  const [activeForm, setActiveForm] = useState(null); // track which request is being accepted
  const [formData, setFormData] = useState({ email: "", phone: "" });
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

  const handleAcceptSubmit = async (id, e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/buddy-requests/${id}/accept`,
        formData, // send entered details to backend
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove request from list
      setRequests(requests.filter((r) => r._id !== id));
      setActiveForm(null);
      setFormData({ email: "", phone: "" });

      const { sender, receiver } = res.data;
      const contactInfo = `
✅ Buddy request accepted!

👤 Sender: ${sender.name} | 📧 ${sender.email} | 📱 ${sender.phone || "N/A"}
👤 Receiver: ${receiver.name} | 📧 ${receiver.email} | 📱 ${receiver.phone || "N/A"}
`;

      alert(contactInfo);
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
      setRequests(requests.filter((r) => r._id !== id));
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
        {requests.map((r) => (
          <li key={r._id}>
            <strong>{r.senderName || "Unknown User"}</strong> wants to buddy up.

            {activeForm === r._id ? (
              
              <form onSubmit={(e) => handleAcceptSubmit(r._id, e)}>
                onClick={(e) => e.stopPropagation()} // prevent panel from closing
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
              <>
                <button onClick={() => setActiveForm(r._id)}>Accept</button>
                <button onClick={() => handleReject(r._id)}>Reject</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
