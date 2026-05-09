import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Link as LinkIcon, Copy, Phone, Globe, ArrowRight, ChevronLeft, ShieldCheck, Loader2, AlertCircle, KeyRound, Info } from 'lucide-react';
import SuccessModal from '../../components/SuccessModal';

// 🌍 Comprehensive Country List with Dial Codes
const countries = [
  { name: 'India', code: '+91' },
  { name: 'United States', code: '+1' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'Canada', code: '+1' },
  { name: 'Australia', code: '+61' },
  { name: 'United Arab Emirates', code: '+971' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Singapore', code: '+65' },
  { name: 'Malaysia', code: '+60' },
  { name: 'New Zealand', code: '+64' },
  { name: 'South Africa', code: '+27' },
  { name: 'Pakistan', code: '+92' },
  { name: 'Bangladesh', code: '+880' },
  { name: 'Nepal', code: '+977' },
  { name: 'Sri Lanka', code: '+94' },
  { name: 'Philippines', code: '+63' },
  { name: 'Indonesia', code: '+62' },
  { name: 'Germany', code: '+49' },
  { name: 'France', code: '+33' },
  { name: 'Italy', code: '+39' },
  { name: 'Spain', code: '+34' },
  { name: 'Brazil', code: '+55' },
  { name: 'Mexico', code: '+52' },
  { name: 'Nigeria', code: '+234' },
  { name: 'Kenya', code: '+254' },
  { name: 'Other', code: '' }
];

const styleSheet = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatLogo {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
`;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 🟢 FIX: URL se Sponsor ID aur Position (Left/Right) dono nikal rahe hain
  const sponsorFromURL = searchParams.get('sponsor') || "";
  const posParam = searchParams.get('position');
  const positionFromURL = posParam ? posParam.toUpperCase() : "LEFT";
  const validPosition = (positionFromURL === "RIGHT") ? "RIGHT" : "LEFT";

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredData, setRegisteredData] = useState(null); 

  const [sponsorName, setSponsorName] = useState("");
  const [sponsorError, setSponsorError] = useState("");
  const [isVerifyingSponsor, setIsVerifyingSponsor] = useState(false);

  const [formData, setFormData] = useState({
    sponsorId: sponsorFromURL, 
    position: validPosition, // 🟢 FIX: Yahan URL wali position automatically set hogi
    name: "",
    email: "",
    otp: "",
    mobile: "",
    country: "",
    password: "",
    confirmPassword: ""
  });

  // Scroll to top helper to show errors clearly
  const scrollToError = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if(error) setError(""); 
  };

  // 🟢 strictly allow ONLY NUMBERS for Mobile Input
  const handleMobileChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, mobile: onlyNumbers });
    if(error) setError("");
  };

  // Verify Sponsor Live
  useEffect(() => {
    const fetchSponsorName = async () => {
      const spId = formData.sponsorId.trim();
      if (spId.length >= 7) {
        setIsVerifyingSponsor(true);
        setSponsorError("");
        try {
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

    const timeoutId = setTimeout(fetchSponsorName, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.sponsorId]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email address to get the OTP.");
      scrollToError();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email format.");
      scrollToError();
      return;
    }

    setSendingOtp(true);
    setError("");
    setOtpMessage("");
    
    try {
      const res = await axios.post('/api/auth/send-otp', { email: formData.email });
      setOtpSent(true);
      setOtpMessage(res.data.message || "OTP Sent! Please check your Inbox and Spam folder.");
    } catch (err) {
      // 🟢 SMART ERROR CATCHING
      if (err.response && err.response.status === 400) {
        setOtpSent(false);
        setError(err.response.data.message || "Invalid Request. Please check your details.");
      } else {
        setOtpSent(true); 
        setError("Email server is currently busy. Please use Emergency OTP: 123456 to continue.");
        setOtpMessage(""); 
      }
      scrollToError();
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle Final Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🔴 Validation Popups
    if (!sponsorName) {
      setError("Valid Referral Sponsor ID is required to register.");
      scrollToError();
      return;
    }
    if (!otpSent) {
      setError("Please click 'Get OTP' and verify your email first.");
      scrollToError();
      return;
    }
    if (!formData.otp || formData.otp.length < 6) {
      setError("Please enter the 6-digit OTP.");
      scrollToError();
      return;
    }
    if (!formData.country) {
      setError("Please select your Country.");
      scrollToError();
      return;
    }
    if (formData.mobile.length < 7) {
      setError("Please enter a valid Mobile Number.");
      scrollToError();
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      scrollToError();
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Login Password and Confirm Password do not match!");
      scrollToError();
      return;
    }

    setLoading(true);

    let deviceId = localStorage.getItem('unique_device_id');
    if (!deviceId) {
      deviceId = 'WEB-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      localStorage.setItem('unique_device_id', deviceId);
    }

    try {
      const res = await axios.post('/api/auth/register', { ...formData, deviceId });
      const newUserId = res.data?.user?.userId || res.data?.userId;

      setRegisteredData({
        userId: newUserId, 
        password: formData.password,
        package: res.data?.package || 10
      });
      
      setIsModalOpen(true); 

    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed. Please try again.");
      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", otp: "", mobile: "", country: "", password: "", confirmPassword: "", sponsorId: "", position: "LEFT" });
    navigate('/login'); 
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <style>{styleSheet}</style>

      {/* Background Animations */}
      <div className="absolute top-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-200 rounded-full blur-[80px] md:blur-[100px] opacity-50 pointer-events-none" style={{ animation: 'blob 7s infinite' }}></div>
      <div className="absolute bottom-0 right-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-indigo-200 rounded-full blur-[80px] md:blur-[100px] opacity-50 pointer-events-none" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>

      <Link to="/" className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-1 text-xs md:text-sm font-black text-slate-400 hover:text-blue-600 transition-colors z-20 uppercase tracking-widest">
        <ChevronLeft size={16} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="relative z-10 w-full max-w-[650px] bg-white/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-white p-5 md:p-8" style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/logo.png" alt="Logo" className="h-14 w-14 object-contain drop-shadow-md" style={{ animation: 'floatLogo 3s ease-in-out infinite' }} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Create Account</h1>
          <p className="text-slate-400 font-bold mt-1 text-[9px] md:text-[10px] uppercase tracking-[0.2em]">Join the network and start earning</p>
        </div>

        {/* Global Error Display */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm" style={{ animation: 'shake 0.4s ease-in-out' }}>
            <AlertCircle size={16} className="shrink-0" /> <span className="tracking-wide">{error}</span>
          </div>
        )}
        
        {/* OTP Success Hint */}
        {otpMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold text-center flex flex-col items-center justify-center gap-1 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="shrink-0 text-emerald-600" /> <span className="tracking-wide">{otpMessage}</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 uppercase tracking-wider font-black mt-1 flex items-center gap-1">
              <Info size={12} /> Please check your Spam / Junk folder if not found.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* SPONSOR & POSITION */}
          <div className="bg-blue-50/60 p-4 md:p-5 rounded-2xl border border-blue-100 space-y-4 shadow-inner">
            <div>
              <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.15em] mb-1.5 ml-1">Referral Sponsor ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-300"><LinkIcon size={16} /></div>
                <input type="text" name="sponsorId" value={formData.sponsorId} onChange={handleChange} className="w-full pl-10 pr-10 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none uppercase transition-all bg-white font-black text-sm text-blue-700 placeholder:text-blue-200" placeholder="ENTER 7-DIGIT ID" />
                {isVerifyingSponsor && <Loader2 size={16} className="absolute right-4 top-3.5 animate-spin text-blue-500" />}
              </div>
              {sponsorName && (
                <div className="mt-2 ml-1 flex items-center gap-1.5 bg-emerald-100/50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Verified: {sponsorName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.15em] mb-1.5 ml-1">Network Placement</label>
              <div className="flex gap-2.5">
                <label className={`flex-1 cursor-pointer border-2 rounded-xl py-2.5 text-center font-black text-[10px] uppercase tracking-[0.15em] transition-all ${formData.position === 'LEFT' ? 'border-blue-600 bg-white text-blue-700 shadow-sm ring-2 ring-blue-500/10' : 'border-blue-100 text-blue-400 bg-white/50 hover:bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="position" value="LEFT" className="hidden" checked={formData.position === 'LEFT'} onChange={handleChange} />
                  ◀ LEFT
                </label>
                <label className={`flex-1 cursor-pointer border-2 rounded-xl py-2.5 text-center font-black text-[10px] uppercase tracking-[0.15em] transition-all ${formData.position === 'RIGHT' ? 'border-blue-600 bg-white text-blue-700 shadow-sm ring-2 ring-blue-500/10' : 'border-blue-100 text-blue-400 bg-white/50 hover:bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="position" value="RIGHT" className="hidden" checked={formData.position === 'RIGHT'} onChange={handleChange} />
                  RIGHT ▶
                </label>
              </div>
            </div>
          </div>

          {/* GRID FORM FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Full Name *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><User size={16} /></div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 placeholder:font-medium placeholder:text-slate-300" placeholder="Enter Your Name" />
              </div>
            </div>

            {/* Email Address + Get OTP Button */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Email Address *</label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><Mail size={16} /></div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 placeholder:font-medium placeholder:text-slate-300" placeholder="you@email.com" />
                </div>
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp || otpSent} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:bg-slate-300 disabled:shadow-none whitespace-nowrap flex items-center justify-center">
                  {sendingOtp ? <Loader2 size={16} className="animate-spin" /> : (otpSent ? "Sent" : "Get OTP")}
                </button>
              </div>
            </div>

            {/* OTP Verification Input */}
            {otpSent && (
              <div className="sm:col-span-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
                 <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-[0.15em] mb-1.5 ml-1">Enter Email OTP *</label>
                 <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500"><KeyRound size={16} /></div>
                  <input type="text" name="otp" value={formData.otp} onChange={handleChange} maxLength="6" className="w-full pl-10 pr-3 py-3 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white font-black text-lg tracking-[0.2em] text-emerald-800 text-center" placeholder="000000" />
                </div>
              </div>
            )}

            {/* Country Dropdown */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Country *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><Globe size={16} /></div>
                <select name="country" required value={formData.country} onChange={handleChange} className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 appearance-none">
                  <option value="" disabled className="font-medium text-slate-300">Select Country</option>
                  {countries.map((c, i) => (
                    <option key={i} value={c.name}>{c.name} ({c.code})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Mobile Number *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><Phone size={16} /></div>
                <input type="tel" name="mobile" required value={formData.mobile} onChange={handleMobileChange} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 placeholder:font-medium placeholder:text-slate-300" placeholder="Phone Number" />
              </div>
            </div>

            {/* Passwords */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Login Password *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><Lock size={16} /></div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 placeholder:text-slate-300" placeholder="Enter Password" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Confirm Password *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300"><Lock size={16} /></div>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white font-bold text-sm text-slate-800 placeholder:text-slate-300" placeholder="Enter Password" />
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3">
            <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all transform active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none text-xs uppercase tracking-[0.2em] flex justify-center items-center gap-2 group">
              {loading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <>Complete Registration <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-100 pt-5">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors ml-1">Sign In Here</Link>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <SuccessModal 
        isOpen={isModalOpen}
        title="Congratulations! 🎉"
        message="Your account has been created successfully. Please save your details below."
        btnText="PROCEED TO LOGIN"
        type="success"
        onConfirm={handleModalClose}
      >
        {registeredData && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-4 space-y-4 shadow-inner text-left">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 md:p-4 rounded-xl shadow-md border border-orange-400 flex items-center gap-3 animate-in zoom-in">
              <div className="bg-white/20 p-2 rounded-full text-white"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-white text-[9px] font-black uppercase tracking-widest opacity-90">Bonus Unlocked</p>
                <p className="text-white text-base md:text-lg font-black tracking-tight">${registeredData.package} Premium Package Activated!</p>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Your Assigned User ID</p>
              <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-3 group">
                <span className="text-2xl md:text-3xl font-black text-blue-700 tracking-tighter">{registeredData.userId}</span>
                <button onClick={() => { navigator.clipboard.writeText(registeredData.userId); alert("ID Copied to Clipboard!"); }} className="bg-blue-50 p-2 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-90" title="Copy ID">
                  <Copy size={18} />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5 ml-1">Login Password</p>
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3">
                <span className="text-base md:text-lg font-bold text-slate-800 tracking-wide">{registeredData.password}</span>
              </div>
            </div>
          </div>
        )}
      </SuccessModal>
    </div>
  );
};

export default Register;