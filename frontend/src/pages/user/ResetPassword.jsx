import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, AlertCircle, RefreshCcw } from 'lucide-react';

/* EXACT SAME CSS AS LOGIN */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  :root { --grad: linear-gradient(135deg,#2563EB 0%,#4F46E5 100%); }
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  @keyframes blob { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-55px) scale(1.13); } 66% { transform:translate(-22px,22px) scale(0.88); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position:-500px 0; } 100% { background-position: 500px 0; } }
  @keyframes shake { 0%,100% { transform:translateX(0); } 20% { transform:translateX(-7px); } 40% { transform:translateX(7px); } 60% { transform:translateX(-5px); } 80% { transform:translateX(5px); } }
  .login-card { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards; }
  .fs-input { width:100%; padding: 13px 14px 13px 44px; border: 1.5px solid #E2E8F0; border-radius: 12px; font-size: 0.95rem; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #0F172A; background: #fff; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
  .fs-input:focus { border-color: #2563EB; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
  .fs-input::placeholder { color:#94A3B8; }
  .btn-shimmer { position:relative; overflow:hidden; transition: transform 0.2s, box-shadow 0.2s; }
  .btn-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.22) 50%,transparent 100%); background-size:500px 100%; animation:shimmer 2.2s infinite linear; }
  .btn-shimmer:hover  { transform:translateY(-2px); box-shadow:0 18px 40px rgba(37,99,235,0.35) !important; }
  .btn-shimmer:active { transform:translateY(0) scale(0.97); }
  .spin { animation: spin 0.8s linear infinite; }
  .shake { animation: shake 0.45s ease-in-out; }
  .fs-label { display:block; font-family:'Sora',sans-serif; font-size:0.72rem; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.08em; }
  .input-wrap { position:relative; }
  .input-icon { position:absolute; top:50%; left:14px; transform:translateY(-50%); color:#94A3B8; transition:color 0.2s; display:flex; align-items:center; }
  .input-wrap:focus-within .input-icon { color:#2563EB; }
  .eye-btn { position:absolute; top:50%; right:14px; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94A3B8; transition:color 0.2s; display:flex; align-items:center; }
  .eye-btn:hover { color:#2563EB; }
`;

const ResetPassword = () => {
  const { token } = useParams(); // URL se token nikalne ke liye
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false); // Naya state expiry handle karne ke liye
  const [success, setSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });

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
    setIsExpired(false);

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      triggerShake();
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      setLoading(false);
      return;
    }

    try {
      // Backend par request bhejo
      await axios.post(`/api/auth/reset-password/${token}`, { 
        newPassword: formData.newPassword 
      });
      setSuccess(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid or expired reset token.';
      setError(errorMsg);
      
      // Agar backend se "Invalid or expired" error aaye, toh isExpired true kardo
      if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('expired')) {
        setIsExpired(true);
      }
      
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:'100vh', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem 1rem', position:'relative', overflowX:'hidden' }}>
      <style>{CSS}</style>
      <div style={{ position:'absolute', top:'5%', left:'-10%', width:'clamp(200px,45vw,480px)', height:'clamp(200px,45vw,480px)', background:'#DBEAFE', borderRadius:'50%', filter:'blur(90px)', opacity:0.55, animation:'blob 9s infinite', pointerEvents:'none' }}/>

      <div className="login-card" style={{ position:'relative', zIndex:10, width:'100%', maxWidth:420, background:'rgba(255,255,255,0.88)', backdropFilter:'blur(24px)', borderRadius:28, border:'1px solid rgba(255,255,255,0.6)', padding:'clamp(1.75rem,5vw,2.5rem)', boxShadow:'0 24px 64px rgba(15,23,42,0.10)' }}>
        
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.4rem,5vw,1.8rem)', color:'#0F172A', letterSpacing:'-0.5px', marginBottom:'0.4rem' }}>Create New Password</h1>
          <p style={{ color:'#64748B', fontSize:'0.9rem', fontWeight:500 }}>Please enter your new strong password</p>
        </div>

        {error && !isExpired && (
          <div className={shaking ? 'shake' : ''} style={{ marginBottom:'1.25rem', padding:'12px 16px', background:'#FEF2F2', border:'1.5px solid #FCA5A5', borderRadius:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'1rem' }}>⚠️</span>
            <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#DC2626' }}>{error}</span>
          </div>
        )}

        {/* 🔴 EXPIRED TOKEN UI */}
        {isExpired ? (
          <div style={{ textAlign: 'center', padding: '20px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '14px', marginBottom: '1.5rem', animation: 'fadeUp 0.3s forwards' }}>
            <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>Link Expired!</h3>
            <p style={{ fontSize: '0.85rem', color: '#B91C1C', marginBottom: '20px', fontWeight: 500 }}>This password reset link is invalid or has expired.</p>
            <Link to="/forgot-password" className="btn-shimmer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: 'var(--grad)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              <RefreshCcw size={16} /> Request New Link
            </Link>
          </div>
        ) : success ? (
          /* 🟢 SUCCESS UI */
          <div style={{ textAlign: 'center', padding: '20px', background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '14px', marginBottom: '1.5rem', animation: 'fadeUp 0.3s forwards' }}>
            <CheckCircle2 size={40} color="#2563EB" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '8px' }}>Password Updated!</h3>
            <p style={{ fontSize: '0.85rem', color: '#1E40AF', marginBottom: '20px', fontWeight: 500 }}>You can now safely login with your new password.</p>
            <Link to="/login" className="btn-shimmer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 24px', background: 'var(--grad)', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
              Proceed to Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          /* 🔵 NORMAL FORM UI */
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            
            <div>
              <label className="fs-label" style={{ marginBottom:'7px' }}>New Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={17}/></span>
                <input className="fs-input" type={showPass ? 'text' : 'password'} name="newPassword" required value={formData.newPassword} onChange={handleChange} placeholder="Enter Password" style={{ paddingRight:44 }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            <div>
              <label className="fs-label" style={{ marginBottom:'7px' }}>Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Lock size={17}/></span>
                <input className="fs-input" type={showPass ? 'text' : 'password'} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="Enter Password" style={{ paddingRight:44 }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-shimmer" style={{ marginTop:'0.4rem', width:'100%', padding:'14px', background: loading ? '#93C5FD' : 'var(--grad)', color:'#fff', fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1rem', borderRadius:14, border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><Loader2 size={19} className="spin"/> Saving...</> : <>Reset Password <ArrowRight size={19}/></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;