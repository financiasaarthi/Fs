import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';

// 🟢 FIX 1: AuthContext se useAuth import kiya
import { useAuth } from '../../context/AuthContext'; 

// 🎨 Inline Keyframes Animations
const styleSheet = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatLogo {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
  }
`;

// 🟢 FIX 2: Prop se { setUser } hata diya
const Login = () => {
  const navigate = useNavigate();
  
  // 🟢 FIX 3: Context se login function nikala
  const { login } = useAuth(); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ userId: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post('/api/auth/login', formData);
      
      // 🕵️ Check karo console mein kya aa raha hai
      console.log("Full Backend Response:", res.data);
      console.log("Token received:", res.data.token);

      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
        console.log("Login function called successfully");
        
        // Chota sa delay taaki context update ho jaye
        setTimeout(() => {
          navigate('/dashboard');
        }, 100);
      } else {
        setError("Backend se pura data nahi mila.");
      }

    } catch (err) {
      console.error("Login Error Details:", err.response);
      setError(err.response?.data?.message || "Invalid User ID or Password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <style>{styleSheet}</style>

      {/* Animated Background Blobs */}
      <div className="absolute top-10 left-10 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-200 rounded-full blur-[80px] md:blur-[100px] opacity-60 pointer-events-none" style={{ animation: 'blob 7s infinite' }}></div>
      <div className="absolute bottom-10 right-10 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-indigo-200 rounded-full blur-[80px] md:blur-[100px] opacity-60 pointer-events-none" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>

      {/* Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors z-20">
        <ChevronLeft size={18} /> Back to Home
      </Link>

      {/* LOGIN CARD */}
      <div 
        className="relative z-10 w-full max-w-[420px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 p-6 md:p-10"
        style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}
      >
        
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="FinSaarthi Logo" 
              className="h-14 w-14 object-contain drop-shadow-lg"
              style={{ animation: 'floatLogo 3s ease-in-out infinite' }}
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-medium mt-1.5 text-sm">Sign in to access your dashboard</p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-6 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2"
            style={{ animation: 'shake 0.4s ease-in-out' }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* USER ID INPUT */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">User ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <User size={18} />
              </div>
              <input 
                type="text" 
                name="userId" 
                required 
                value={formData.userId} 
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium"
                placeholder="e.g. 7654321"
                autoComplete="off"
              />
            </div>
          </div>
          
          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 text-base mt-2 flex items-center justify-center gap-2 group"
          >
            {loading ? "Verifying Credentials..." : (
              <>
                Secure Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center text-slate-500 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
            Create one here
          </Link>
        </div>
      </div>
      
      {/* Security Badge */}
      <div className="absolute bottom-6 flex items-center text-slate-400 text-xs font-bold tracking-wider uppercase z-20" style={{ animation: 'fadeInUp 1s ease-out forwards' }}>
        <ShieldCheck size={16} className="mr-1.5 text-green-500" />
        100% Secure & Encrypted Connection
      </div>
      
    </div>
  );
};

export default Login;