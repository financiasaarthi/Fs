import React, { useState } from 'react';
import { Copy, CheckCircle2, Share2 } from 'lucide-react';

const ReferralBox = ({ userId }) => {
  const [copied, setCopied] = useState(false);
  
  // 🟢 NAYA ADD KIYA: Left / Right position track karne ke liye state
  const [position, setPosition] = useState('left'); 

  // 🟢 NAYA FIX: URL mein '&position=left' ya '&position=right' add ho jayega
  const referralLink = `${window.location.origin}/register?sponsor=${userId || ''}&position=${position}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    /**
     * 🟢 Premium Minimalist Style:
     * border-t-2 border-t-blue-500 (Top Accent)
     * p-3 (Compact Mobile Padding)
     */
    <div className="bg-white p-3 sm:p-5 rounded-3xl border border-gray-100 border-t-2 border-t-blue-500 shadow-sm w-full h-full flex flex-col justify-center">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
            <Share2 size={14} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Referral Link
          </p>
        </div>
        {copied && (
          <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter animate-bounce">
            Link Copied!
          </span>
        )}
      </div>

      {/* 🟢 NAYA: Left / Right Toggle Switch (Super Clean UI) */}
      <div className="flex items-center bg-gray-50 p-1 rounded-2xl mb-3 border border-gray-100">
        <button
          onClick={() => setPosition('left')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
            position === 'left'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Left Leg
        </button>
        <button
          onClick={() => setPosition('right')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
            position === 'right'
              ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Right Leg
        </button>
      </div>

      {/* Compact Link & Button Row */}
      <div className="flex flex-col gap-2">
        
        {/* Link Field */}
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center overflow-hidden group hover:border-blue-100 transition-colors">
          <input 
            type="text" 
            readOnly 
            value={referralLink} 
            className="w-full bg-transparent outline-none text-gray-700 font-bold text-xs truncate"
          />
        </div>

        {/* Action Button */}
        <button 
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest shadow-sm active:scale-95 ${
            copied 
              ? 'bg-green-500 text-white shadow-green-100' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 hover:-translate-y-0.5'
          }`}
        >
          {copied ? (
            <><CheckCircle2 size={14} /> Copied</>
          ) : (
            <><Copy size={14} /> Copy {position === 'left' ? 'Left' : 'Right'} Link</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReferralBox;