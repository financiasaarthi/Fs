import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessModal = ({ isOpen, title, message, children, onConfirm, btnText = "OK" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header with Green Gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center relative">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg mb-3">
            <CheckCircle2 size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">{title || "Success!"}</h2>
        </div>

        {/* Content Area */}
        <div className="p-6 text-center">
          {message && <p className="text-gray-600 mb-6 text-lg">{message}</p>}
          
          {/* Custom Content (Jaise ID aur Password) */}
          {children && (
            <div className="mb-6 text-left">
              {children}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onConfirm}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-lg transform hover:scale-[1.02]"
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;