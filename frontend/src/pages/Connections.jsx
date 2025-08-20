import React, { useEffect, useState } from "react";
import "./Connections.css";

export default function Connections() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/connections", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch connections");
        const data = await res.json();
        setConnections(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchConnections();
  }, []);

  return (
    <div className="connections-container">
      <h2 className="connections-title">My Connections</h2>
      {connections.length > 0 ? (
        <ul className="connections-list">
          {connections.map((conn) => (
            <li key={conn._id} className="connection-card">
              <p><strong>Name:</strong> {conn.name}</p>
              <p><strong>Email:</strong> {conn.email}</p>
              <p><strong>Phone:</strong> {conn.phone || "N/A"}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-connections">No connections yet.</p>
      )}
    </div>
  );
}
