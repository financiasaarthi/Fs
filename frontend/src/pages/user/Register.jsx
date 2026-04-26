import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Link as LinkIcon, Copy, Phone, Globe, ArrowRight, ChevronLeft } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    password: "",
    confirmPassword: "",
    sponsorId: sponsorFromURL, 
    position: "LEFT"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      const { confirmPassword, ...dataToSend } = formData;
      const res = await axios.post('/api/auth/register', dataToSend);
      
      setRegisteredData({
        userId: res.data.userId, 
        password: formData.password
      });
      
      setIsModalOpen(true); 

    } catch (err) {
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
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors z-20">
        <ChevronLeft size={18} /> <span className="hidden sm:inline">Back to Home</span>
      </Link>

      {/* 🟢 REGISTRATION CARD */}
      <div 
        className="relative z-10 w-full max-w-[650px] bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 p-6 md:p-10"
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
            Create Account
          </h1>
          <p className="text-slate-500 font-medium mt-1.5 text-sm">Join FinSaarthi and start your financial journey</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 🟢 Grid for Desktop (2 Columns), Stacked on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><User size={18} /></div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="John Doe" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={18} /></div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="mail@example.com" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Phone size={18} /></div>
                <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="+91 9876543210" />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Country</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Globe size={18} /></div>
                <input type="text" name="country" required value={formData.country} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="e.g. India" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></div>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="••••••••" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={18} /></div>
                <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white shadow-sm text-slate-900 font-medium text-sm" placeholder="••••••••" />
              </div>
            </div>

            {/* Sponsor ID (Full Width on Mobile, Full Width on Desktop via col-span-2) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Sponsor ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors"><LinkIcon size={18} /></div>
                <input type="text" name="sponsorId" required value={formData.sponsorId} onChange={handleChange} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none uppercase transition-all bg-blue-50/50 shadow-sm font-bold text-sm text-blue-700" placeholder="e.g. 1000000" />
              </div>
            </div>

            {/* Network Position (Full Width) */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">Network Position</label>
              <div className="flex gap-3 md:gap-4">
                <label className={`flex-1 cursor-pointer border-2 rounded-xl py-3 text-center font-black text-[13px] tracking-wide transition-all ${formData.position === 'LEFT' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-500/20 transform scale-[1.02]' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="position" value="LEFT" className="hidden" checked={formData.position === 'LEFT'} onChange={handleChange} />
                  ◀ LEFT TEAM
                </label>
                <label className={`flex-1 cursor-pointer border-2 rounded-xl py-3 text-center font-black text-[13px] tracking-wide transition-all ${formData.position === 'RIGHT' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-500/20 transform scale-[1.02]' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <input type="radio" name="position" value="RIGHT" className="hidden" checked={formData.position === 'RIGHT'} onChange={handleChange} />
                  RIGHT TEAM ▶
                </label>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 text-base mt-6 uppercase tracking-widest flex justify-center items-center gap-2 group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Creating Account...
              </>
            ) : (
              <>Create My Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-sm font-medium border-t border-slate-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>

      {/* 🟢 SUCCESS MODAL (Premium Styling Inside) */}
      <SuccessModal 
        isOpen={isModalOpen}
        title="Welcome Aboard! 🎉"
        message="Your account has been created successfully. Please save your login details securely before proceeding."
        btnText="I have saved it, Go to Login"
        onConfirm={handleModalClose}
      >
        {registeredData && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-5">
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Your User ID</p>
              <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
                <span className="text-2xl font-black text-blue-700 tracking-wider">{registeredData.userId}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(registeredData.userId);
                    alert("User ID Copied to Clipboard!"); 
                  }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Copy ID"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Your Password</p>
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-3.5">
                <span className="text-lg font-bold text-slate-800 tracking-wide">{registeredData.password}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 text-[11px] font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200/50 mt-2">
              <span>⚠️</span>
              <p>Do not share these details with anyone. FinSaarthi staff will never ask for your password.</p>
            </div>
          </div>
        )}
      </SuccessModal>
    </div>
  );
};

export default Register;