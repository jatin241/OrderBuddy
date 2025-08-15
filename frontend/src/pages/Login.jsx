import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./pageLayout.css"; // Import shared styles

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage(`Welcome back, ${user.name}! You are logged in.`);
      setFormData({ email: "", password: "" });

      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-container centered-container">
      <h2 className="page-title">Login</h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>

        <button type="submit" className="submit-button">
          Login
        </button>
      </form>
    </div>
  );
}
