import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const MessageModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  // Type ke hisaab se color aur icon change karne ki setting
  const config = {
    success: {
      icon: <CheckCircle className="text-green-500" size={48} />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      titleColor: 'text-green-800',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    error: {
      icon: <XCircle className="text-red-500" size={48} />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      titleColor: 'text-red-800',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: <AlertTriangle className="text-orange-500" size={48} />,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      titleColor: 'text-orange-800',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
    },
    info: {
      icon: <Info className="text-blue-500" size={48} />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      titleColor: 'text-blue-800',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    }
  };

  const currentConfig = config[type] || config.info;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      
      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-100 transition-transform duration-300">
        
        {/* Top Header Area */}
        <div className={`flex flex-col items-center justify-center p-6 ${currentConfig.bg} ${currentConfig.border} border-b relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="bg-white p-3 rounded-full shadow-sm mb-4">
            {currentConfig.icon}
          </div>
          
          <h3 className={`text-xl font-black uppercase tracking-widest text-center ${currentConfig.titleColor}`}>
            {title}
          </h3>
        </div>

        {/* Message Body */}
        <div className="p-6 text-center">
          <p className="text-gray-600 font-bold text-sm">
            {message}
          </p>
        </div>

        {/* Button Area */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className={`w-full text-white font-black py-3 rounded-xl shadow-md transition-all uppercase tracking-widest text-sm ${currentConfig.buttonBg}`}
          >
            Okay
          </button>
        </div>

      </div>
    </div>
  );
};

export default MessageModal;