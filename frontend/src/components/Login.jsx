import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Temporary login for development
    const users = {
      admin: {
        username: "admin",
        password: "admin123",
        role: "admin"
      },
      staff: {
        username: "staff",
        password: "staff123",
        role: "staff"
      },
      student: {
        username: "student",
        password: "student123",
        role: "student"
      }
    };

    const selectedUser = users[role];

    if (
      username === selectedUser.username &&
      password === selectedUser.password
    ) {
      setError("");

      onLogin({
        username: selectedUser.username,
        role: selectedUser.role
      });
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Smart  Analytics</h1>

        <p className="login-subtitle">
          Student Success Platform
        </p>

        <form onSubmit={handleLogin}>

          {/* Role */}
          <label>Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>


          {/* Username */}
          <label>Username</label>

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />


          {/* Password */}
          <label>Password</label>

          <div className="password-container">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="show-password-btn"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>

          </div>


          {/* Error */}
          {error && (
            <p className="login-error">
              {error}
            </p>
          )}


          {/* Login */}
          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;