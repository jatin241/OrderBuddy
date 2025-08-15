import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ShareOrder() {
  const [formData, setFormData] = useState({
    restaurant: "",
    items: "",
    deliveryTime: "",
  });
  const [location, setLocation] = useState({ lat: null, lng: null, address: "" });
  const [toast, setToast] = useState({ message: "", visible: false });
  const navigate = useNavigate();

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(prev => ({ ...prev, lat: latitude, lng: longitude }));

          // Optional: Get human-readable address
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setLocation(prev => ({ ...prev, address: data.display_name }));
          } catch (err) {
            console.error("Failed to fetch address:", err);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setToast({ message: "Failed to get your location.", visible: true });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setToast({ message: "Geolocation is not supported by your browser.", visible: true });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ message: "", visible: false });

    if (!location.lat || !location.lng) {
      setToast({ message: "Location not detected yet.", visible: true });
      return;
    }

    const dataToSend = {
      restaurant: formData.restaurant,
      items: formData.items.split(",").map(item => item.trim()),
      deliveryTime: formData.deliveryTime,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
        address: location.address
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setToast({ message: "You must be logged in to share an order.", visible: true });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/orders", dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setToast({ message: res.data.message, visible: true });
      setFormData({ restaurant: "", items: "", deliveryTime: "" });

      setTimeout(() => {
        setToast({ message: "", visible: false });
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      setToast({ message: error.response?.data?.message || "Failed to share order.", visible: true });
    }
  };

  return (
    <div>
      <h2>Share a New Order</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Restaurant:</label><br />
          <input type="text" name="restaurant" value={formData.restaurant} onChange={handleChange} required />
        </div>

        <div>
          <label>Items (comma separated):</label><br />
          <input type="text" name="items" value={formData.items} onChange={handleChange} required />
        </div>

        <div>
          <label>Delivery Time:</label><br />
          <input type="text" name="deliveryTime" value={formData.deliveryTime} onChange={handleChange} />
        </div>

        {/* Show detected location */}
        <div>
          <label>Your Location:</label>
          <p>{location.address || "Detecting location..."}</p>
        </div>

        <button type="submit">Share Order</button>
      </form>

      {toast.visible && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          boxShadow: "0px 2px 10px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
