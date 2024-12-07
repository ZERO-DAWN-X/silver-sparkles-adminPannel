import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("connected");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (email !== "sparklesssilver60@gmail.com" || password !== "@3rEDwX") {
      showError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_END_URL}/api/api/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            admin: true,
          }),
          mode: "cors",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Login response:", data);

      if (data.status === "success" && data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        showSuccess("Login successful!");
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setBackendStatus("error");
      showError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message) => {
    const successElement = document.createElement("div");
    successElement.className = "success-popup";
    successElement.textContent = message;
    document.body.appendChild(successElement);
    setTimeout(() => successElement.remove(), 3000);
  };

  const showError = (message) => {
    const errorElement = document.createElement("div");
    errorElement.className = "error-popup";
    errorElement.textContent = message;
    document.body.appendChild(errorElement);
    setTimeout(() => errorElement.remove(), 3000);
  };

  const renderBackendStatus = () => {
    const statusColors = {
      connected: "#10b981",
      error: "#ef4444",
    };

    const statusText = {
      connected: "Ready to connect",
      error: "Connection failed",
    };

    return (
      <div className="backend-status">
        <div
          className="status-indicator"
          style={{ backgroundColor: statusColors[backendStatus] }}
        />
        <span>{statusText[backendStatus]}</span>
      </div>
    );
  };

  return (
    <div className="login-container">
      {renderBackendStatus()}
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <img src="/logo.svg" alt="Silver Sparkles" className="logo" />
          <h1>Welcome Back</h1>
          <p>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <div className="input-icon-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-icon-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
          >
            {isLoading ? <div className="loading-spinner" /> : "Sign In"}
          </motion.button>
        </form>

        <div className="login-footer">
          <p>© 2024 Silver Sparkles. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
