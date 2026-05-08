import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import { FaUserShield, FaLock, FaSignInAlt } from "react-icons/fa";

const AdminLogin = ({ setIsAdmin }) => {
  const [formData, setFormData] = useState({ adminId: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🛡️ SECRET KEY LOGIC: URL me ?key=SuperSuper hona zaroori hai
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get("key") || searchParams.get("Key"); 

  useEffect(() => {
    // Agar key galat hai ya nahi hai, toh seedha home page pe fek do
    if (secretKey !== "SuperSuper") {
      navigate("/"); 
    }
  }, [secretKey, navigate]);

  // Jab tak key match nahi hoti, kuch mat dikhao
  if (secretKey !== "SuperSuper") return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const res = await api.post("/admin/login", {
            adminId: formData.adminId.trim(),
            password: formData.password.trim(),
        });

        if (res.data.token) {
            // Data Save
            localStorage.setItem("adminToken", res.data.token);
            localStorage.setItem("loginTime", Date.now());

            // App State Update
            if (setIsAdmin) setIsAdmin(true);
            
            // 🔥 Success! Go to Dashboard
            navigate("/admin"); 
        }
    } catch (err) {
        // Backend se jo message aayega wo dikhayega
        setError(err.response?.data?.message || "Authentication Failed");
    } finally {
        setLoading(false);
    }
};

  // --- 🎨 PREMIUM FULL-SCREEN STYLES ---
  const styles = {
    container: { 
      position: "fixed", // Sabse upar fix rahega
      top: 0, left: 0, right: 0, bottom: 0,
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      backgroundColor: "#020617", // Rich Dark Background
      zIndex: 10000, 
      padding: "20px",
      fontFamily: "'Inter', sans-serif"
    },
    card: { 
      width: "100%", 
      maxWidth: "420px", 
      backgroundColor: "#0f172a", 
      borderRadius: "28px", 
      padding: "48px 32px", 
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)", 
      border: "1px solid #1e293b", 
      textAlign: "center",
      position: "relative"
    },
    logoIcon: { 
      fontSize: "56px", 
      color: "#f59e0b", 
      marginBottom: "20px",
      filter: "drop-shadow(0 0 15px rgba(245, 158, 11, 0.3))" 
    },
    title: { fontSize: "28px", fontWeight: "900", color: "#ffffff", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" },
    subtitle: { fontSize: "13px", color: "#64748b", marginBottom: "35px", fontWeight: "600", textTransform: "uppercase", tracking: "0.1em" },
    inputGroup: { marginBottom: "20px", textAlign: "left" },
    label: { display: "block", fontSize: "11px", fontWeight: "800", color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", paddingLeft: "4px" },
    inputWrapper: { position: "relative", display: "flex", alignItems: "center" },
    inputIcon: { position: "absolute", left: "16px", color: "#475569", fontSize: "18px" },
    input: { 
      width: "100%", 
      padding: "16px 16px 16px 52px", 
      backgroundColor: "#1e293b", 
      border: "1px solid #334155", 
      borderRadius: "14px", 
      color: "#ffffff", 
      fontSize: "15px", 
      fontWeight: "500",
      outline: "none",
      transition: "all 0.2s ease"
    },
    button: { 
      width: "100%", 
      padding: "18px", 
      borderRadius: "14px", 
      border: "none", 
      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
      color: "#000", 
      fontWeight: "900", 
      fontSize: "15px", 
      cursor: "pointer", 
      marginTop: "12px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: "12px", 
      textTransform: "uppercase",
      boxShadow: "0 10px 15px -3px rgba(217, 119, 6, 0.2)"
    },
    errorBox: { 
      backgroundColor: "rgba(239, 68, 68, 0.1)", 
      border: "1px solid #ef4444", 
      color: "#fca5a5", 
      padding: "12px", 
      borderRadius: "12px", 
      fontSize: "13px", 
      marginBottom: "24px",
      fontWeight: "600"
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Glow Effect Background */}
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "150px", height: "150px", background: "rgba(245, 158, 11, 0.1)", filter: "blur(60px)", borderRadius: "50%", zIndex: -1 }}></div>

        <div style={styles.logoIcon}><FaUserShield /></div>
        <h2 style={styles.title}>Admin Vault</h2>
        <p style={styles.subtitle}>Secure Node Entry</p>
        
        {error && <div style={styles.errorBox}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Administrator ID</label>
            <div style={styles.inputWrapper}>
              <FaUserShield style={styles.inputIcon} />
              <input 
                id="adminId" 
                type="text" 
                value={formData.adminId} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Enter unique ID" 
                autoComplete="off"
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Access Key</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input 
                id="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Enter Password" 
                autoComplete="off"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.button, opacity: loading ? 0.7 : 1, transform: loading ? "scale(0.98)" : "scale(1)"}}
          >
            {loading ? "Authenticating..." : <>Access Portal <FaSignInAlt /></>}
          </button>
        </form>

        <p style={{ marginTop: "25px", fontSize: "11px", color: "#475569", fontWeight: "bold", textTransform: "uppercase" }}>
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;