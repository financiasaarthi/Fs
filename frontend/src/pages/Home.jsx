import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Users, ShieldCheck, ArrowRight, User,
  CheckCircle2, ChevronRight, Zap, Landmark, TrendingUp,
  Heart, Menu, X, Star
} from 'lucide-react';

/* ─── GLOBAL CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');

  :root {
    --blue: #2563EB;
    --indigo: #4F46E5;
    --grad: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
    --shadow-blue: 0 20px 60px rgba(37,99,235,0.25);
  }

  html { scroll-behavior: smooth; }
  *, *::before, *::after { box-sizing: border-box; }
  body { overflow-x: hidden; }

  @keyframes blob {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(30px,-50px) scale(1.12); }
    66%      { transform: translate(-20px,20px) scale(0.9); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(28px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeDown {
    from { opacity:0; transform:translateY(-20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes float {
    0%,100% { transform:translateY(0); }
    50%      { transform:translateY(-7px); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes ping {
    75%,100% { transform:scale(2); opacity:0; }
  }
  @keyframes menuSlide {
    from { opacity:0; transform:translateX(100%); }
    to   { opacity:1; transform:translateX(0); }
  }

  .reveal {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.65s cubic-bezier(.22,1,.36,1),
                transform 0.65s cubic-bezier(.22,1,.36,1);
  }
  .reveal.visible { opacity:1; transform:translateY(0); }

  .card-lift {
    transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s;
    -webkit-tap-highlight-color: transparent;
  }
  .card-lift:hover  { transform:translateY(-8px); box-shadow:0 24px 48px rgba(37,99,235,0.12); }
  .card-lift:active { transform:translateY(-2px) scale(0.98); }

  .btn-shimmer { position:relative; overflow:hidden; -webkit-tap-highlight-color:transparent; }
  .btn-shimmer::after {
    content:'';
    position:absolute; inset:0;
    background: linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%);
    background-size: 400px 100%;
    animation: shimmer 2.4s infinite linear;
  }

  .service-card {
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    -webkit-tap-highlight-color: transparent;
  }
  .service-card:hover  { border-color:#2563EB; box-shadow:0 8px 24px rgba(37,99,235,0.10); transform:translateY(-4px); }
  .service-card:active { transform:translateY(-1px) scale(0.98); }

  .nav-link { position:relative; }
  .nav-link::after {
    content:''; position:absolute; bottom:-2px; left:0;
    width:0; height:2px; background:var(--blue);
    transition:width 0.25s; border-radius:2px;
  }
  .nav-link:hover::after { width:100%; }

  .pillar-icon { transition: transform 0.25s; }
  .card-lift:hover .pillar-icon { transform: scale(1.1) rotate(-4deg); }

  .mobile-menu { animation: menuSlide 0.28s cubic-bezier(.22,1,.36,1) forwards; }

  /* Mobile first defaults */
  .desktop-links { display: none; }
  .hamburger     { display: flex; }
  .login-text    { display: none; }

  @media (min-width: 768px) {
    .desktop-links { display: flex !important; }
    .hamburger     { display: none  !important; }
    .login-text    { display: inline !important; }
  }
`;

/* ─── SCROLL REVEAL ─── */
function useReveal() {
  useEffect(() => {
    const run = () => {
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
        { threshold: 0.1 }
      );
      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
      return () => obs.disconnect();
    };
    const t = setTimeout(run, 100);
    return () => clearTimeout(t);
  }, []);
}

/* ─── MAIN ─── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  useReveal();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Concept', href: '#concept' },
    { label: 'Services', href: '#services' },
    { label: 'Partners', href: '#partners' },
    { label: 'Contact', href: '#contact' },
  ];

  const steps = [
    { icon: <Users size={26} />, c: '#2563EB', bg: '#EFF6FF', title: '1. Join & Learn', desc: 'Join the platform and become part of our community. Learn financial concepts through training and dedicated support.' },
    { icon: <TrendingUp size={26} />, c: '#4F46E5', bg: '#EEF2FF', title: '2. Create Awareness', desc: 'Spread financial awareness via social media. Connect people with the right financial solutions.' },
    { icon: <ShieldCheck size={26} />, c: '#059669', bg: '#ECFDF5', title: '3. Grow Your Career', desc: 'Grow as a financial consultant and build your professional career. Become a trusted advisor.' },
  ];

  const pillars = [
    { icon: <BookOpen size={26} />, c: '#2563EB', bg: '#EFF6FF', title: 'Financial Awareness', desc: 'Spreading the right financial knowledge to every individual across India.' },
    { icon: <Users size={26} />, c: '#4F46E5', bg: '#EEF2FF', title: 'Financial Literacy', desc: 'Building financial understanding from basic to advanced levels for all.' },
    { icon: <Landmark size={26} />, c: '#059669', bg: '#ECFDF5', title: 'Financial Solutions', desc: 'Connecting people with the right products based on their needs.' },
    { icon: <Heart size={26} />, c: '#7C3AED', bg: '#F5F3FF', title: 'Social Media Promotion', desc: 'Using digital platforms to create awareness and reach more people.' },
  ];

  const services = [
    { title: 'Banking Solutions', desc: 'Account opening and financial services with leading banks.' },
    { title: 'Loan Services', desc: 'Personal, Business, and Home loan assistance.' },
    { title: 'Credit Card Services', desc: 'Multiple credit card options to suit your lifestyle.' },
    { title: 'Insurance Solutions', desc: 'Health, Life, and General insurance coverage.' },
    { title: 'Investment Solutions', desc: 'Investment and wealth creation opportunities.' },
    { title: 'Stock Market Access', desc: 'Access to trading platforms and financial education.' },
  ];

  const stats = [
    { v: '10,000+', l: 'Active Members' },
    { v: '15+',    l: 'Trusted Partners' },
    { v: '50+',    l: 'Financial Solutions' },
    { v: '100%',   l: 'Commitment' },
  ];

  /* ── shared style tokens ── */
  const S = {
    section: { padding: 'clamp(3rem,8vw,6rem) clamp(1rem,4vw,1.5rem)' },
    wrap:    { maxWidth: 1100, margin: '0 auto' },
    h2:      { fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.75rem,5vw,2.75rem)', color:'#0F172A', letterSpacing:'-0.8px', marginBottom:'0.75rem' },
    sub:     { color:'#64748B', fontSize:'clamp(0.875rem,2vw,1rem)', lineHeight:1.75, maxWidth:560, margin:'0 auto' },
    secHead: { textAlign:'center', marginBottom:'clamp(2rem,5vw,3.5rem)' },
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:'#F8FAFC', color:'#1E293B', overflowX:'hidden', minHeight:'100vh' }}>
      <style>{CSS}</style>

      {/* ══ NAVBAR ══ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:999,
        padding:'0 clamp(1rem,4vw,2rem)', height:64,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        background: scrolled ? 'rgba(255,255,255,0.93)' : 'rgba(255,255,255,0.78)',
        backdropFilter:'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        transition:'all 0.3s',
        animation:'fadeDown 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, minWidth:0 }}>
          <img src="/logo.png" alt="Financial Saarthi Logo"
            style={{ height:36, width:36, objectFit:'contain', flexShrink:0, animation:'float 3s ease-in-out infinite', filter:'drop-shadow(0 2px 8px rgba(37,99,235,0.25))' }} />
          <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'clamp(0.85rem,3.5vw,1.1rem)', color:'#0F172A', letterSpacing:'-0.4px', whiteSpace:'nowrap' }}>
            Financial<span style={{ color:'#2563EB' }}>Saarthi</span>
          </span>
        </div>

        {/* Desktop links - hidden on mobile via CSS */}
        <div className="desktop-links" style={{ gap:'1.75rem', alignItems:'center' }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href} className="nav-link"
              style={{ fontSize:'0.875rem', fontWeight:600, color:'#475569', textDecoration:'none', padding:'4px 0' }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          {/* Login - hidden on very small screens */}
          <Link to="/login" className="nav-login"
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', fontWeight:700, color:'#475569', textDecoration:'none', padding:'7px 10px', borderRadius:8 }}>
            <User size={15} /> <span className="login-text">Login</span>
          </Link>
          <Link to="/register" className="btn-shimmer"
            style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:'var(--grad)', color:'#fff', fontWeight:700, fontSize:'0.82rem', borderRadius:10, textDecoration:'none', boxShadow:'0 8px 20px rgba(37,99,235,0.3)', whiteSpace:'nowrap' }}>
            Get Started <ArrowRight size={15} />
          </Link>
          {/* Hamburger - shown only on mobile via CSS */}
          <button className="hamburger" onClick={() => setMenuOpen(o=>!o)}
            style={{ alignItems:'center', justifyContent:'center', background:'none', border:'none', cursor:'pointer', padding:'8px 6px', borderRadius:8, color:'#1E293B', WebkitTapHighlightColor:'transparent', flexShrink:0 }}
            aria-label="Toggle menu">
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* ══ MOBILE MENU ══ */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)}
            style={{ position:'fixed', inset:0, zIndex:997, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(3px)' }} />
          <div className="mobile-menu"
            style={{ position:'fixed', top:64, right:0, bottom:0, width:'80%', maxWidth:300, zIndex:998, background:'#fff', boxShadow:'-8px 0 32px rgba(0,0,0,0.12)', padding:'1.5rem 1.25rem', display:'flex', flexDirection:'column', gap:'0.25rem' }}>
            {navLinks.map(l => (
              <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ display:'block', padding:'0.85rem 1rem', fontWeight:700, fontSize:'1rem', color:'#1E293B', textDecoration:'none', borderRadius:10 }}>
                {l.label}
              </a>
            ))}
            <div style={{ marginTop:'auto', display:'flex', flexDirection:'column', gap:10 }}>
              <Link to="/login" onClick={() => setMenuOpen(false)}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:13, border:'2px solid #E2E8F0', borderRadius:12, fontWeight:700, color:'#1E293B', textDecoration:'none', fontSize:'0.95rem' }}>
                <User size={16}/> Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-shimmer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:13, background:'var(--grad)', borderRadius:12, fontWeight:700, color:'#fff', textDecoration:'none', fontSize:'0.95rem', boxShadow:'0 10px 24px rgba(37,99,235,0.3)' }}>
                Get Started <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ══ HERO ══ */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(90px,15vw,120px) clamp(1rem,4vw,2rem) clamp(3rem,8vw,5rem)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'10%', left:'-8%', width:'clamp(200px,42vw,480px)', height:'clamp(200px,42vw,480px)', background:'#DBEAFE', borderRadius:'50%', filter:'blur(80px)', opacity:0.65, animation:'blob 8s infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'5%', right:'-8%', width:'clamp(160px,36vw,420px)', height:'clamp(160px,36vw,420px)', background:'#E0E7FF', borderRadius:'50%', filter:'blur(80px)', opacity:0.6, animation:'blob 9s infinite 2s', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:860, width:'100%', animation:'fadeUp 0.8s ease forwards' }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:999, border:'1px solid #BFDBFE', background:'#EFF6FF', marginBottom:'1.5rem' }}>
            <span style={{ position:'relative', display:'inline-flex', width:10, height:10 }}>
              <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#60A5FA', opacity:0.75, animation:'ping 1.4s cubic-bezier(0,0,.2,1) infinite' }}/>
              <span style={{ position:'relative', borderRadius:'50%', width:10, height:10, background:'#2563EB', display:'block' }}/>
            </span>
            <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.1em' }}>Complete Financial Ecosystem</span>
          </div>

          <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(2rem,7vw,4.2rem)', color:'#0F172A', lineHeight:1.1, letterSpacing:'-1.5px', marginBottom:'1.25rem' }}>
            Build Your Financial Career<br/>
            with a{' '}
            <span style={{ background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Trusted Network.
            </span>
          </h1>

          <p style={{ fontSize:'clamp(0.92rem,2.5vw,1.15rem)', color:'#64748B', maxWidth:640, margin:'0 auto 2.5rem', lineHeight:1.8, fontWeight:500 }}>
            Financial Saarthi spreads financial awareness, improves financial literacy, connects people with the right solutions, and promotes growth through digital media.
          </p>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'center', marginBottom:'3rem' }}>
            <Link to="/register" className="btn-shimmer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'clamp(12px,3vw,16px) clamp(22px,5vw,36px)', background:'var(--grad)', color:'#fff', fontWeight:800, fontSize:'clamp(0.88rem,2.5vw,1rem)', borderRadius:14, textDecoration:'none', boxShadow:'var(--shadow-blue)', fontFamily:"'Sora',sans-serif" }}>
              Explore Platform <ArrowRight size={18}/>
            </Link>
            <a href="#how-it-works"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'clamp(12px,3vw,16px) clamp(22px,5vw,36px)', background:'#fff', color:'#1E293B', fontWeight:800, fontSize:'clamp(0.88rem,2.5vw,1rem)', borderRadius:14, textDecoration:'none', border:'2px solid #E2E8F0' }}>
              Watch How It Works <ChevronRight size={18}/>
            </a>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem 2rem', justifyContent:'center', opacity:0.75 }}>
            {[
              { icon:<ShieldCheck size={15} color="#16A34A"/>, t:'Registered Company' },
              { icon:<Zap size={15} color="#D97706"/>,         t:'Real Financial Services' },
              { icon:<CheckCircle2 size={15} color="#2563EB"/>,t:'Trusted Network' },
            ].map(b => (
              <div key={b.t} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', fontWeight:700, color:'#475569' }}>
                {b.icon} {b.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ ...S.section, background:'#fff', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.secHead}>
            <h2 style={S.h2}>Simple Steps to Build Your Financial Journey</h2>
            <p style={S.sub}>A clear path from joining to growing as a professional financial consultant.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'1.25rem' }}>
            {steps.map((s,i) => (
              <div key={i} className="card-lift reveal" style={{ background:'#F8FAFC', borderRadius:20, padding:'clamp(1.25rem,3.5vw,2rem)', border:'1px solid #F1F5F9', transitionDelay:`${i*0.1}s` }}>
                <div className="pillar-icon" style={{ width:56, height:56, borderRadius:16, background:s.bg, color:s.c, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.1rem', boxShadow:`0 4px 16px ${s.c}22` }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1rem', color:'#0F172A', marginBottom:'0.5rem' }}>{s.title}</h3>
                <p style={{ color:'#64748B', fontSize:'0.85rem', lineHeight:1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4 PILLARS ══ */}
      <section id="concept" style={{ ...S.section, background:'#F8FAFC', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.secHead}>
            <h2 style={S.h2}>The 4 Pillars of Financial Saarthi</h2>
            <p style={S.sub}>Our foundation is built on four core principles that guide everything we do.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:'1.1rem' }}>
            {pillars.map((p,i) => (
              <div key={i} className="card-lift reveal" style={{ background:'#fff', borderRadius:20, padding:'clamp(1.25rem,3.5vw,2rem)', border:'1px solid #F1F5F9', textAlign:'center', transitionDelay:`${i*0.07}s` }}>
                <div className="pillar-icon" style={{ width:58, height:58, borderRadius:17, background:p.bg, color:p.c, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', boxShadow:`0 4px 16px ${p.c}22` }}>{p.icon}</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'0.97rem', color:'#0F172A', marginBottom:'0.45rem' }}>{p.title}</h3>
                <p style={{ color:'#64748B', fontSize:'0.82rem', lineHeight:1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services" style={{ ...S.section, background:'#fff', borderTop:'1px solid #F1F5F9' }}>
        <div style={S.wrap}>
          <div className="reveal" style={S.secHead}>
            <h2 style={S.h2}>Real Solutions for Real Needs</h2>
            <p style={S.sub}>We connect you with a wide range of trusted financial services tailored to your goals.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:'1rem' }}>
            {services.map((s,i) => (
              <div key={i} className="service-card reveal" style={{ display:'flex', alignItems:'flex-start', gap:14, background:'#F8FAFC', padding:'clamp(1rem,3vw,1.35rem)', borderRadius:16, border:'1.5px solid #F1F5F9', cursor:'pointer', transitionDelay:`${i*0.05}s` }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#EFF6FF', color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <CheckCircle2 size={16}/>
                </div>
                <div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:'0.93rem', color:'#0F172A', marginBottom:4 }}>{s.title}</h3>
                  <p style={{ color:'#64748B', fontSize:'0.81rem', lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{ background:'var(--grad)', padding:'clamp(3rem,7vw,5rem) clamp(1rem,4vw,2rem)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'clamp(1.5rem,4vw,2.5rem)', textAlign:'center' }}>
          {stats.map((s,i) => (
            <div key={i} className="reveal" style={{ transitionDelay:`${i*0.1}s` }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:900, fontSize:'clamp(1.9rem,5vw,3rem)', color:'#fff', lineHeight:1.1, marginBottom:6 }}>{s.v}</div>
              <div style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.75)', fontWeight:600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ ...S.section, background:'#F8FAFC', borderTop:'1px solid #F1F5F9' }}>
        <div className="reveal" style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:999, background:'#EFF6FF', marginBottom:'1.25rem' }}>
            <Star size={12} color="#2563EB" fill="#2563EB"/>
            <span style={{ fontSize:'0.68rem', fontWeight:800, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.1em' }}>Join India's Network</span>
          </div>
          <h2 style={{ ...S.h2, marginBottom:'1rem', lineHeight:1.15 }}>
            Be a Part of India's Growing<br/>Financial Network
          </h2>
          <p style={{ color:'#64748B', fontSize:'clamp(0.9rem,2.2vw,1.05rem)', marginBottom:'2.5rem', lineHeight:1.8 }}>
            Learn. Connect. Grow. Together we build a financially strong and empowered India.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'center' }}>
            <Link to="/register" className="btn-shimmer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'clamp(13px,3vw,16px) clamp(26px,5vw,40px)', background:'var(--grad)', color:'#fff', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1rem)', borderRadius:14, textDecoration:'none', boxShadow:'var(--shadow-blue)', fontFamily:"'Sora',sans-serif" }}>
              Get Started Now <ArrowRight size={18}/>
            </Link>
            <a href="mailto:info@financialsaarthi.live"
              style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'clamp(13px,3vw,16px) clamp(26px,5vw,40px)', background:'#fff', color:'#1E293B', fontWeight:800, fontSize:'clamp(0.9rem,2.5vw,1rem)', borderRadius:14, textDecoration:'none', border:'2px solid #E2E8F0' }}>
              Connect With Us <ChevronRight size={18}/>
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="contact" style={{ background:'#0F172A', color:'#94A3B8', padding:'clamp(3rem,7vw,5rem) clamp(1rem,4vw,2rem) 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'clamp(2rem,5vw,3rem)', marginBottom:'2.5rem' }}>
          <div>
            <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:'1.1rem', color:'#fff' }}>
              Financial<span style={{ color:'#60A5FA' }}>Saarthi</span>
            </span>
            <p style={{ marginTop:'0.85rem', fontSize:'0.83rem', lineHeight:1.75 }}>
              A financial services and awareness platform committed to spreading financial knowledge and connecting people with the right solutions.
            </p>
          </div>
          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>Quick Links</h4>
            {['Home','About Us','Services','Partners','Contact'].map(l => (
              <a key={l} href="#" style={{ display:'block', fontSize:'0.83rem', color:'#94A3B8', textDecoration:'none', marginBottom:9 }}>{l}</a>
            ))}
          </div>
          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>Services</h4>
            {['Loans','Credit Cards','Insurance','Investments','Stock Market','Banking'].map(l => (
              <a key={l} href="#" style={{ display:'block', fontSize:'0.83rem', color:'#94A3B8', textDecoration:'none', marginBottom:9 }}>{l}</a>
            ))}
          </div>
          <div>
            <h4 style={{ color:'#fff', fontWeight:700, fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>Contact</h4>
            <p style={{ fontSize:'0.83rem', marginBottom:6 }}>📧 info@financialsaarthi.live</p>
            <p style={{ fontSize:'0.83rem', marginBottom:'1.25rem' }}>🌐 www.financialsaarthi.live</p>
            <p style={{ fontSize:'0.74rem', color:'#475569', lineHeight:1.65, padding:'10px 12px', background:'#1E293B', borderRadius:10, borderLeft:'3px solid #334155' }}>
              <strong style={{ color:'#64748B' }}>Disclaimer:</strong> We do not provide any guaranteed income. Market risks apply. This platform is for financial education, awareness, and service-based growth.
            </p>
          </div>
        </div>
        <div style={{ borderTop:'1px solid #1E293B', paddingTop:'1.5rem', textAlign:'center', fontSize:'0.77rem', color:'#334155' }}>
          © {new Date().getFullYear()} Financial Saarthi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}