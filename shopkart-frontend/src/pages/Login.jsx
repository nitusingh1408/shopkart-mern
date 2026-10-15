import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      await api.post("/customers/login", {
        email,
        password
      });

      await refreshCart();

      navigate("/home");

    } catch (error) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">

        <h1>Welcome Back!</h1>

        <p>Sign in to continue</p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="error">{error}</p>
          )}

          <button type="submit">
            Sign In
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <span
            className="link"
            onClick={() => navigate("/register")}
          >
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;