import React, { useState } from 'react';
import axios from 'axios';
import { X, Package, UserCheck, Lock, ShieldCheck, Wallet2, Loader2, AlertCircle, Calendar } from 'lucide-react';
// 🟢 Context Hook
import { useAuth } from '../../context/AuthContext'; 
// 🟢 Success Modal Import
import SuccessModal from '../SuccessModal'; 

const BuyPackageModal = ({ closeModal }) => {
  const { user, updateUser, token } = useAuth(); 

  const [targetUserId, setTargetUserId] = useState('');
  const [selectedPackage, setSelectedPackage] = useState(10);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [targetInfo, setTargetInfo] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🟢 Success Modal States
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const packages = [
    { price: 10, name: 'Starter Plan' },
    { price: 30, name: 'Basic Plan' },
    { price: 50, name: 'Pro Plan' },
    { price: 100, name: 'Premium Plan' },
    { price: 500, name: 'VIP Plan' },
  ];

  const currentUserId = user?.userId || user?._id;
  const displayBalance = user?.wallets?.mainBalance ?? user?.walletBalance ?? user?.balance ?? 0;

  // 🔍 VERIFY TARGET USER (Active packages bhi nikalenge)
  const verifyTargetUser = async () => {
    if (!targetUserId) return;
    setVerifying(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.get(`/api/user/check-status/${targetUserId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

    if (!currentUserId) return setMessage({ type: 'error', text: 'Session expired. Please login again.' });
    if (!targetUserId || !transactionPassword) return setMessage({ type: 'error', text: 'Please fill all details.' });
    
    if (displayBalance < Number(selectedPackage)) {
      return setMessage({ type: 'error', text: 'Insufficient balance in Main Wallet!' });
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/user/buy-package-for-user', {
        buyerId: currentUserId, 
        targetUserId: targetUserId.trim(), 
        packageAmount: Number(selectedPackage),
        transactionPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Context state
      if (response.data.buyer) {
        updateUser(response.data.buyer); 
      }

      // 🟢 SUCCESS POPUP DATA SET KAREIN
      setReceiptData({
        amount: selectedPackage,
        targetId: targetUserId.trim(),
        targetName: targetInfo?.name || "Verified User",
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      });
      
      // Success Modal Kholein (Pichla modal piche khada rahega)
      setIsSuccessOpen(true);
      
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Transaction failed.' });
    } finally {
      setLoading(false);
    }
  };

  // Jab Success Modal ka 'DONE' button click ho
  const handleSuccessConfirm = () => {
    setIsSuccessOpen(false);
    closeModal(); // Main modal bhi band kar do
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 border-t-4 border-t-amber-500 animate-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 shadow-sm">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Plan Activation</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My ID: {user?.userId}</p>
              </div>
            </div>
            <button onClick={closeModal} className="bg-white hover:bg-gray-100 text-gray-400 p-2 rounded-full transition-all active:scale-90 shadow-sm border border-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scroll space-y-6">
            
            {/* 💰 Balance Display */}
            <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2">
                <Wallet2 size={18} className="text-amber-600" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Main Wallet</span>
              </div>
              <span className="text-2xl font-black text-amber-700">
                 ${displayBalance.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleBuyPackage} className="space-y-6">
              
              {/* Target ID Verification */}
              <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Activate For (User ID)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <UserCheck className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input 
                      type="text"
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-sm shadow-inner transition-all"
                      placeholder="Enter 7-Digit ID"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={verifyTargetUser}
                    className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3.5 sm:py-0 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-md flex justify-center items-center"
                  >
                    {verifying ? <Loader2 className="animate-spin" size={16}/> : 'VERIFY'}
                  </button>
                </div>
                
                {/* 🟢 Verified Target Info + Unke Active Packages */}
                {targetInfo && (
                  <div className="mt-3 flex flex-col gap-2 animate-in fade-in">
                    <div className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-black uppercase tracking-tight">{targetInfo.name}</span>
                      </div>
                      <span className="bg-emerald-200 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Verified</span>
                    </div>
                    
                    {/* Unke purane packages dikhao */}
                    <div className="flex justify-between items-center bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Currently Active Plans:</span>
                      <span className="text-xs font-black text-indigo-600">
                        {targetInfo.activePackages?.length > 0 
                          ? `$${targetInfo.activePackages.join(', $')}` 
                          : (targetInfo.currentPackage ? `$${targetInfo.currentPackage}` : 'None')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 🟢 PREMIUM PACKAGE BOXES (Replacing Dropdown) */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-widest ml-1">Select Activation Plan</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {packages.map(pkg => {
                    const isSelected = selectedPackage === pkg.price;
                    return (
                      <div 
                        key={pkg.price}
                        onClick={() => setSelectedPackage(pkg.price)}
                        className={`cursor-pointer rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center p-3 sm:p-4 text-center ${
                          isSelected 
                            ? 'bg-amber-50 border-amber-500 shadow-md shadow-amber-100 scale-[1.02]' 
                            : 'bg-white border-gray-100 hover:border-amber-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>
                          {pkg.name}
                        </span>
                        <span className={`text-2xl sm:text-3xl font-black tracking-tighter ${isSelected ? 'text-amber-700' : 'text-gray-800'}`}>
                          ${pkg.price}
                        </span>
                        {isSelected && <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 animate-pulse"></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction Password */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Security Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    value={transactionPassword}
                    onChange={(e) => setTransactionPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-black text-sm shadow-inner transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error Feedback */}
              {message.text && message.type === 'error' && (
                <div className="p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-start gap-2 border bg-red-50 text-red-600 border-red-100 animate-pulse">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <div className="sticky bottom-0 pt-2 bg-white pb-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    loading ? 'bg-gray-100 text-gray-400' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'
                  }`}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : `Activate Plan — $${selectedPackage}`}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* 🟢 UNIVERSAL SUCCESS MODAL OVERLAY */}
      <SuccessModal
        isOpen={isSuccessOpen}
        title="Plan Activated!"
        message="The package has been successfully purchased and credited to the target account."
        btnText="DONE"
        type="success"
        onConfirm={handleSuccessConfirm}
      >
        {/* Receipt Details Box */}
        {receiptData && (
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3 text-left">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Package size={12}/> Package</span>
              <span className="font-black text-emerald-600 text-lg">${receiptData.amount}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><UserCheck size={12}/> Target ID</span>
              <span className="font-black text-gray-800">{receiptData.targetId}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck size={12}/> Account Name</span>
              <span className="font-bold text-gray-600 text-xs uppercase">{receiptData.targetName}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> Date</span>
              <span className="font-bold text-gray-500 text-xs">{receiptData.date}</span>
            </div>
          </div>
        )}
      </SuccessModal>
    </>
  );
};

export default BuyPackageModal;