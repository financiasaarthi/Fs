import React, { useState, useEffect } from 'react';
import api from '../../api/axios'; 
import { Send, X, DollarSign, UserCheck, AlertCircle, Lock, Loader2, ArrowRightLeft, Calendar } from 'lucide-react';
// 🟢 Context Hook
import { useAuth } from '../../context/AuthContext'; 
// 🟢 Success Modal Import
import SuccessModal from '../SuccessModal'; 

const TransferModal = ({ isOpen, onClose }) => {
    const { user, updateUser, token } = useAuth(); 

    const [receiverId, setReceiverId] = useState('');
    const [receiverName, setReceiverName] = useState(''); 
    const [isSearching, setIsSearching] = useState(false); 
    const [amount, setAmount] = useState('');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🟢 Success Modal States
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    // 💰 Safe Balance Check
    const displayBalance = user?.wallets?.mainBalance ?? user?.walletBalance ?? user?.balance ?? 0;

    // 🔍 Receiver Name fetch karne ka logic
    useEffect(() => {
        const fetchName = async () => {
            if (receiverId.trim().length >= 7) { 
                setIsSearching(true);
                setError('');
                try {
                    const res = await api.get(`/user/find-name/${receiverId.trim()}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setReceiverName(res.data.name);
                } catch (err) {
                    setReceiverName('');
                    setError("User not found!");
                } finally {
                    setIsSearching(false);
                }
            } else {
                setReceiverName('');
            }
        };

        const timeoutId = setTimeout(fetchName, 500);
        return () => clearTimeout(timeoutId);
    }, [receiverId, token]);

    if (!isOpen) return null;

    const handleTransfer = async (e) => {
        e.preventDefault();
        
        if (loading) return;
        setError(''); 

        // Session Check
        const currentUserId = user?.userId || user?._id;
        if (!currentUserId) return setError("Session expired. Please login again.");
        if (Number(amount) > displayBalance) return setError("Insufficient balance in Main Wallet!");
        if (!receiverName) return setError("Please verify Receiver ID first.");
        if (Number(amount) <= 0) return setError("Please enter a valid amount.");

        setLoading(true);
        try {
            const res = await api.post('/user/transfer', {
                senderId: currentUserId, 
                receiverId: receiverId.trim(),
                amount: Number(amount),
                transactionPassword: transactionPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 🟢 Update context balance immediately
            if (res.data.user) {
                updateUser(res.data.user);
            }

            // 🟢 SET SUCCESS RECEIPT DATA
            setReceiptData({
                amount: Number(amount).toFixed(2),
                receiverId: receiverId.trim(),
                receiverName: receiverName,
                transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`, // Dummy Txn ID for premium feel
                date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            });

            // Open Success Modal
            setIsSuccessOpen(true);
            
        } catch (err) {
            setError(err.response?.data?.message || "Transfer failed.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAmount(''); setReceiverId(''); setTransactionPassword('');
        setReceiverName(''); setError(''); setLoading(false);
    };

    // Jab Success Modal ka 'DONE' button click ho
    const handleSuccessConfirm = () => {
        setIsSuccessOpen(false);
        resetForm();
        onClose(); // Main modal band
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 border-t-4 border-t-indigo-500 animate-in zoom-in duration-200 relative max-h-[90vh] flex flex-col">
                    
                    {/* Header */}
                    <div className="p-6 flex justify-between items-center border-b border-gray-50 bg-gray-50/50 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-sm">
                                <Send size={22} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">P2P Transfer</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wallet to Wallet</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-400 p-2 rounded-full transition-all active:scale-90 shadow-sm border border-gray-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scroll space-y-6">
                        
                        {/* 💰 Balance Card */}
                        <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center gap-2">
                                <ArrowRightLeft size={18} className="text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Main Wallet</span>
                            </div>
                            <span className="text-2xl font-black text-indigo-700">
                                ${Number(displayBalance).toFixed(2)}
                            </span>
                        </div>

                        <form onSubmit={handleTransfer} className="space-y-5">
                            
                            {/* Receiver ID Verification */}
                            <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
                                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest ml-1">Transfer To (User ID)</label>
                                <div className="relative">
                                    <UserCheck size={18} className="absolute left-4 top-3.5 text-gray-400" />
                                    <input 
                                        type="text" required 
                                        value={receiverId} 
                                        onChange={(e) => setReceiverId(e.target.value)} 
                                        placeholder="Enter 7-Digit ID" 
                                        className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-sm bg-white shadow-inner transition-all" 
                                    />
                                    {isSearching && <Loader2 size={18} className="absolute right-4 top-3.5 animate-spin text-indigo-400" />}
                                </div>
                                
                                {receiverName && (
                                    <div className="mt-3 flex justify-between items-center bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-100 animate-in fade-in">
                                        <div className="flex items-center gap-2 text-emerald-700">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-black uppercase tracking-tight">{receiverName}</span>
                                        </div>
                                        <span className="bg-emerald-200 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Verified</span>
                                    </div>
                                )}
                            </div>

                            {/* Amount & Password */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Transfer Amount</label>
                                    <div className="relative">
                                        <DollarSign size={18} className="absolute left-4 top-3.5 text-gray-400" />
                                        <input 
                                            type="number" required min="1" step="0.01"
                                            value={amount} 
                                            onChange={(e) => setAmount(e.target.value)} 
                                            placeholder="Enter Amount ($)" 
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-sm bg-white shadow-inner transition-all" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-widest ml-1">Security Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-3.5 text-gray-400" />
                                        <input 
                                            type="password" required 
                                            value={transactionPassword} 
                                            onChange={(e) => setTransactionPassword(e.target.value)} 
                                            placeholder="Enter Password" 
                                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-black text-sm bg-white shadow-inner transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error Feedback */}
                            {error && (
                                <div className="p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-start gap-2 border bg-red-50 text-red-600 border-red-100 animate-pulse">
                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="sticky bottom-0 pt-2 bg-white pb-2">
                                <button 
                                    type="submit" 
                                    disabled={loading || isSearching || !receiverName || Number(amount) <= 0} 
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg mt-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-[0.98] uppercase text-[10px] tracking-[0.2em] flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={16} />}
                                    {loading ? "Processing..." : "Confirm Transfer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 🟢 UNIVERSAL SUCCESS MODAL OVERLAY */}
            <SuccessModal
                isOpen={isSuccessOpen}
                title="Transfer Successful!"
                message="Funds have been successfully transferred to the receiver's wallet."
                btnText="DONE"
                type="success"
                onConfirm={handleSuccessConfirm}
            >
                {/* 🧾 Transfer Receipt */}
                {receiptData && (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3 text-left shadow-sm">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Amount Sent</span>
                        <span className="font-black text-emerald-600 text-xl">${receiptData.amount}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><UserCheck size={12}/> Sent To</span>
                        <div className="text-right">
                            <p className="font-bold text-gray-800 text-xs uppercase">{receiptData.receiverName}</p>
                            <p className="font-black text-indigo-500 text-[10px]">ID: {receiptData.receiverId}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3 pt-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">Txn ID</span>
                        <span className="font-mono font-bold text-gray-500 text-xs">{receiptData.transactionId}</span>
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

export default TransferModal;