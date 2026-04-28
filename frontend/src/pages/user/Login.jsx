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

  @keyframes blob {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(30px,-55px) scale(1.13); }
    66%      { transform:translate(-22px,22px) scale(0.88); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0px); }
    50%      { transform:translateY(-8px); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes shake {
    0%,100% { transform:translateX(0); }
    20%      { transform:translateX(-7px); }
    40%      { transform:translateX(7px); }
    60%      { transform:translateX(-5px); }
    80%      { transform:translateX(5px); }
  }
  @keyframes gradShift {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes ping {
    75%,100% { transform:scale(2.2); opacity:0; }
  }
  @keyframes spin {
    to { transform:rotate(360deg); }
  }

  .login-card {
    animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards;
  }

  /* Input focus ring */
  .fs-input {
    width:100%;
    padding: 13px 14px 13px 44px;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: #0F172A;
    background: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .fs-input:focus {
    border-color: #2563EB;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.10);
  }
  .fs-input::placeholder { color:#94A3B8; }

  /* Shimmer button */
  .btn-shimmer {
    position:relative; overflow:hidden;
    -webkit-tap-highlight-color:transparent;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-shimmer::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.22) 50%,transparent 100%);
    background-size:500px 100%;
    animation:shimmer 2.2s infinite linear;
  }
  .btn-shimmer:hover  { transform:translateY(-2px); box-shadow:0 18px 40px rgba(37,99,235,0.35) !important; }
  .btn-shimmer:active { transform:translateY(0) scale(0.97); }

  /* Outline button */
  .btn-outline {
    -webkit-tap-highlight-color:transparent;
    transition: all 0.2s;
  }
  .btn-outline:hover  { border-color:#2563EB !important; color:#2563EB !important; background:#EFF6FF !important; transform:translateY(-2px); }
  .btn-outline:active { transform:translateY(0) scale(0.97); }

  /* Spin for loader */
  .spin { animation: spin 0.8s linear infinite; }

  /* Error shake */
  .shake { animation: shake 0.45s ease-in-out; }

  /* Grad text */
  .grad-text {
    background: linear-gradient(135deg,#2563EB,#4F46E5,#7C3AED,#2563EB);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradShift 4s ease infinite;
  }

  /* Label */
  .fs-label {
    display:block;
    font-family:'Sora',sans-serif;
    font-size:0.72rem;
    font-weight:800;
    color:#475569;
    text-transform:uppercase;
    letter-spacing:0.08em;
    margin-bottom:7px;
  }

  /* Input wrapper */
  .input-wrap {
    position:relative;
  }
  .input-icon {
    position:absolute;
    top:50%; left:14px;
    transform:translateY(-50%);
    color:#94A3B8;
    pointer-events:none;
    transition:color 0.2s;
    display:flex;
    align-items:center;
  }
  .input-wrap:focus-within .input-icon { color:#2563EB; }

  .eye-btn {
    position:absolute;
    top:50%; right:14px;
    transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    color:#94A3B8; padding:4px;
    -webkit-tap-highlight-color:transparent;
    transition:color 0.2s;
    display:flex; align-items:center;
  }
  .eye-btn:hover { color:#2563EB; }
`;

/* ─── MAIN ─── */
const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [shaking, setShaking]     = useState(false);
  const [formData, setFormData]   = useState({ userId: '', password: '' });

  /* ── Admin impersonation ── */
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
        console.error('❌ Impersonation Error:', err);
        setError('Login link invalid or expired.');
        setLoading(false);
      }
    }
  }, [searchParams, login, navigate]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
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

  /* ─── RENDER ─── */
  return (
    <div style={{
      fontFamily:"'DM Sans',sans-serif",
      minHeight:'100vh',
      background:'#F8FAFC',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'1.5rem 1rem',
      position:'relative',
      overflowX:'hidden',
    }}>
      <style>{CSS}</style>

      {/* ── Background blobs ── */}
      <div style={{ position:'absolute', top:'5%', left:'-10%', width:'clamp(200px,45vw,480px)', height:'clamp(200px,45vw,480px)', background:'#DBEAFE', borderRadius:'50%', filter:'blur(90px)', opacity:0.55, animation:'blob 9s infinite', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'5%', right:'-10%', width:'clamp(180px,40vw,440px)', height:'clamp(180px,40vw,440px)', background:'#E0E7FF', borderRadius:'50%', filter:'blur(90px)', opacity:0.5, animation:'blob 11s infinite 2s', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:'55%', left:'55%', transform:'translate(-50%,-50%)', width:'clamp(140px,28vw,320px)', height:'clamp(140px,28vw,320px)', background:'#F0FDF4', borderRadius:'50%', filter:'blur(80px)', opacity:0.4, animation:'blob 13s infinite 4s', pointerEvents:'none' }}/>

      {/* ── Top-left: Home button ── */}
      <Link to="/"
        className="btn-outline"
        style={{ position:'fixed', top:16, left:16, zIndex:100, display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:10, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.8rem', color:'#475569', textDecoration:'none', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <Home size={15}/> Home
      </Link>

      {/* ── Top-right: Register button ── */}
      <Link to="/register"
        className="btn-shimmer"
        style={{ position:'fixed', top:16, right:16, zIndex:100, display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--grad)', borderRadius:10, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.8rem', color:'#fff', textDecoration:'none', boxShadow:'0 4px 16px rgba(37,99,235,0.30)' }}>
        <UserPlus size={15}/> Register
      </Link>

      {/* ── Card ── */}
      <div className="login-card" style={{
        position:'relative', zIndex:10,
        width:'100%', maxWidth:420,
        background:'rgba(255,255,255,0.88)',
        backdropFilter:'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        borderRadius:28,
        border:'1px solid rgba(255,255,255,0.6)',
        boxShadow:'0 24px 64px rgba(15,23,42,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
        padding:'clamp(1.75rem,5vw,2.5rem)',
        marginTop:8,
      }}>

        {/* ── Header ── */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          {/* Brand name instead of logo */}
          <div style={{ marginBottom:'1rem' }}>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.4rem,5vw,1.75rem)', color:'#0F172A', letterSpacing:'-0.5px' }}>
              Financial<span className="grad-text">Saarthi</span>
            </span>
          </div>

          {/* Ping badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:999, border:'1px solid #BFDBFE', background:'#EFF6FF', marginBottom:'1.25rem' }}>
            <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}>
              <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#60A5FA', opacity:0.75, animation:'ping 1.5s cubic-bezier(0,0,.2,1) infinite' }}/>
              <span style={{ position:'relative', borderRadius:'50%', width:8, height:8, background:'#2563EB', display:'block', zIndex:1 }}/>
            </span>
            <span style={{ fontSize:'0.65rem', fontWeight:800, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.1em' }}>Member Login</span>
          </div>

          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.5rem,5vw,1.9rem)', color:'#0F172A', letterSpacing:'-0.6px', marginBottom:'0.4rem', lineHeight:1.15 }}>
            Welcome Back 👋
          </h1>
          <p style={{ color:'#64748B', fontSize:'0.9rem', fontWeight:500 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* ── Error box ── */}
        {error && (
          <div className={shaking ? 'shake' : ''}
            style={{ marginBottom:'1.25rem', padding:'12px 16px', background:'#FEF2F2', border:'1.5px solid #FCA5A5', borderRadius:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'1rem' }}>⚠️</span>
            <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#DC2626', fontFamily:"'Sora',sans-serif" }}>{error}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>

          {/* User ID */}
          <div>
            <label className="fs-label">User ID</label>
            <div className="input-wrap">
              <span className="input-icon"><User size={17}/></span>
              <input
                className="fs-input"
                type="text"
                name="userId"
                required
                value={formData.userId}
                onChange={handleChange}
                placeholder="e.g. FS123456"
                autoComplete="off"
                autoCapitalize="none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="fs-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon"><Lock size={17}/></span>
              <input
                className="fs-input"
                type={showPass ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ paddingRight:44 }}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)} aria-label="Toggle password">
                {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-shimmer"
            style={{
              marginTop:'0.4rem',
              width:'100%',
              padding:'14px',
              background: loading ? '#93C5FD' : 'var(--grad)',
              color:'#fff',
              fontFamily:"'Sora',sans-serif",
              fontWeight:800,
              fontSize:'1rem',
              borderRadius:14,
              border:'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow:'0 12px 32px rgba(37,99,235,0.28)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:8,
              transition:'all 0.2s',
            }}>
            {loading
              ? <><Loader2 size={19} className="spin"/> Signing in...</>
              : <>Secure Sign In <ArrowRight size={19}/></>
            }
          </button>
        </form>

        {/* ── Divider ── */}
        <div style={{ margin:'1.5rem 0 1.25rem', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1, height:'1px', background:'#F1F5F9' }}/>
          <span style={{ fontSize:'0.75rem', color:'#94A3B8', fontWeight:600 }}>Don't have an account?</span>
          <div style={{ flex:1, height:'1px', background:'#F1F5F9' }}/>
        </div>

        {/* ── Register link ── */}
        <Link to="/register" className="btn-outline"
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'13px', background:'#fff', border:'1.5px solid #E2E8F0', borderRadius:14, fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.9rem', color:'#1E293B', textDecoration:'none', textAlign:'center' }}>
          <UserPlus size={17}/> Create New Account
        </Link>

        {/* ── Security badge ── */}
        <div style={{ marginTop:'1.5rem', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <ShieldCheck size={14} color="#16A34A"/>
          <span style={{ fontSize:'0.72rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.08em' }}>
            100% Secure & Encrypted
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;