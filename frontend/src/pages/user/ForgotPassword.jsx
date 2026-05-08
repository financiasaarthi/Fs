import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, ArrowRight, ArrowLeft, Loader2, MailCheck } from 'lucide-react';

/* EXACT SAME CSS STRING AS LOGIN */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
  :root { --grad: linear-gradient(135deg,#2563EB 0%,#4F46E5 100%); }
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  @keyframes blob {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(30px,-55px) scale(1.13); }
    66%      { transform:translate(-22px,22px) scale(0.88); }
  }
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
`;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [userId, setUserId] = useState('');
  
  // Naya State: Ab Link nahi, sirf ye track karenge ki email gaya ya nahi
  const [isSent, setIsSent] = useState(false);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsSent(false);

    try {
      // Backend ko request bhejo
      await axios.post('/api/auth/forgot-password', { userId });
      // Request successful rahi toh success message dikhao
      setIsSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request. Please check your User ID.');
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
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.4rem,5vw,1.8rem)', color:'#0F172A', letterSpacing:'-0.5px', marginBottom:'0.4rem' }}>Reset Password 🔑</h1>
          <p style={{ color:'#64748B', fontSize:'0.9rem', fontWeight:500 }}>Enter your User ID to receive a reset link</p>
        </div>

        {error && (
          <div className={shaking ? 'shake' : ''} style={{ marginBottom:'1.25rem', padding:'12px 16px', background:'#FEF2F2', border:'1.5px solid #FCA5A5', borderRadius:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:'1rem' }}>⚠️</span>
            <span style={{ fontSize:'0.85rem', fontWeight:700, color:'#DC2626' }}>{error}</span>
          </div>
        )}

        {/* 🟢 SUCCESS MESSAGE AFTER EMAIL IS SENT */}
        {isSent ? (
          <div style={{ textAlign: 'center', padding: '24px 20px', background: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <div style={{ background: '#D1FAE5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <MailCheck size={30} color="#059669" />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#065F46', marginBottom: '8px' }}>Reset Link Sent!</h3>
            <p style={{ fontSize: '0.85rem', color: '#047857', marginBottom: '15px', fontWeight: 500, lineHeight: 1.5 }}>
              We have sent a password reset link to the email address associated with this User ID.
            </p>
            <div style={{ background: '#D1FAE5', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '10px' }}>
              <ShieldCheck size={16} color="#047857" style={{ marginTop: '2px' }}/>
              <p style={{ fontSize: '0.75rem', color: '#064E3B', fontWeight: 600, textAlign: 'left', margin: 0 }}>
                Please check your inbox. If you don't see it, be sure to check your <strong>Spam or Junk</strong> folder.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
            <div>
              <label className="fs-label" style={{ marginBottom:'7px' }}>User ID</label>
              <div className="input-wrap">
                <span className="input-icon"><User size={17}/></span>
                <input className="fs-input" type="text" required value={userId} onChange={(e) => {setUserId(e.target.value); setError('');}} placeholder="Enter Password" />
              </div>
            </div>

            <button type="submit" disabled={loading || !userId} className="btn-shimmer" style={{ marginTop:'0.4rem', width:'100%', padding:'14px', background: (loading || !userId) ? '#93C5FD' : 'var(--grad)', color:'#fff', fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1rem', borderRadius:14, border:'none', cursor: (loading || !userId) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading ? <><Loader2 size={19} className="spin"/> Sending Email...</> : <>Send Reset Link <ArrowRight size={19}/></>}
            </button>
          </form>
        )}

        <div style={{ marginTop:'1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.85rem', fontWeight:700, color:'#64748B', textDecoration:'none', transition:'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;