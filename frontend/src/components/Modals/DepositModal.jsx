import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // 🟢 Ensure API path is correct
import { QRCodeCanvas } from "qrcode.react";
import { X, Copy, CheckCircle2, AlertTriangle, ShieldCheck, Wallet, Loader2 } from 'lucide-react';
// 🟢 Token attach karne ke liye Context zaroori hai
import { useAuth } from '../../context/AuthContext';

export default function DepositModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch permanent address when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepositAddress();
    } else {
      setAddress("");
      setLoading(true);
      setCopied(false);
    }
  }, [isOpen]);

  const fetchDepositAddress = async () => {
    try {
      setLoading(true);
      // 🟢 Pass token in headers securely
      const res = await api.get("/deposit/get-address", {
         headers: { Authorization: `Bearer ${token}` }
      }); 
      setAddress(res.data.address);
    } catch (err) {
      console.error("Failed to fetch address", err);
      // alert("Could not load deposit address. Please try again.");
      onClose(); // Close modal silently or handle gracefully
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    if (!address) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        const ta = document.createElement("textarea");
        ta.value = address;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm sm:max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border-t-4 border-t-indigo-500 animate-in zoom-in-95 duration-300">
        
        {/* 🟢 Premium Header */}
        <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 shadow-sm">
               <Wallet size={22} />
             </div>
             <div>
               <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                 Deposit USDT 
                 <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">BEP-20</span>
               </h2>
               <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Add Funds to Main Wallet</p>
             </div>
          </div>
          <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-400 p-2 rounded-full transition-all active:scale-90 shadow-sm border border-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* 🟢 Loading State */}
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Generating Secure Address...</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center">
            
            <p className="text-center text-xs font-bold text-gray-500 mb-6 px-4">
              Send USDT to this address. Funds will be credited automatically after <span className="text-gray-800 font-black">network confirmation</span>.
            </p>

            {/* 🟢 QR Code Box (Glassmorphism feel) */}
            <div className="mb-6 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white p-4 border-2 border-gray-100 rounded-[1.5rem] shadow-sm">
                {/* Fallback if address is missing to avoid QRCode crash */}
                {address ? (
                    <QRCodeCanvas value={address} size={180} level={"H"} className="rounded-lg" />
                ) : (
                    <div className="w-[180px] h-[180px] bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-bold text-center p-4">Address Error</div>
                )}
                
                {/* Small Center Logo/Icon on QR (Optional but looks premium) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md">
                   <div className="bg-indigo-600 rounded-full p-1 text-white">
                      <ShieldCheck size={16} />
                   </div>
                </div>
              </div>
            </div>

            {/* 🟢 Address Copy Area */}
            <div className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-6 shadow-inner relative">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 text-center">Your Permanent Deposit Address</p>
              
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    readOnly
                    value={address || "Generating..."}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-white px-3 py-3.5 rounded-xl text-xs font-bold text-gray-700 border border-gray-200 outline-none truncate shadow-sm cursor-text"
                  />
                </div>
                <button 
                  onClick={copyText} 
                  className={`flex items-center justify-center px-4 rounded-xl text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md ${
                    copied ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                  }`}
                >
                  {copied ? <CheckCircle2 size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                  {copied ? 'COPIED' : 'COPY'}
                </button>
              </div>
            </div>

            {/* 🟢 Warning Box */}
            <div className="w-full flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200/50">
               <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
               <div>
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Warning</p>
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                    Send ONLY <span className="font-black text-amber-900">USDT</span> via the <span className="font-black text-amber-900">BNB Smart Chain (BEP-20)</span> network. Sending any other asset will result in permanent loss.
                  </p>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}