import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Notifications from "./Notifications";
import { Bell } from "lucide-react";
import "leaflet/dist/leaflet.css";
import Lottie from "lottie-react";
import burgerAnimation from "../assets/Burger.json";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
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
  const [hasNotifs, setHasNotifs] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const mapRef = useRef();

  // Parallax effect for shapes
  useEffect(() => {
    const handleScroll = () => {
      const shapes = document.querySelectorAll(".abstract-shape");
      shapes.forEach((shape, idx) => {
        shape.style.transform = `translateY(${window.scrollY * (0.05 + 0.02 * idx)}px)`;
      });
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("No token found, please login.");
        setLoading(false);
        return;
      }
      if (!navigator.geolocation) {
        setError("Geolocation not supported.");
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
            setError("Failed to fetch data. Try again.");
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

  const handleBuddyUp = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `http://localhost:5000/api/orders/buddy-request/${orderId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send buddy request");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg font-inter">
        Loading orders...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg font-inter">
        {error}
      </div>
    );

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-orange-50 via-yellow-50 to-orange-100 overflow-hidden font-inter">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="abstract-shape absolute top-[-100px] left-[-100px] w-96 h-96 bg-gradient-to-tr from-orange-200 via-yellow-300 to-orange-400 opacity-30 rounded-full blur-3xl"></div>
        <div className="abstract-shape absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-gradient-to-tr from-yellow-200 via-orange-300 to-yellow-400 opacity-25 rounded-full blur-2xl"></div>
        <div className="abstract-shape absolute top-[40%] left-[65%] w-64 h-64 bg-gradient-to-tr from-orange-200 via-yellow-300 to-orange-400 opacity-20 rounded-full blur-2xl"></div>

        {/* Floating Burger Lottie */}
        <div className="absolute top-10 right-20 w-32 h-32 opacity-80 animate-float">
          <Lottie animationData={burgerAnimation} loop={true} />
        </div>
        <div className="absolute bottom-20 left-10 w-28 h-28 opacity-70 animate-float-slow">
          <Lottie animationData={burgerAnimation} loop={true} />
        </div>
      </div>

      {/* Dashboard Container */}
      <div className="px-6 py-10 max-w-7xl mx-auto space-y-8 xl:px-0">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-600 to-orange-500 drop-shadow-lg">
            Dashboard
          </h1>
          <div className="relative">
            <button
              className="group relative p-2 focus:outline-none"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell
                size={28}
                className="text-gray-700 drop-shadow-lg transition group-hover:text-orange-700 group-active:scale-95"
              />
              {hasNotifs && (
                <span className="animate-bounce absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="block w-2 h-2 bg-white rounded-full"></span>
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-80 bg-white/80 border border-gray-200 rounded-xl shadow-2xl backdrop-blur-2xl animate-fade-in-up z-40 overflow-hidden">
                <Notifications />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-4">
          <Link
            to="/share-order"
            className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 text-white font-semibold shadow-lg hover:scale-105 transition-all"
          >
            Share a New Order
          </Link>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full bg-white/80 text-gray-600 font-semibold shadow hover:scale-105 transition-all"
          >
            Home
          </button>
        </div>

        {/* Orders + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Orders */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Shared Orders Nearby
            </h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">No shared orders nearby.</p>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map((order, i) => (
                  <div
                    key={order._id}
                    className="bg-white/50 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-100 p-6 flex flex-col justify-between relative hover:scale-105 transition-all duration-300"
                  >
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500">
                        {order.restaurant}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        <strong>Items:</strong> {order.items.join(", ")}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Delivery Time:</strong> {order.deliveryTime || "N/A"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Shared By:</strong> {order.sharedBy?.name || "Unknown"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Distance:</strong> {(order.distance / 1000).toFixed(2)} km
                      </p>
                      <p className="text-gray-600 text-sm">
                        <strong>Address:</strong> {order.location?.address || "N/A"}
                      </p>
                    </div>
                    {order.sharedBy?._id !== userId && (
                      <button
                        className="mt-6 py-2 px-4 w-full rounded-full font-semibold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-400 text-white shadow-lg hover:scale-105 transition-all"
                        onClick={() => handleBuddyUp(order._id)}
                      >
                        Buddy Up
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Map of Orders</h3>
            {userLocation && (
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-orange-200 bg-white/60 backdrop-blur-lg">
                <MapContainer
                  center={userLocation}
                  zoom={14}
                  ref={mapRef}
                  className="w-full h-[24rem] min-h-[18rem]"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={userLocation}>
                    <Popup>
                      <div className="font-bold text-orange-600">Your Location</div>
                    </Popup>
                  </Marker>
                  {orders.map((order) => (
                    <Marker
                      key={order._id}
                      position={[
                        order.location.coordinates[1],
                        order.location.coordinates[0],
                      ]}
                    >
                      <Popup>
                        <div className="font-bold text-orange-700">{order.restaurant}</div>
                        <div className="text-xs">{order.location?.address || "Address N/A"}</div>
                        <div className="text-xs">Distance: {(order.distance / 1000).toFixed(2)} km</div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
