import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios'; // Apne path ke hisab se adjust kar lena
import { ArrowLeftCircle, Save, Lock, User, Mail, Smartphone, Wallet, Key, ShieldCheck, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// 🎨 Premium Animations
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
`;

function UserProfile() {
  const navigate = useNavigate();
  const { user, updateUser, token } = useAuth();

  /* ================= STATES ================= */
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    walletAddress: user?.walletAddress || '',
  });

  const [profileTxnPassword, setProfileTxnPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [currentTxnPassword, setCurrentTxnPassword] = useState('');
  const [newTxnPassword, setNewTxnPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, title: '', message: '', type: 'info' });

  const showMessage = (title, message, type = 'info') => {
    setToast({ open: true, title, message, type });
    setTimeout(() => setToast({ open: false, title: '', message: '', type: 'info' }), 5000);
  };

  /* ================= WALLET LOCK LOGIC ================= */
  const checkWalletAddress = async (address) => {
    try {
      const res = await api.post('/user/check-wallet', { walletAddress: address });
      return res.data.exists;
    } catch (err) {
      return false;
    }
  };

  const walletLockReason = useMemo(() => {
    if (!user || user.role === 'admin') return null;

    if (user.pendingWithdrawals && Object.values(user.pendingWithdrawals).some(v => v > 0)) {
      return 'Withdrawal in progress. Wallet locked.';
    }

    if (user.walletAddressChangeCount >= 2 && user.walletAddressChangeWindowStart && Date.now() - new Date(user.walletAddressChangeWindowStart).getTime() < 24 * 60 * 60 * 1000) {
      return 'Change limit reached (Max 2/day).';
    }

    if (user.walletAddress && formData.walletAddress && formData.walletAddress !== user.walletAddress) {
      return 'You already have a registered wallet.';
    }

    return null;
  }, [user, formData.walletAddress]);

  const isWalletLocked = Boolean(walletLockReason);

  /* ================= HANDLERS ================= */
  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    if (!profileTxnPassword) return showMessage('Password Required', 'Please enter Transaction Password.', 'error');
    if (formData.walletAddress && formData.walletAddress !== user.walletAddress) {
      const exists = await checkWalletAddress(formData.walletAddress);
      if (exists) return showMessage('Wallet Error', 'This wallet is already used by someone else.', 'error');
    }
    if (isWalletLocked) return showMessage('Locked', walletLockReason, 'error');

    try {
      setLoading(true);
      const res = await api.put(`/user/${user.userId}`, { ...formData, oldTxnPassword: profileTxnPassword }, { headers: { Authorization: `Bearer ${token}` } });
      updateUser(res.data.user || res.data);
      setProfileTxnPassword('');
      showMessage('Success', 'Profile updated successfully!', 'success');
    } catch (err) {
      showMessage('Update Failed', err.response?.data?.message || 'Security rules blocked update.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async type => {
    let payload;
    if (type === 'login') {
      if (!loginPassword || !newLoginPassword) return showMessage('Error', 'Enter current and new password.', 'error');
      payload = { oldPassword: loginPassword, newPassword: newLoginPassword };
    } else {
      if (!currentTxnPassword || !newTxnPassword) return showMessage('Error', 'Enter current and new txn password.', 'error');
      payload = { oldTxnPassword: currentTxnPassword, newTxnPassword };
    }

    try {
      setLoading(true);
      await api.put(`/user/change-password/${user.userId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      showMessage('Success', `${type === 'login' ? 'Login' : 'Transaction'} Password updated!`, 'success');
      if (type === 'login') { setLoginPassword(''); setNewLoginPassword(''); } 
      else { setCurrentTxnPassword(''); setNewTxnPassword(''); }
    } catch (err) {
      showMessage('Failed', err.response?.data?.message || 'Password update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Please login first.</div>;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-slate-50 text-slate-800 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white p-4 md:p-8">
      <style>{styleSheet}</style>

      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-10 w-[300px] h-[300px] bg-blue-200 rounded-full blur-[100px] opacity-40 pointer-events-none" style={{ animation: 'blob 7s infinite' }}></div>
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-indigo-200 rounded-full blur-[100px] opacity-40 pointer-events-none" style={{ animation: 'blob 7s infinite', animationDelay: '2s' }}></div>

      {/* Custom Toast Notification */}
      {toast.open && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-start gap-3 border backdrop-blur-md animate-fade-in-down ${toast.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : 'bg-emerald-50/90 border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <AlertTriangle className="text-red-500" /> : <CheckCircle2 className="text-emerald-500" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs opacity-80 mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, open: false })} className="ml-4 opacity-50 hover:opacity-100"><X size={16}/></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10" style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}>
        
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors">
            <ArrowLeftCircle size={20} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security & Profile</h1>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* 🟢 COL 1: PROFILE INFO CARD */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-8 flex flex-col items-center h-fit">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-lg shadow-blue-500/30 mb-4 border-4 border-white">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-xl font-black text-slate-900">{user.name}</h2>
            <p className="text-sm font-medium text-slate-500 mb-6">{user.email}</p>
            
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">User ID</span>
                <span className="text-sm font-black text-blue-600">{user.userId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sponsor ID</span>
                <span className="text-sm font-black text-slate-700">{user.sponsorId || 'N/A'}</span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full w-full">
              <ShieldCheck size={16} /> Verified Account
            </div>
          </div>

          {/* 🟢 COL 2: EDIT PROFILE FORM */}
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
              <User size={20} className="text-blue-500" /> Personal Details
            </h3>

            <div className="space-y-5">
              {/* Read Only Fields */}
              {[
                { label: "Full Name", icon: User, value: formData.name },
                { label: "Email Address", icon: Mail, value: formData.email },
                { label: "Mobile Number", icon: Smartphone, value: formData.mobile }
              ].map((item, idx) => (
                <div key={idx}>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{item.label}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><item.icon size={16} /></div>
                    <input type="text" value={item.value} disabled className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium text-sm cursor-not-allowed" />
                  </div>
                </div>
              ))}

              {/* Wallet Address (Editable with lock logic) */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">USDT Wallet (BEP20)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600"><Wallet size={16} /></div>
                  <input name="walletAddress" value={formData.walletAddress} onChange={handleChange} disabled={isWalletLocked} placeholder="Enter BEP20 Address" className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-medium ${isWalletLocked ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-300 focus:border-blue-500 text-slate-900'}`} />
                </div>
                {isWalletLocked && (
                  <div className="mt-2 flex items-start gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <Lock size={14} className="mt-0.5 shrink-0" /> <p>{walletLockReason}</p>
                  </div>
                )}
              </div>

              {/* Confirm Txn Password & Save */}
              <div className="pt-6 mt-6 border-t border-slate-100">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Confirm Transaction Password</label>
                <div className="relative group mb-4">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-emerald-600"><Key size={16} /></div>
                  <input type="password" value={profileTxnPassword} onChange={e => setProfileTxnPassword(e.target.value)} placeholder="Enter Txn Password to Save" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white text-slate-900 font-medium text-sm" />
                </div>
                <button onClick={handleSaveProfile} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-70">
                  <Save size={18} /> {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* 🟢 COL 3: SECURITY SETTINGS */}
          <div className="space-y-6">
            
            {/* Login Password Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-6">
              <h3 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><Key size={18} className="text-indigo-500" /> Change Login Password</h3>
              <div className="space-y-3">
                <input type="password" placeholder="Current Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" />
                <input type="password" placeholder="New Password" value={newLoginPassword} onChange={e => setNewLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium" />
                <button onClick={() => handleChangePassword('login')} disabled={loading} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 text-sm">
                  Update Login Password
                </button>
              </div>
            </div>

            {/* Txn Password Card */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl p-6">
              <h3 className="text-md font-black text-slate-900 mb-5 flex items-center gap-2"><ShieldCheck size={18} className="text-rose-500" /> Change Txn Password</h3>
              <div className="space-y-3">
                <input type="password" placeholder="Current Txn Password" value={currentTxnPassword} onChange={e => setCurrentTxnPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" />
                <input type="password" placeholder="New Txn Password" value={newTxnPassword} onChange={e => setNewTxnPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none text-sm font-medium" />
                <button onClick={() => handleChangePassword('txn')} disabled={loading} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-2 text-sm">
                  Update Txn Password
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default UserProfile;