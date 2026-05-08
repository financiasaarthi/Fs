import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Lock, ShieldCheck, ArrowRight, Home, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --blue:   #2563EB;
    --indigo: #4F46E5;
    --grad:   linear-gradient(135deg,#2563EB 0%,#4F46E5 100%);
  }

  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    20%      { transform:translateX(-6px); }
    40%      { transform:translateX(6px); }
    60%      { transform:translateX(-4px); }
    80%      { transform:translateX(4px); }
  }
  @keyframes gradShift {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes blob {
    0%,100% { transform:translate(0,0) scale(1); }
    50%     { transform:translate(15px,-25px) scale(1.05); }
  }

  .login-card {
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .fs-input {
    width:100%;
    padding: 12px 14px 12px 42px;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: #0F172A;
    background: #FAFAFA;
    outline: none;
    transition: all 0.2s ease;
    -webkit-appearance: none;
  }
  .fs-input:focus {
    background: #fff;
    border-color: #3B82F6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
  }
  .fs-input::placeholder { color:#94A3B8; font-weight: 400; }

  .btn-shimmer {
    position:relative; overflow:hidden;
    transition: all 0.2s ease;
  }
  .btn-shimmer::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 50%,transparent 100%);
    background-size:500px 100%;
    animation:shimmer 2.5s infinite linear;
  }
  .btn-shimmer:hover  { transform:translateY(-1px); box-shadow:0 12px 24px rgba(37,99,235,0.25); }
  .btn-shimmer:active { transform:translateY(1px) scale(0.98); }

  .btn-outline {
    transition: all 0.2s;
  }
  .btn-outline:hover  { border-color:#CBD5E1; background:#F8FAFC; transform:translateY(-1px); }
  .btn-outline:active { transform:translateY(1px) scale(0.98); }

  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .shake { animation: shake 0.4s ease-in-out; }

  .grad-text {
    background: linear-gradient(135deg,#1E40AF,#3B82F6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .fs-label {
    display:block;
    font-family:'DM Sans',sans-serif;
    font-size:0.85rem;
    font-weight:600;
    color:#334155;
    margin-bottom:6px;
  }

  .input-wrap { position:relative; }
  .input-icon {
    position:absolute; top:50%; left:14px;
    transform:translateY(-50%);
    color:#94A3B8; pointer-events:none;
    transition:color 0.2s; display:flex; align-items:center;
  }
  .input-wrap:focus-within .input-icon { color:#3B82F6; }

  .eye-btn {
    position:absolute; top:50%; right:10px;
    transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    color:#94A3B8; padding:6px;
    transition:color 0.2s; display:flex; align-items:center;
    border-radius: 8px;
  }
  .eye-btn:hover { color:#3B82F6; background: #EFF6FF; }

  .forgot-link {
    font-size: 0.8rem;
    font-weight: 600;
    color: #3B82F6;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  .forgot-link:hover { color: #1E40AF; text-decoration: underline; }

  /* Mobile Optimizations */
  @media (max-width: 480px) {
    .login-card {
      padding: 2rem 1.5rem !important;
      border-radius: 20px !important;
      box-shadow: 0 10px 30px rgba(15,23,42,0.06) !important;
    }
    .fs-input { font-size: 1rem; padding: 12px 14px 12px 42px; } /* Prevent auto-zoom on mobile */
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [shaking, setShaking]     = useState(false);
  const [formData, setFormData]   = useState({ userId: '', password: '' });

  useEffect(() => {
    const token       = searchParams.get('token');
    const userDataStr = searchParams.get('user');
    if (token && userDataStr && !loading) {
      try {
        setLoading(true);
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        login(userData, token);
        navigate('/dashboard', { replace: true });
      } catch (err) {
        setError('Login link invalid or expired.');
        setLoading(false);
      }
    }
  }, [searchParams, login, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let deviceId = localStorage.getItem('unique_device_id');
    if (!deviceId) {
      deviceId = 'WEB-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      localStorage.setItem('unique_device_id', deviceId);
    }

    try {
      const res = await axios.post('/api/auth/login', { ...formData, deviceId });
      if (res.data.user && res.data.token) {
        login(res.data.user, res.data.token);
        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        setError('Complete data not received from server.');
        triggerShake();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid User ID or Password.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100dvh', background:'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', position:'relative', overflow:'hidden' }}>
      <style>{CSS}</style>

      {/* Subtle Blobs for Premium Feel */}
      <div style={{ position:'absolute', top:'-10%', left:'-10%', width:'50vw', height:'50vw', minWidth:'300px', background:'#DBEAFE', borderRadius:'50%', filter:'blur(80px)', opacity:0.6, animation:'blob 10s infinite alternate', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'50vw', height:'50vw', minWidth:'300px', background:'#E0E7FF', borderRadius:'50%', filter:'blur(80px)', opacity:0.5, animation:'blob 12s infinite alternate-reverse', pointerEvents:'none' }}/>

      {/* 🟢 WRAPPER: Yeh Card aur Buttons ko ek sath rakhega taki overlap na ho */}
      <div style={{ width: '100%', maxWidth: '400px', zIndex: 10, position: 'relative' }}>
        
        {/* 🟢 TOP BUTTONS: Ab ye screen par nahi, balki is wrapper ke andar set hain */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', animation: 'fadeUp 0.4s ease forwards' }}>
            <Link to="/" className="btn-outline" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(10px)', border:'1px solid #E2E8F0', borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:'0.85rem', color:'#475569', textDecoration:'none' }}>
              <Home size={16}/> Home
            </Link>
            <Link to="/register" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'0.85rem', color:'#1D4ED8', textDecoration:'none', transition:'all 0.2s' }}>
              Register <ArrowRight size={16}/>
            </Link>
        </div>

        {/* 🟢 LOGIN CARD */}
        <div className="login-card" style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderRadius:24, border:'1px solid #FFFFFF', padding:'2.5rem 2rem', boxShadow:'0 20px 40px -10px rgba(15,23,42,0.08)' }}>
          
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ marginBottom:'0.5rem' }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.6rem', color:'#0F172A', letterSpacing:'-0.5px' }}>
                Financial<span className="grad-text">Saarthi</span>
              </span>
            </div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'1.2rem', color:'#1E293B', marginBottom:'0.3rem' }}>Welcome Back! 👋</h1>
            <p style={{ color:'#64748B', fontSize:'0.9rem', fontWeight:400 }}>Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className={shaking ? 'shake' : ''} style={{ marginBottom:'1.5rem', padding:'12px 16px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:'1.1rem' }}>⚠️</span>
              <span style={{ fontSize:'0.85rem', fontWeight:600, color:'#B91C1C' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <label className="fs-label">User ID</label>
              <div className="input-wrap">
                <span className="input-icon"><User size={18}/></span>
                <input className="fs-input" type="text" name="userId" required value={formData.userId} onChange={handleChange} placeholder="Enter User Id" />
              </div>
            </div>

            <div>
              <label className="fs-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={18}/></span>
                <input className="fs-input" type={showPass ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} placeholder="Enter Password" style={{ paddingRight:44 }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-shimmer" style={{ marginTop:'0.5rem', width:'100%', padding:'14px', background: loading ? '#93C5FD' : '#2563EB', color:'#fff', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:'1rem', borderRadius:12, border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><Loader2 size={18} className="spin"/> Signing in...</> : <>Sign In</>}
            </button>
          </form>

          <div style={{ margin:'1.75rem 0', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }}/>
            <span style={{ fontSize:'0.8rem', color:'#94A3B8', fontWeight:500 }}>New to platform?</span>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }}/>
          </div>

          <Link to="/register" className="btn-outline" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:'#fff', border:'1px solid #CBD5E1', borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:'0.9rem', color:'#334155', textDecoration:'none' }}>
            <UserPlus size={18}/> Create an account
          </Link>

          <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6, opacity: 0.8 }}>
            <ShieldCheck size={14} color="#10B981"/>
            <span style={{ fontSize:'0.75rem', fontWeight:600, color:'#64748B', letterSpacing:'0.02em' }}>Secured by 256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;