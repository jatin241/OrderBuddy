import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="connections-container" style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#e67e22" }}>
          My Connections
          <span style={{
            backgroundColor: "#e67e22",
            color: "white",
            borderRadius: "999px",
            padding: "2px 10px",
            marginLeft: "12px",
            fontSize: "0.9rem"
          }}>
            {connections.length}
          </span>
        </h2>
        <Link
          to="/"
          className="btn-home"
          style={{
            backgroundColor: "#e67e22",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "bold",
            transition: "all 0.3s",
            textDecoration: "none",
            marginTop: "10px"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#cf6f1d"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#e67e22"}
        >
          Home
        </Link>
      </div>

      {/* Connections Grid */}
      {connections.length > 0 ? (
        <div
          className="connections-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
          }}
        >
          {connections.map((conn) => (
            <div
              key={conn._id}
              className="connection-card"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #eee",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                transition: "transform 0.3s, box-shadow 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)";
              }}
            >
              <p><strong>Name:</strong> {conn.name}</p>
              <p><strong>Email:</strong> {conn.email}</p>
              <p><strong>Phone:</strong> {conn.phone || "N/A"}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#555", fontSize: "1rem", marginTop: "20px" }}>
          No connections yet. Start connecting with buddies!
        </p>
      )}
    </div>
  );
}
