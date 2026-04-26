import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Send, X, DollarSign, User, AlertCircle, CheckCircle2, Lock, Loader2 } from 'lucide-react';

const TransferModal = ({ isOpen, onClose, user, setUser }) => {
    const [receiverId, setReceiverId] = useState('');
    const [receiverName, setReceiverName] = useState(''); // 🟢 Name store karne ke liye
    const [isSearching, setIsSearching] = useState(false); // 🟢 Spinner ke liye
    const [amount, setAmount] = useState('');
    const [transactionPassword, setTransactionPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 🟢 Receiver Name fetch karne ka logic
    useEffect(() => {
        const fetchName = async () => {
            if (receiverId.length === 7) { // 7 digit hote hi search shuru
                setIsSearching(true);
                setError('');
                try {
                    const res = await api.get(`/user/find-name/${receiverId}`);
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

        const timeoutId = setTimeout(fetchName, 500); // 0.5 sec wait karega type karne ke baad
        return () => clearTimeout(timeoutId);
    }, [receiverId]);

    if (!isOpen) return null;

    const handleTransfer = async (e) => {
        e.preventDefault();
        
        // 🔴 DOUBLE CLICK PREVENTION: Agar pehle se loading hai toh ruk jao
        if (loading) return;

        setError(''); setSuccess('');

        const currentUserId = user?.userId || user?._id || user?.id;

        if (Number(amount) > user.walletBalance) {
            return setError("Insufficient balance!");
        }

        if (!receiverName) {
            return setError("Please verify Receiver ID first.");
        }

        setLoading(true); // Yahan se button disable ho jayega
        try {
            const res = await api.post('/user/transfer', {
                senderId: currentUserId,
                receiverId: receiverId,
                amount: Number(amount),
                transactionPassword: transactionPassword
            });

            setSuccess(res.data.message);
            
            if (setUser && res.data.user) {
                setUser(res.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.user));
            }

            setTimeout(() => { 
                onClose(); 
                resetForm();
            }, 2500);
        } catch (err) {
            setError(err.response?.data?.message || "Transfer failed.");
            setLoading(false); // Error aane par hi button vapas khulega
        }
    };

    const resetForm = () => {
        setAmount(''); setReceiverId(''); setTransactionPassword('');
        setReceiverName(''); setSuccess(''); setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 flex justify-between items-center text-white">
                    <h2 className="text-lg font-black uppercase tracking-tight flex items-center">
                        <Send size={20} className="mr-2 text-indigo-200" /> P2P Transfer
                    </h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform"><X size={24} /></button>
                </div>

                <div className="p-6 bg-gray-50/50">
                    {/* Balance Card */}
                    <div className="bg-white border border-indigo-100 p-4 rounded-2xl mb-6 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Wallet</span>
                        <span className="text-xl font-black text-indigo-600">${(user?.walletBalance || 0).toFixed(2)}</span>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center text-xs font-bold border border-red-100"><AlertCircle size={16} className="mr-2 shrink-0"/> {error}</div>}
                    {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl flex items-center text-xs font-bold border border-emerald-100"><CheckCircle2 size={16} className="mr-2 shrink-0"/> {success}</div>}
                    
                    <form onSubmit={handleTransfer} className="space-y-4">
                        {/* Receiver ID Input */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 mb-1 uppercase tracking-widest ml-1">Receiver User ID</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-3.5 text-gray-300" />
                                <input type="text" required value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Enter 7-Digit ID" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 font-bold text-sm bg-white shadow-inner" />
                                {isSearching && <Loader2 size={18} className="absolute right-4 top-3.5 animate-spin text-indigo-400" />}
                            </div>
                            
                            {/* 🟢 Display Receiver Name */}
                            {receiverName && (
                                <div className="mt-2 ml-1 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-black text-emerald-600 uppercase">Transferring to: {receiverName}</span>
                                </div>
                            )}
                        </div>

                        {/* Amount & Password */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-3.5 text-gray-300" />
                                <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ($)" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 font-bold text-sm bg-white" />
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-3.5 text-gray-300" />
                                <input type="password" required value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)} placeholder="Security Pin" className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 outline-none focus:border-indigo-500 font-bold text-sm bg-white" />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || isSearching || !receiverName} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg mt-4 disabled:bg-gray-300 transition-all uppercase text-sm tracking-widest flex justify-center items-center"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                            {loading ? "Processing..." : "Send Fund Now"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default TransferModal;