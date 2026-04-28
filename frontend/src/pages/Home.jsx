import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, ShieldCheck, ArrowRight, User,
  CheckCircle2, ChevronRight, Zap, Landmark, TrendingUp,
  Heart, Menu, X, Star, UserPlus
} from 'lucide-react';

/* ═══════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --blue:        #2563EB;
    --indigo:      #4F46E5;
    --grad:        linear-gradient(135deg,#2563EB 0%,#4F46E5 100%);
    --shadow-blue: 0 20px 60px rgba(37,99,235,0.28);
  }

  html { scroll-behavior: smooth; }
  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
  body { overflow-x: hidden; }

  /* ── Keyframes ── */
  @keyframes blob {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(30px,-55px) scale(1.13); }
    66%      { transform:translate(-22px,22px) scale(0.88); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(36px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity:0; transform:translateY(-24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0px) rotate(0deg); }
    50%      { transform:translateY(-8px) rotate(1deg); }
  }
  @keyframes shimmer {
    0%   { background-position:-500px 0; }
    100% { background-position: 500px 0; }
  }
  @keyframes ping {
    75%,100% { transform:scale(2.2); opacity:0; }
  }
  @keyframes menuSlide {
    from { opacity:0; transform:translateX(110%); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes gradShift {
    0%   { background-position:0% 50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0% 50%; }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.92); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes slideRight {
    from { opacity:0; transform:translateX(-24px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* ── Scroll reveal ── */
  .reveal {
    opacity:0;
    transform:translateY(40px);
    transition: opacity 0.7s cubic-bezier(.22,1,.36,1),
                transform 0.7s cubic-bezier(.22,1,.36,1);
  }
  .reveal.visible { opacity:1; transform:translateY(0); }

  .reveal-left {
    opacity:0; transform:translateX(-30px);
    transition: opacity 0.7s cubic-bezier(.22,1,.36,1),
                transform 0.7s cubic-bezier(.22,1,.36,1);
  }
  .reveal-left.visible { opacity:1; transform:translateX(0); }

  /* ── Cards ── */
  .card-lift {
    transition: transform 0.3s cubic-bezier(.22,1,.36,1),
                box-shadow 0.3s ease,
                border-color 0.3s;
    -webkit-tap-highlight-color: transparent;
    cursor: default;
  }
  .card-lift:hover {
    transform: translateY(-10px);
    box-shadow: 0 28px 56px rgba(37,99,235,0.13);
    border-color: #BFDBFE !important;
  }
  .card-lift:active { transform:translateY(-3px) scale(0.98); }

  /* ── Shimmer button ── */
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
  .btn-shimmer:hover  { transform:translateY(-2px); box-shadow:0 16px 40px rgba(37,99,235,0.35); }
  .btn-shimmer:active { transform:translateY(0) scale(0.97); }

  /* ── Outline button ── */
  .btn-outline {
    -webkit-tap-highlight-color:transparent;
    transition: border-color 0.2s, color 0.2s, transform 0.2s, background 0.2s;
  }
  .btn-outline:hover  { border-color:#2563EB !important; color:#2563EB !important; background:#EFF6FF !important; transform:translateY(-2px); }
  .btn-outline:active { transform:translateY(0) scale(0.97); }

  /* ── Service card ── */
  .service-card {
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    -webkit-tap-highlight-color:transparent;
  }
  .service-card:hover  { border-color:#93C5FD !important; box-shadow:0 10px 28px rgba(37,99,235,0.12); transform:translateY(-5px); }
  .service-card:active { transform:translateY(-1px) scale(0.98); }

  /* ── Pillar icon animation ── */
  .pillar-icon { transition:transform 0.3s cubic-bezier(.22,1,.36,1); }
  .card-lift:hover .pillar-icon { transform:scale(1.15) rotate(-6deg); }

  /* ── Animated gradient heading ── */
  .grad-text {
    background: linear-gradient(135deg,#2563EB,#4F46E5,#7C3AED,#2563EB);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradShift 4s ease infinite;
  }

  /* ── Mobile menu slide ── */
  .mobile-menu { animation:menuSlide 0.3s cubic-bezier(.22,1,.36,1) forwards; }

  /* ── Navbar link underline ── */
  .nav-link { position:relative; }
  .nav-link::after {
    content:''; position:absolute; bottom:-3px; left:0;
    width:0; height:2px; background:var(--blue);
    transition:width 0.25s; border-radius:2px;
  }
  .nav-link:hover::after { width:100%; }

  /* ── Responsive show/hide ── */
  .hamburger     { display:flex; }
  .desktop-links { display:none; }

  @media (min-width: 900px) {
    .hamburger     { display:none  !important; }
    .desktop-links { display:flex  !important; }
  }

  /* ── Stat counter pulse ── */
  @keyframes statPop {
    0%   { transform:scale(0.8); opacity:0; }
    70%  { transform:scale(1.06); }
    100% { transform:scale(1); opacity:1; }
  }
  .stat-item.visible .stat-num {
    animation: statPop 0.6s cubic-bezier(.22,1,.36,1) forwards;
  }

  /* ── Hero badge pulse ring ── */
  .ping-ring {
    position:absolute; inset:0; border-radius:50%;
    background:#60A5FA; opacity:0.75;
    animation:ping 1.5s cubic-bezier(0,0,.2,1) infinite;
  }
`;

/* ══ SCROLL REVEAL HOOK ══ */
function useReveal() {
  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        }),
        { threshold: 0.1 }
      );
      document.querySelectorAll('.reveal, .reveal-left, .stat-item').forEach(el => obs.observe(el));
      return () => obs.disconnect();
    }, 80);
    return () => clearTimeout(t);
  }, []);
}

/* ══ MAIN COMPONENT ══ */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close menu on outside tap
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e) => {
      if (!e.target.closest('#mobile-menu') && !e.target.closest('#ham-btn'))
        setMenuOpen(false);
    };
    document.addEventListener('touchstart', fn);
    document.addEventListener('mousedown', fn);
    return () => {
      document.removeEventListener('touchstart', fn);
      document.removeEventListener('mousedown', fn);
    };
  }, [menuOpen]);

  /* ── Data ── */
  const steps = [
    { icon: <Users size={26}/>, c:'#2563EB', bg:'#EFF6FF', title:'1. Join & Learn', desc:'Join the platform and become part of our community. Learn financial concepts through training and dedicated support.' },
    { icon: <TrendingUp size={26}/>, c:'#4F46E5', bg:'#EEF2FF', title:'2. Create Awareness', desc:'Spread financial awareness via social media. Connect people with the right financial solutions.' },
    { icon: <ShieldCheck size={26}/>, c:'#059669', bg:'#ECFDF5', title:'3. Grow Your Career', desc:'Grow as a financial consultant and build your professional career. Become a trusted advisor.' },
  ];

  const pillars = [
    { icon:<BookOpen size={26}/>, c:'#2563EB', bg:'#EFF6FF', title:'Financial Awareness',      desc:'Spreading the right financial knowledge to every individual across India.' },
    { icon:<Users size={26}/>,    c:'#4F46E5', bg:'#EEF2FF', title:'Financial Literacy',        desc:'Building financial understanding from basic to advanced levels for all.' },
    { icon:<Landmark size={26}/>, c:'#059669', bg:'#ECFDF5', title:'Financial Solutions',       desc:'Connecting people with the right products based on their needs.' },
    { icon:<Heart size={26}/>,    c:'#7C3AED', bg:'#F5F3FF', title:'Social Media Promotion',    desc:'Using digital platforms to create awareness and reach more people.' },
  ];

  const services = [
    { title:'Banking Solutions',     desc:'Account opening and financial services with leading banks.' },
    { title:'Loan Services',         desc:'Personal, Business, and Home loan assistance.' },
    { title:'Credit Card Services',  desc:'Multiple credit card options to suit your lifestyle.' },
    { title:'Insurance Solutions',   desc:'Health, Life, and General insurance coverage.' },
    { title:'Investment Solutions',  desc:'Investment and wealth creation opportunities.' },
    { title:'Stock Market Access',   desc:'Access to trading platforms and financial education.' },
  ];

  const stats = [
    { v:'10,000+', l:'Active Members' },
    { v:'15+',     l:'Trusted Partners' },
    { v:'50+',     l:'Financial Solutions' },
    { v:'100%',    l:'Commitment' },
  ];

  /* ── Shared tokens ── */
  const S = {
    section: { padding:'clamp(3.5rem,9vw,7rem) clamp(1rem,5vw,2rem)' },
    wrap:    { maxWidth:1120, margin:'0 auto' },
    h2:      { fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.8rem,5vw,2.9rem)', color:'#0F172A', letterSpacing:'-1px', marginBottom:'0.8rem', lineHeight:1.15 },
    sub:     { color:'#64748B', fontSize:'clamp(0.9rem,2vw,1.05rem)', lineHeight:1.8, maxWidth:560, margin:'0 auto' },
    head:    { textAlign:'center', marginBottom:'clamp(2.5rem,6vw,4rem)' },
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#F8FAFC', color:'#1E293B', overflowX:'hidden', minHeight:'100vh' }}>
      <style>{CSS}</style>

      {/* ════════════════════════════════
          NAVBAR
      ════════════════════════════════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:9999,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        backdropFilter:'blur(20px)',
        WebkitBackdropFilter:'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(37,99,235,0.10)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.07)' : 'none',
        transition:'background 0.35s, box-shadow 0.35s',
        animation:'fadeDown 0.5s ease forwards',
      }}>
        {/* ── Single row (always flex) ── */}
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'space-between',
          padding:'0 16px',
          height:60,
          gap:8,
        }}>

          {/* Logo */}
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', flexShrink:0 }}>
            
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'0.95rem', color:'#0F172A', letterSpacing:'-0.3px', whiteSpace:'nowrap' }}>
              Financial<span style={{ color:'#2563EB' }}>Saarthi</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-links" style={{ gap:'1.75rem', alignItems:'center', flex:1, justifyContent:'center' }}>
            {['Home','About','Concept','Services','Partners','Contact'].map((label, i) => {
              const hrefs = ['#','#about','#concept','#services','#partners','#contact'];
              return (
                <a key={label} href={hrefs[i]} className="nav-link"
                  style={{ fontSize:'0.875rem', fontWeight:600, color:'#475569', textDecoration:'none', padding:'4px 0', whiteSpace:'nowrap' }}>
                  {label}
                </a>
              );
            })}
          </div>

          {/* Right buttons */}
          <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            {/* Login */}
            <Link to="/login"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:9, border:'1.5px solid #E2E8F0', fontWeight:700, fontSize:'0.8rem', color:'#475569', textDecoration:'none', whiteSpace:'nowrap', transition:'all 0.2s', lineHeight:1 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#2563EB'; e.currentTarget.style.color='#2563EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#475569'; }}>
              <User size={14}/> Login
            </Link>

            {/* Register */}
            <Link to="/register" className="btn-shimmer"
              style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', background:'var(--grad)', color:'#fff', fontWeight:700, fontSize:'0.8rem', borderRadius:9, textDecoration:'none', boxShadow:'0 4px 14px rgba(37,99,235,0.32)', whiteSpace:'nowrap', fontFamily:"'Sora',sans-serif", lineHeight:1 }}>
              <UserPlus size={14}/> Register
            </Link>

            {/* Hamburger */}
            <button
              id="ham-btn"
              className="hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', background: menuOpen ? '#EFF6FF' : 'transparent', border:'1.5px solid', borderColor: menuOpen ? '#BFDBFE' : '#E2E8F0', borderRadius:8, padding:'6px', color:'#1E293B', cursor:'pointer', WebkitTapHighlightColor:'transparent', flexShrink:0, transition:'all 0.2s' }}>
              {menuOpen ? <X size={19}/> : <Menu size={19}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════
          MOBILE MENU
      ════════════════════════════════ */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position:'fixed', inset:0, zIndex:9997, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)' }}
          />

          {/* Drawer */}
          <div
            id="mobile-menu"
            className="mobile-menu"
            style={{ position:'fixed', top:64, right:0, bottom:0, width:'78%', maxWidth:300, zIndex:9998, background:'#fff', boxShadow:'-12px 0 40px rgba(0,0,0,0.14)', display:'flex', flexDirection:'column', padding:'1rem' }}>

            {/* Nav links */}
            <div style={{ flex:1 }}>
              {['Home','About','Concept','Services','Partners','Contact'].map((label, i) => {
                const hrefs = ['#','#about','#concept','#services','#partners','#contact'];
                return (
                  <a key={label} href={hrefs[i]} onClick={() => setMenuOpen(false)}
                    style={{ display:'flex', alignItems:'center', padding:'0.9rem 1rem', fontWeight:700, fontSize:'1rem', color:'#1E293B', textDecoration:'none', borderRadius:12, marginBottom:2, transition:'background 0.18s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    {label}
                  </a>
                );
              })}
            </div>

            {/* Bottom CTA buttons */}
            <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:'1rem', display:'flex', flexDirection:'column', gap:10 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', border:'2px solid #E2E8F0', borderRadius:13, fontWeight:700, color:'#1E293B', textDecoration:'none', fontSize:'0.95rem', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#2563EB'; e.currentTarget.style.color='#2563EB'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.color='#1E293B'; }}>
                <User size={16}/> Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-shimmer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', background:'var(--grad)', borderRadius:13, fontWeight:700, color:'#fff', textDecoration:'none', fontSize:'0.95rem', boxShadow:'0 10px 28px rgba(37,99,235,0.32)', fontFamily:"'Sora',sans-serif" }}>
                <UserPlus size={16}/> Register
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(80px,15vw,120px) clamp(1rem,5vw,2.5rem) clamp(4rem,9vw,6rem)', overflow:'hidden' }}>

        {/* Blobs */}
        <div style={{ position:'absolute', top:'8%', left:'-10%', width:'clamp(220px,45vw,520px)', height:'clamp(220px,45vw,520px)', background:'#DBEAFE', borderRadius:'50%', filter:'blur(90px)', opacity:0.6, animation:'blob 9s infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'4%', right:'-10%', width:'clamp(180px,40vw,460px)', height:'clamp(180px,40vw,460px)', background:'#E0E7FF', borderRadius:'50%', filter:'blur(90px)', opacity:0.55, animation:'blob 11s infinite 2s', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'clamp(150px,30vw,360px)', height:'clamp(150px,30vw,360px)', background:'#F0FDF4', borderRadius:'50%', filter:'blur(80px)', opacity:0.4, animation:'blob 13s infinite 4s', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:900, width:'100%', animation:'fadeUp 0.85s ease forwards' }}>

          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', borderRadius:999, border:'1px solid #BFDBFE', background:'rgba(239,246,255,0.9)', marginBottom:'1.75rem', backdropFilter:'blur(8px)' }}>
            <span style={{ position:'relative', display:'inline-flex', width:10, height:10 }}>
              <span className="ping-ring"/>
              <span style={{ position:'relative', borderRadius:'50%', width:10, height:10, background:'#2563EB', display:'block', zIndex:1 }}/>
            </span>
            <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.12em' }}>Complete Financial Ecosystem</span>
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(2.1rem,7.5vw,4.5rem)', color:'#0F172A', lineHeight:1.08, letterSpacing:'-2px', marginBottom:'1.5rem' }}>
            Build Your Financial Career<br/>
            with a{' '}
            <span className="grad-text">Trusted Network.</span>
          </h1>

          {/* Subtext */}
          <p style={{ fontSize:'clamp(0.95rem,2.5vw,1.2rem)', color:'#64748B', maxWidth:660, margin:'0 auto 2.75rem', lineHeight:1.8, fontWeight:500 }}>
            Financial Saarthi spreads financial awareness, improves financial literacy,
            connects people with the right solutions, and promotes growth through digital media.
          </p>

          {/* CTA Buttons */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'center', marginBottom:'3.5rem' }}>
            <Link to="/register" className="btn-shimmer"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'clamp(13px,3vw,17px) clamp(24px,5vw,40px)', background:'var(--grad)', color:'#fff', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1.05rem)', borderRadius:15, textDecoration:'none', boxShadow:'var(--shadow-blue)', fontFamily:"'Sora',sans-serif", letterSpacing:'0.1px' }}>
              Explore Platform <ArrowRight size={19}/>
            </Link>
            <a href="#how-it-works" className="btn-outline"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'clamp(13px,3vw,17px) clamp(24px,5vw,40px)', background:'#fff', color:'#1E293B', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1.05rem)', borderRadius:15, textDecoration:'none', border:'2px solid #E2E8F0' }}>
              Watch How It Works <ChevronRight size={19}/>
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem 2rem', justifyContent:'center' }}>
            {[
              { icon:<ShieldCheck size={16} color="#16A34A"/>, t:'Registered Company' },
              { icon:<Zap size={16} color="#D97706"/>,         t:'Real Financial Services' },
              { icon:<CheckCircle2 size={16} color="#2563EB"/>,t:'Trusted Network' },
            ].map(b => (
              <div key={b.t} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.83rem', fontWeight:700, color:'#475569' }}>
                {b.icon} {b.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════ */}
      <section id="how-it-works" style={{ ...S.section, background:'#fff', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.head}>
            <h2 style={S.h2}>Simple Steps to Build Your<br/>Financial Journey</h2>
            <p style={S.sub}>A clear path from joining to growing as a professional financial consultant.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.5rem' }}>
            {steps.map((s,i) => (
              <div key={i} className="card-lift reveal" style={{ background:'#F8FAFC', borderRadius:22, padding:'clamp(1.5rem,4vw,2.25rem)', border:'1.5px solid #F1F5F9', transitionDelay:`${i*0.12}s` }}>
                <div className="pillar-icon" style={{ width:60, height:60, borderRadius:18, background:s.bg, color:s.c, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', boxShadow:`0 6px 20px ${s.c}25` }}>
                  {s.icon}
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.05rem', color:'#0F172A', marginBottom:'0.55rem' }}>{s.title}</h3>
                <p style={{ color:'#64748B', fontSize:'0.875rem', lineHeight:1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          4 PILLARS
      ════════════════════════════════ */}
      <section id="concept" style={{ ...S.section, background:'#F8FAFC', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.head}>
            <h2 style={S.h2}>The 4 Pillars of Financial Saarthi</h2>
            <p style={S.sub}>Our foundation is built on four core principles that guide everything we do.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.25rem' }}>
            {pillars.map((p,i) => (
              <div key={i} className="card-lift reveal" style={{ background:'#fff', borderRadius:22, padding:'clamp(1.5rem,4vw,2.25rem)', border:'1.5px solid #F1F5F9', textAlign:'center', transitionDelay:`${i*0.08}s` }}>
                <div className="pillar-icon" style={{ width:64, height:64, borderRadius:20, background:p.bg, color:p.c, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', boxShadow:`0 6px 20px ${p.c}25` }}>
                  {p.icon}
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1rem', color:'#0F172A', marginBottom:'0.5rem' }}>{p.title}</h3>
                <p style={{ color:'#64748B', fontSize:'0.84rem', lineHeight:1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          SERVICES
      ════════════════════════════════ */}
      <section id="services" style={{ ...S.section, background:'#fff', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.head}>
            <h2 style={S.h2}>Real Solutions for Real Needs</h2>
            <p style={S.sub}>We connect you with a wide range of trusted financial services tailored to your goals.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1.1rem' }}>
            {services.map((s,i) => (
              <div key={i} className="service-card reveal" style={{ display:'flex', alignItems:'flex-start', gap:15, background:'#F8FAFC', padding:'clamp(1.1rem,3vw,1.5rem)', borderRadius:18, border:'1.5px solid #F1F5F9', transitionDelay:`${i*0.06}s` }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'#EFF6FF', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2, boxShadow:'0 4px 12px rgba(37,99,235,0.15)' }}>
                  <CheckCircle2 size={17}/>
                </div>
                <div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.95rem', color:'#0F172A', marginBottom:5 }}>{s.title}</h3>
                  <p style={{ color:'#64748B', fontSize:'0.83rem', lineHeight:1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          STATS
      ════════════════════════════════ */}
      <section style={{ background:'var(--grad)', padding:'clamp(3.5rem,8vw,6rem) clamp(1rem,5vw,2.5rem)', position:'relative', overflow:'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:'-30%', right:'-5%', width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'-3%', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'clamp(2rem,5vw,3rem)', textAlign:'center', position:'relative', zIndex:1 }}>
          {stats.map((s,i) => (
            <div key={i} className="stat-item reveal" style={{ transitionDelay:`${i*0.12}s` }}>
              <div className="stat-num" style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(2rem,6vw,3.2rem)', color:'#fff', lineHeight:1, marginBottom:8 }}>{s.v}</div>
              <div style={{ fontSize:'0.87rem', color:'rgba(255,255,255,0.78)', fontWeight:600, letterSpacing:'0.02em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          CTA
      ════════════════════════════════ */}
      <section style={{ ...S.section, background:'#F8FAFC', borderTop:'1px solid #F1F5F9' }}>
        <div className="reveal" style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:999, background:'#EFF6FF', border:'1px solid #BFDBFE', marginBottom:'1.5rem' }}>
            <Star size={13} color="#2563EB" fill="#2563EB"/>
            <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.12em' }}>Join India's Network</span>
          </div>
          <h2 style={{ ...S.h2, marginBottom:'1.1rem' }}>
            Be a Part of India's Growing<br/>Financial Network
          </h2>
          <p style={{ color:'#64748B', fontSize:'clamp(0.92rem,2.2vw,1.08rem)', marginBottom:'2.75rem', lineHeight:1.8 }}>
            Learn. Connect. Grow. Together we build a financially strong and empowered India.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'center' }}>
            <Link to="/register" className="btn-shimmer"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'clamp(14px,3vw,17px) clamp(28px,5vw,44px)', background:'var(--grad)', color:'#fff', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1.05rem)', borderRadius:15, textDecoration:'none', boxShadow:'var(--shadow-blue)', fontFamily:"'Sora',sans-serif" }}>
              Get Started Now <ArrowRight size={19}/>
            </Link>
            <a href="mailto:info@financialsaarthi.live" className="btn-outline"
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'clamp(14px,3vw,17px) clamp(28px,5vw,44px)', background:'#fff', color:'#1E293B', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1.05rem)', borderRadius:15, textDecoration:'none', border:'2px solid #E2E8F0' }}>
              Connect With Us <ChevronRight size={19}/>
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          FOOTER
      ════════════════════════════════ */}
      <footer id="contact" style={{ background:'#0F172A', color:'#94A3B8', padding:'clamp(3rem,7vw,5.5rem) clamp(1rem,5vw,2.5rem) 1.75rem' }}>
        <div style={{ maxWidth:1120, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'clamp(2rem,5vw,3.5rem)', marginBottom:'2.5rem' }}>

          <div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.15rem', color:'#fff' }}>
              Financial<span style={{ color:'#60A5FA' }}>Saarthi</span>
            </span>
            <p style={{ marginTop:'0.9rem', fontSize:'0.84rem', lineHeight:1.8 }}>
              A financial services and awareness platform committed to spreading financial knowledge and connecting people with the right solutions.
            </p>
          </div>

          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.1rem' }}>Quick Links</h4>
            {['Home','About Us','Services','Partners','Contact'].map(l => (
              <a key={l} href="#" style={{ display:'block', fontSize:'0.84rem', color:'#94A3B8', textDecoration:'none', marginBottom:10, transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='#60A5FA'}
                onMouseLeave={e => e.target.style.color='#94A3B8'}>{l}</a>
            ))}
          </div>

          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.1rem' }}>Services</h4>
            {['Loans','Credit Cards','Insurance','Investments','Stock Market','Banking Solutions'].map(l => (
              <a key={l} href="#" style={{ display:'block', fontSize:'0.84rem', color:'#94A3B8', textDecoration:'none', marginBottom:10, transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='#60A5FA'}
                onMouseLeave={e => e.target.style.color='#94A3B8'}>{l}</a>
            ))}
          </div>

          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1.1rem' }}>Contact</h4>
            <p style={{ fontSize:'0.84rem', marginBottom:8 }}>📧 info@financialsaarthi.live</p>
            <p style={{ fontSize:'0.84rem', marginBottom:'1.5rem' }}>🌐 www.financialsaarthi.live</p>
            <div style={{ fontSize:'0.75rem', color:'#475569', lineHeight:1.7, padding:'12px 14px', background:'#1E293B', borderRadius:12, borderLeft:'3px solid #2563EB' }}>
              <strong style={{ color:'#64748B' }}>Disclaimer:</strong> We do not provide any guaranteed income. Market risks apply. This platform is for financial education, awareness, and service-based growth.
            </div>
          </div>

        </div>

        <div style={{ borderTop:'1px solid #1E293B', paddingTop:'1.5rem', display:'flex', flexWrap:'wrap', gap:'0.75rem', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:'0.78rem', color:'#334155' }}>© {new Date().getFullYear()} Financial Saarthi. All rights reserved.</span>
          <div style={{ display:'flex', gap:'1.25rem' }}>
            {['Privacy Policy','Terms & Conditions','FAQs'].map(l => (
              <a key={l} href="#" style={{ fontSize:'0.75rem', color:'#334155', textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='#60A5FA'}
                onMouseLeave={e => e.target.style.color='#334155'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}