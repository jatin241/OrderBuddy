import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Notifications from "./Notifications"; // new component for buddy requests
import { Bell } from "lucide-react"; // install lucide-react if not already
import "./PageLayout.css";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId"); // logged-in user id

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No token found, please login.");
        setLoading(false);
        return;
      }

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setUserLocation([latitude, longitude]);

            const resProtected = await axios.get(
              "http://localhost:5000/api/auth/protected",
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(resProtected.data.message);

            const resOrders = await axios.get(
              `http://localhost:5000/api/orders?lat=${latitude}&lng=${longitude}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders(resOrders.data.orders);
          } catch (err) {
            setError("Failed to fetch data. Please try again.");
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError("Failed to get your location.");
          setLoading(false);
        }
      );
    };

    fetchData();
  }, []);

  // Buddy Up function (fixed)
  const handleBuddyUp = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/buddy-request/${orderId}`,
        {}, // backend already identifies requester & receiver
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message); // success feedback
    } catch (err) {
      console.error("Buddy request error:", err.response?.data || err.message);
      alert("Failed to send buddy request");
    }
  };

  if (loading) return <div className="page-container"><p>Loading orders...</p></div>;
  if (error) return <div className="page-container"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="page-container">
      {/* Top Bar with Dashboard title & bell */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Dashboard</h1>
        <div style={{ position: "relative" }}>
          <Bell
            size={24}
            style={{ cursor: "pointer" }}
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {showNotifications && (
            <div className="notifications-dropdown">
              <Notifications />
            </div>
          )}
        </div>
      </div>

      <p>{message}</p>

      <div style={{ marginBottom: "20px" }}>
        <Link to="/share-order" className="page-button primary">Share a New Order</Link>
        <button className="page-button secondary" style={{ marginLeft: "10px" }} onClick={() => navigate("/")}>
          Home
        </button>
      </div>

      <h3>Shared Orders Nearby</h3>
      {orders.length === 0 ? (
        <p>No shared orders nearby.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "15px", marginBottom: "20px" }}>
            {orders.map((order) => (
              <div
                key={order._id}
                style={{
                  border: "1px solid #ccc",
                  padding: "15px",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                  textAlign: "left"
                }}
              >
                <h4>{order.restaurant}</h4>
                <p><strong>Items:</strong> {order.items.join(", ")}</p>
                <p><strong>Delivery Time:</strong> {order.deliveryTime || "Not specified"}</p>
                <p><strong>Shared By:</strong> {order.sharedBy?.name || "Unknown"}</p>
                <p><strong>Distance:</strong> {(order.distance / 1000).toFixed(2)} km</p>
                <p><strong>Address:</strong> {order.location?.address || "Address not available"}</p>

                {/* Buddy Up Button */}
                {order.sharedBy?._id !== userId && (
                  <button
                    className="page-button primary"
                    style={{ marginTop: "10px" }}
                    onClick={() => handleBuddyUp(order._id)}
                  >
                    Buddy Up
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Map */}
          {userLocation && (
            <MapContainer center={userLocation} zoom={14} style={{ height: "400px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* User marker */}
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>
              {/* Orders markers */}
              {orders.map((order) => (
                <Marker
                  key={order._id}
                  position={[order.location.coordinates[1], order.location.coordinates[0]]} // [lat, lng]
                >
                  <Popup>
                    <strong>{order.restaurant}</strong><br />
                    {order.location?.address || "Address not available"}<br />
                    Distance: {(order.distance / 1000).toFixed(2)} km
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </>
      )}
    </div>
  );
}
