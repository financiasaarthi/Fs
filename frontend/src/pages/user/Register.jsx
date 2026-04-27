import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Link as LinkIcon, Copy, Phone, Globe, ArrowRight, ChevronLeft, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
// 🟢 Success Modal Import
import SuccessModal from '../../components/SuccessModal';

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

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sponsorFromURL = searchParams.get('sponsor') || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredData, setRegisteredData] = useState(null); 

  // 🟢 SPONSOR VERIFICATION STATES
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorError, setSponsorError] = useState("");
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState(false);

  const [formData, setFormData] = useState({
    sponsorId: sponsorFromURL, 
    position: "LEFT",
    name: "",
    email: "",
    mobile: "",
    country: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  // 🟢 LIVE SPONSOR VERIFICATION EFFECT
  useEffect(() => {
    const fetchSponsorName = async () => {
      const spId = formData.sponsorId.trim();
      if (spId.length >= 7) {
        setIsVerifyingSponsor(true);
        setSponsorError("");
        try {
          // Note: Backend ka find-name route open hona chahiye ya auth ignore kare for registration
          const res = await axios.get(`/api/user/find-name/${spId}`);
          setSponsorName(res.data.name);
        } catch (err) {
          setSponsorName("");
          setSponsorError("Invalid Sponsor ID!");
        } finally {
          setIsVerifyingSponsor(false);
        }
      } else {
        setSponsorName("");
        setSponsorError("");
      }
    };

    const timeoutId = setTimeout(fetchSponsorName, 500); // 500ms delay to avoid spamming API
    return () => clearTimeout(timeoutId);
  }, [formData.sponsorId]);


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // 🟢 1. Device ID Logic (Check if exists, otherwise generate)
  let deviceId = localStorage.getItem('unique_device_id');
  if (!deviceId) {
    deviceId = 'WEB-' + Math.random().toString(36).substring(2, 12).toUpperCase();
    localStorage.setItem('unique_device_id', deviceId);
  }

  // 🟢 2. Frontend Validation
  if (!sponsorName) {
    setError("Please enter a valid Sponsor ID first.");
    setLoading(false);
    return;
  }
  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters long.");
    setLoading(false);
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match!");
    setLoading(false);
    return;
  }

  try {
    // 🟢 3. API Call (FIXED: Added deviceId into the payload)
    const res = await axios.post('/api/auth/register', { 
        ...formData, 
        deviceId: deviceId // 👈 Ye bhejna zaroori tha
    });

    const newUserId = res.data?.user?.userId || res.data?.userId;

    // Success Data set karo modal ke liye
    setRegisteredData({
      userId: newUserId, 
      password: formData.password
    });
    
    setIsModalOpen(true); 

  } catch (err) {
    // Backend se aane wala exact error message dikhayega
    setError(err.response?.data?.message || "Registration Failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({
      name: "", email: "", mobile: "", country: "", password: "", confirmPassword: "", sponsorId: "", position: "LEFT"
    });
    navigate('/login'); 
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <style>{styleSheet}</style>

      {/* 🟢 Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-200 rounded-full blur-[80px] md:blur-[100px] opacity-50 pointer-events-none" style={{ animation: 'blob 7s infinite' }}></div>
      <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-200 rounded-full blur-[80px] md:blur-[100px] opacity-50 pointer-events-none" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>

      {/* 🔙 Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-black text-slate-400 hover:text-blue-600 transition-colors z-20 uppercase tracking-widest">
        <ChevronLeft size={18} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* 🟢 REGISTRATION CARD */}
      <div 
        className="relative z-10 w-full max-w-[700px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-white/60 p-6 md:p-10"
        style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}
      >
        
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-16 w-16 object-contain drop-shadow-lg"
              style={{ animation: 'floatLogo 3s ease-in-out infinite' }}
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Create Account
          </h1>
          <p className="text-slate-400 font-bold mt-1 text-[10px] uppercase tracking-[0.2em]">Join the network and start earning</p>
        </div>

        {/* Global Error Message */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2"
            style={{ animation: 'shake 0.4s ease-in-out' }}
          >
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 🟢 TOP SECTION: SPONSOR & POSITION (Highlighted Area) */}
          <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100 space-y-5">
            
            {/* Sponsor ID */}
            <div>
              <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] mb-2 ml-1">Referral Sponsor ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-300"><LinkIcon size={18} /></div>
                <input 
                  type="text" name="sponsorId" required 
                  value={formData.sponsorId} onChange={handleChange} 
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-blue-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all bg-white shadow-inner font-black text-sm text-blue-700 placeholder:text-blue-200" 
                  placeholder="ENTER 7-DIGIT SPONSOR ID" 
                />
                {isVerifyingSponsor && <Loader2 size={18} className="absolute right-4 top-3.5 animate-spin text-blue-500" />}
              </div>
              
              {/* Sponsor Verification Status Area */}
              {sponsorName && (
                <div className="mt-2.5 ml-1 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit animate-in fade-in">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    Verified: {sponsorName}
                  </span>
                </div>
              )}
              {sponsorError && (
                <div className="mt-2.5 ml-1 flex items-center gap-2 text-red-500 animate-in fade-in">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{sponsorError}</span>
                </div>
              )}
            </div>

            {/* Network Position */}
            <div>
              <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.2em] mb-2 ml-1">Network Placement</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className={`flex-1 cursor-pointer border-2 rounded-2xl py-3.5 text-center font-black text-xs uppercase tracking-[0.2em] transition-all ${formData.position === 'LEFT' ? 'border-blue-600 bg-white text-blue-700 shadow-md ring-4 ring-blue-500/10 transform scale-[1.02]' : 'border-blue-100 text-blue-400 bg-white/50 hover:bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="position" value="LEFT" className="hidden" checked={formData.position === 'LEFT'} onChange={handleChange} />
                  ◀ LEFT TEAM
                </label>
                <label className={`flex-1 cursor-pointer border-2 rounded-2xl py-3.5 text-center font-black text-xs uppercase tracking-[0.2em] transition-all ${formData.position === 'RIGHT' ? 'border-blue-600 bg-white text-blue-700 shadow-md ring-4 ring-blue-500/10 transform scale-[1.02]' : 'border-blue-100 text-blue-400 bg-white/50 hover:bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="position" value="RIGHT" className="hidden" checked={formData.position === 'RIGHT'} onChange={handleChange} />
                  RIGHT TEAM ▶
                </label>
              </div>
            </div>
          </div>

          {/* 🟢 Grid for Desktop (2 Columns), Stacked on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><User size={18} /></div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="John Doe" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><Mail size={18} /></div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="mail@example.com" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><Phone size={18} /></div>
                <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="+1 234 567 890" />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Country</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><Globe size={18} /></div>
                <input type="text" name="country" required value={formData.country} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="e.g. United States" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Login Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><Lock size={18} /></div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="••••••••" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-500 transition-colors"><Lock size={18} /></div>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-inner font-bold text-sm text-slate-800" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button 
              type="submit" disabled={loading || !sponsorName}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-xs mt-2 uppercase tracking-[0.2em] flex justify-center items-center gap-3 group"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Generating Account...</>
              ) : (
                <>Complete Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1">
            Sign In Here
          </Link>
        </div>
      </div>

      {/* 🟢 SUCCESS MODAL (Premium Implementation) */}
      <SuccessModal 
        isOpen={isModalOpen}
        title="Welcome Aboard! 🎉"
        message="Your account has been created successfully. Please take a screenshot or copy your details before proceeding."
        btnText="PROCEED TO LOGIN"
        type="success"
        onConfirm={handleModalClose}
      >
        {registeredData && (
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 mt-4 space-y-5 shadow-inner text-left">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Your Assigned User ID</p>
              <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-2xl p-4 group hover:border-blue-300 transition-colors">
                <span className="text-3xl font-black text-blue-700 tracking-tighter">{registeredData.userId}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(registeredData.userId);
                    alert("User ID Copied to Clipboard!"); 
                  }}
                  className="bg-blue-50 p-3 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-90"
                  title="Copy ID"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Login Password</p>
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
                <span className="text-lg font-bold text-slate-800 tracking-wide">{registeredData.password}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-[10px] font-black text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-200/50 mt-4 leading-relaxed uppercase tracking-widest">
              <span className="text-xl">⚠️</span>
              <p>Keep these credentials safe. FinSaarthi support will never ask for your password.</p>
            </div>
          </div>
        )}
      </SuccessModal>
    </div>
  );
};

export default Register;