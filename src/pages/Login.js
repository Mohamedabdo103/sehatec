import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

export default function Login({ setRole, setUserId }) {
  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    nationalId: ""
  });
  const navigate = useNavigate();

  // Load users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem("sehatec_users");
    return users ? JSON.parse(users) : [];
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem("sehatec_users", JSON.stringify(users));
  };

  const handleSignup = () => {
    const { email, password, confirmPassword, fullName } = formData;

    if (!selectedRole) return alert("❌ Please select a role");
    if (!fullName.trim()) return alert("❌ Please enter your full name");
    if (!email.trim()) return alert("❌ Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("❌ Please enter a valid email");
    if (!password) return alert("❌ Please enter a password");
    if (password.length < 6) return alert("❌ Password must be at least 6 characters");
    if (password !== confirmPassword) return alert("❌ Passwords do not match");

    const users = getUsers();
    if (users.find(u => u.email === email && u.role === selectedRole)) {
      return alert("❌ This email is already registered");
    }

    users.push({ email, password, fullName, role: selectedRole });
    saveUsers(users);
    
    alert("✅ Account created successfully! Please login.");
    setIsSignup(false);
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "", nationalId: "" });
  };

  const handleLogin = () => {
    if (!selectedRole) return alert("❌ Please select a role");

    if (selectedRole === "patient") {
      const { nationalId } = formData;
      if (!nationalId) return alert("❌ Please enter your National ID");
      if (nationalId.length !== 14 || !/^\d+$/.test(nationalId)) {
        return alert("❌ National ID must be exactly 14 digits");
      }
      setRole("patient");
      setUserId(nationalId);
      navigate("/patient");
    } else {
      const { email, password } = formData;
      if (!email) return alert("❌ Please enter your email");
      if (!password) return alert("❌ Please enter your password");

      const users = getUsers();
      const user = users.find(u => u.email === email && u.password === password && u.role === selectedRole);

      if (!user) {
        return alert("❌ Invalid email or password");
      }

      setRole(selectedRole);
      setUserId(user.email);
      navigate(`/${selectedRole}`);
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "", nationalId: "" });
    setSelectedRole("");
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      padding: "20px"
    }}>
      <div className="card" style={{ 
        maxWidth: "500px", 
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "64px", marginBottom: "10px" }}>🏥</div>
          <h2 style={{ color: "#4a90e2", margin: "0 0 10px 0" }}>SehaTec</h2>
          <p style={{ color: "#666", margin: 0 }}>Medical Management System</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
          <button
            onClick={() => { setIsSignup(false); resetForm(); }}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: !isSignup ? "#4a90e2" : "#f0f0f0",
              color: !isSignup ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setIsSignup(true); resetForm(); }}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: isSignup ? "#4a90e2" : "#f0f0f0",
              color: isSignup ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px"
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selection */}
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
          Select Your Role *
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "20px", fontSize: "14px" }}
        >
          <option value="">-- Choose Role --</option>
          <option value="doctor">👨‍⚕️ Doctor</option>
          <option value="pharmacist">💊 Pharmacist</option>
          <option value="patient">🧑‍⚕️ Patient</option>
        </select>

        {/* Signup Form */}
        {isSignup && (selectedRole === "doctor" || selectedRole === "pharmacist") && (
          <>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleSignup()}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <button 
              onClick={handleSignup}
              style={{ 
                width: "100%", 
                padding: "15px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Create Account 🚀
            </button>
          </>
        )}

        {/* Login Form - Doctor/Pharmacist */}
        {!isSignup && (selectedRole === "doctor" || selectedRole === "pharmacist") && (
          <>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <button 
              onClick={handleLogin}
              style={{ 
                width: "100%", 
                padding: "15px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Login 🔐
            </button>
          </>
        )}

        {/* Login Form - Patient */}
        {!isSignup && selectedRole === "patient" && (
          <>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#555" }}>
              National ID (14 digits) *
            </label>
            <input
              type="text"
              placeholder="Enter your 14-digit National ID"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              maxLength={14}
              style={{ width: "100%", padding: "12px", marginBottom: "15px" }}
            />

            <button 
              onClick={handleLogin}
              style={{ 
                width: "100%", 
                padding: "15px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer"
              }}
            >
              Login 🔐
            </button>
          </>
        )}

        {/* Patient Signup Notice */}
        {isSignup && selectedRole === "patient" && (
          <div style={{ 
            padding: "20px", 
            backgroundColor: "#fff3cd", 
            borderRadius: "8px",
            border: "1px solid #ffc107",
            textAlign: "center"
          }}>
            <p style={{ margin: 0, color: "#856404", fontWeight: "bold" }}>
              ℹ️ Patient accounts are created by doctors
            </p>
            <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#856404" }}>
              Please contact your doctor to register you in the system.
            </p>
          </div>
        )}

        {/* Demo Info */}
        {!isSignup && (
          <div style={{ 
            marginTop: "30px", 
            padding: "15px", 
            backgroundColor: "#f0f8ff", 
            borderRadius: "8px",
            border: "1px solid #4a90e2"
          }}>
            <p style={{ fontSize: "14px", color: "#666", margin: "5px 0", fontWeight: "bold" }}>
              💡 Demo Instructions:
            </p>
            <p style={{ fontSize: "12px", color: "#888", margin: "3px 0" }}>
              • Doctor/Pharmacist: Sign up first, then login
            </p>
            <p style={{ fontSize: "12px", color: "#888", margin: "3px 0" }}>
              • Patient: Login with any 14-digit National ID
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
<div style={{ position: "absolute", top: 20, right: 20 }}>
  <ThemeToggle />
</div>
