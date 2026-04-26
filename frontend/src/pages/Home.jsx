import React from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, TrendingUp, ShieldCheck, ArrowRight, User, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

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
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatLogo {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
`;

const Home = () => {
  return (
    // 🛠️ FIX: overflow-hidden zaroori hai right side ka white space hatane ke liye
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <style>{styleSheet}</style>
      
      {/* 🟢 TOP NAVBAR (Glassmorphism Light) */}
      <nav className="fixed top-0 w-full z-50 px-4 md:px-8 lg:px-12 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300" style={{ animation: 'fadeInDown 0.6s ease-out forwards' }}>
        
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer group">
          {/* ✅ Logo Image with Animation */}
          <img 
            src="/logo.png" 
            alt="FinSaarthi Logo" 
            className="h-10 w-10 md:h-12 md:w-12 object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-110" 
            style={{ animation: 'floatLogo 3s ease-in-out infinite' }}
          />
          <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 hidden sm:block">
            Fin<span className="text-blue-600">Saarthi</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-wider flex items-center gap-1.5">
            <User size={16} /> <span className="hidden sm:inline">Login</span>
          </Link>
          <Link to="/register" className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-[0_8px_20px_rgba(37,99,235,0.3)] uppercase tracking-wider flex items-center gap-2">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* 🟢 HERO SECTION */}
      <div className="relative min-h-screen w-full flex items-center justify-center pt-28 pb-16 px-4 overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-100 rounded-full blur-[80px] md:blur-[100px] opacity-70 pointer-events-none" style={{ animation: 'blob 7s infinite' }}></div>
        <div className="absolute top-40 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-indigo-100 rounded-full blur-[80px] md:blur-[100px] opacity-70 pointer-events-none" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>
        
        <div className="relative z-10 text-center w-full max-w-5xl mx-auto flex flex-col items-center" style={{ animation: 'fadeInUp 0.8s ease-out forwards' }}>
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8 shadow-sm">
            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-blue-600"></span>
            </span>
            Premium Earning Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] md:leading-[1.1] mb-4 md:mb-6 tracking-tight px-2">
            Financial Freedom <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Starts Right Here.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mb-8 md:mb-12 font-medium leading-relaxed px-4">
            FinSaarthi is India's most trusted digital ecosystem. Watch curated ads, build your network, and unlock automated income streams instantly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
            <Link to="/register" className="w-full sm:w-auto px-6 py-4 md:px-8 bg-blue-600 hover:bg-blue-700 text-white text-base md:text-lg font-bold rounded-xl transition-all hover:-translate-y-1 shadow-[0_15px_30px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group">
              Start Earning Now 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-6 py-4 md:px-8 bg-white text-slate-700 border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-base md:text-lg font-bold rounded-xl transition-all hover:-translate-y-1 shadow-sm flex items-center justify-center gap-2">
              Dashboard Login 
              <ChevronRight size={20} />
            </Link>
          </div>
          
          {/* Trust Indicators (Responsive) */}
          <div className="mt-12 md:mt-16 flex items-center justify-center gap-4 md:gap-8 flex-wrap opacity-80 md:opacity-60 md:grayscale hover:grayscale-0 transition-all duration-500 px-4">
             <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600"><ShieldCheck size={18} className="text-green-600"/> 100% Secure</div>
             <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600"><Zap size={18} className="text-amber-500"/> Instant Withdrawals</div>
             <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-bold text-slate-600"><CheckCircle2 size={18} className="text-blue-600"/> Verified Platform</div>
          </div>

        </div>
      </div>

      {/* 🟢 INFO & FEATURES SECTION */}
      <div className="relative z-10 w-full bg-white py-16 md:py-24 border-t border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          
          <div className="text-center mb-12 md:mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 md:mb-4">How FinSaarthi Works</h2>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl mx-auto">Three simple steps to build your financial empire from the comfort of your home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative px-2 md:px-0">
            
            {/* Connecting Line (Desktop only) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 z-0"></div>

            {/* Feature 1 */}
            <div className="relative z-10 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-md">
                <PlayCircle size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 text-center">1. Watch & Earn</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-center">
                Access premium promotional content daily. Watch curated short videos and get guaranteed ROI credited directly to your main wallet. No hidden conditions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative z-10 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-md">
                <TrendingUp size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 text-center">2. Build Network</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-center">
                Share your referral code and build your binary tree. Earn massive Direct Income and unlimited Binary Matching Income as your team grows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative z-10 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-md">
                <ShieldCheck size={28} className="md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 text-center">3. Secure Payouts</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-center">
                Request withdrawals anytime. Our system uses industry-leading security to process your payouts lightning fast directly to your preferred account.
              </p>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Home;