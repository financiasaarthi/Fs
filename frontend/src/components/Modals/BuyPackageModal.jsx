import React, { useState } from 'react';
import axios from 'axios';
import { X, Package, UserCheck, Lock, ShieldCheck, Wallet2 } from 'lucide-react';

const BuyPackageModal = ({ user, setUser, closeModal }) => {
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(10);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [targetInfo, setTargetInfo] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const packages = [
    { price: 10, name: 'Starter Plan' },
    { price: 30, name: 'Basic Plan' },
    { price: 50, name: 'Pro Plan' },
    { price: 100, name: 'Premium Plan' },
    { price: 500, name: 'VIP Plan' },
  ];

  // 🔍 VERIFY TARGET USER
  const verifyTargetUser = async () => {
    if (!targetUserId) return;
    setVerifying(true);
    setMessage({ type: '', text: '' });
    try {
      // 🟢 FIX: 'users' ko 'user' kar diya taaki 404 na aaye
      const res = await axios.get(`/api/user/check-status/${targetUserId.trim()}`);
      setTargetInfo(res.data.user);
    } catch (err) {
      setTargetInfo(null);
      setMessage({ type: 'error', text: 'User ID not found!' });
    } finally {
      setVerifying(false);
    }
  };

  // 📦 BUY PACKAGE
  const handleBuyPackage = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!targetUserId || !transactionPassword) {
      setMessage({ type: 'error', text: 'Please fill all details.' });
      return;
    }

    setLoading(true);
    try {
      // 🟢 FIX: 'users' ko 'user' kar diya
      const response = await axios.post('/api/user/buy-package-for-user', {
        buyerId: user._id, // Context wala main user jo paise de raha hai
        targetUserId: targetUserId.trim(), // Jiski ID activate karni hai
        packageAmount: Number(selectedPackage),
        transactionPassword
      });

      setMessage({ type: 'success', text: response.data.message });

      // 🟢 FIX: Backend already fresh buyer data bhej raha hai, toh extra API call hata di
      if (setUser && response.data.buyer) {
        const freshUserData = response.data.buyer;
        setUser(freshUserData);
        localStorage.setItem('user', JSON.stringify(freshUserData));
      }

      // Success ke 2 second baad modal band ho jayega
      setTimeout(() => closeModal(), 2000);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Transaction failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 border-t-4 border-t-amber-500 animate-fadeIn relative">
        
        {/* Header Section */}
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Activation</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Purchase New Plan</p>
            </div>
          </div>
          <button onClick={closeModal} className="bg-gray-50 hover:bg-gray-100 text-gray-400 p-2 rounded-full transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 💰 Balance */}
          <div className="flex items-center justify-between bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Wallet2 size={16} className="text-amber-600" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Available Balance</span>
            </div>
            <span className="text-xl font-black text-amber-700">${user?.walletBalance?.toFixed(2)}</span>
          </div>

          <form onSubmit={handleBuyPackage} className="space-y-4">
            {/* Target User ID */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest ml-1">Target User ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserCheck className="absolute left-4 top-3.5 text-gray-400" size={16} />
                  <input 
                    type="number" // 🟢 Changed to number as IDs are numbers
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none uppercase font-black text-xs"
                    placeholder="ENTER ID (e.g. 5508001)"
                  />
                </div>
                <button 
                  type="button"
                  onClick={verifyTargetUser}
                  className="bg-gray-900 text-white px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
                >
                  {verifying ? '...' : 'Verify'}
                </button>
              </div>
              {targetInfo && (
                <div className="mt-2 flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 p-2.5 rounded-xl border border-green-100">
                  <ShieldCheck size={12} />
                  <span>USER: {targetInfo.name} | PKG: ${targetInfo.currentPackage || '0'}</span>
                </div>
              )}
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest ml-1">Choose Plan</label>
              <select 
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-xs text-gray-700 appearance-none cursor-pointer"
              >
                {packages.map(pkg => (
                  <option key={pkg.price} value={pkg.price}>{pkg.name} — ${pkg.price}</option>
                ))}
              </select>
            </div>

            {/* Transaction Password */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={16} />
                <input 
                  type="password" 
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Feedback Message */}
            {message.text && (
              <div className={`p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                <ShieldCheck size={14} />
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100'
              }`}
            >
              {loading ? 'Processing...' : `Confirm Purchase — $${selectedPackage}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuyPackageModal;