import { useState } from "react";

import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {

  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (user.role === "admin") {
    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "staff") {
    return (
      <StaffDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (user.role === "student") {
    return (
      <StudentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;