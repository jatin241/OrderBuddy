import React, { useEffect, useState } from "react";

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
    <div>
      <h2>My Connections</h2>
      {connections.length > 0 ? (
        <ul>
          {connections.map((conn) => (
            <li key={conn._id}>
              <strong>Name:</strong> {conn.name} <br />
              <strong>Email:</strong> {conn.email} <br />
              <strong>Phone:</strong> {conn.phone || "N/A"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No connections yet.</p>
      )}
    </div>
  );
}
