import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./api"; // ✅ Use centralized Axios instance

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      // ✅ Use API instance (baseURL comes from VITE_API_BASE_URL)
      const res = await api.post("/api/auth/register", formData);
      setMessage(res.data.message);
      setFormData({ name: "", email: "", password: "" });

      // ✅ Redirect to login after success
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 relative overflow-hidden">
      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="foodPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="3" fill="#F97316"/>
            <circle cx="30" cy="30" r="3" fill="#F97316"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#foodPattern)" />
      </svg>

      {/* Emoji decoration */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-5 text-6xl">
        <span className="m-4">🍕</span>
        <span className="m-4">🍔</span>
        <span className="m-4">🍟</span>
        <span className="m-4">🌮</span>
        <span className="m-4">🍣</span>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-sm p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-xl z-10">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-orange-500 text-center mb-6">OrderBuddy</h1>

        {/* Message */}
        {message && <p className="text-center text-red-500 mb-4">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-orange-500 text-white font-bold rounded-md hover:bg-orange-600 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-orange-500 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
