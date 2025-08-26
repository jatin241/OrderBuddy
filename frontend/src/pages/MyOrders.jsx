import React, { useEffect, useState } from "react";
import api from "./api"; // Import centralized axios instance

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/api/orders/my-orders"); 
        setOrders(res.data.orders);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>Loading your orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              <strong>{order.restaurant}</strong> - {order.items.join(", ")}
              <br />
              Shared by: {order.sharedBy?.name || "You"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyOrders;
