import React from 'react';
import { Send } from 'lucide-react';

const TelegramButton = () => {
  return (
    <button 
      onClick={() => window.open('https://t.me/financialsaarthi', '_blank')}
      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-2xl transition-all duration-300 shadow-md hover:shadow-blue-500/20 active:scale-[0.98]"
    >
      <Send size={18} />
      <span className="uppercase tracking-widest text-[11px]">Join Telegram</span>
    </button>
  );
};

export default TelegramButton;