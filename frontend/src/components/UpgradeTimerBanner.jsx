import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🟢 React Router for smooth navigation
import { Clock, AlertTriangle, ShieldAlert } from 'lucide-react'; // 🟢 Lucide icons for modern look

const UpgradeTimerBanner = ({ user }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);
    const [shouldShow, setShouldShow] = useState(false);
    const navigate = useNavigate(); // Navigation hook

    useEffect(() => {
        if (!user || !user.createdAt) return;

        // 🟢 30 June 2026 (Target Date)
        const cutoffDate = new Date('2026-06-30T23:59:59Z');
        const joinDate = new Date(user.createdAt);

        // 🔴 Condition: User 30 June ke baad aaya ho AUR uska package sirf $10 ho
        if (user.currentPackage === 10 && joinDate > cutoffDate) {
            setShouldShow(true);

            // Expiry Date = Join Date + 30 Days
            const expiryDate = new Date(joinDate.getTime() + (30 * 24 * 60 * 60 * 1000));

            const updateTimer = () => {
                const now = new Date();
                const difference = expiryDate - now;

                if (difference <= 0) {
                    setIsExpired(true);
                    setTimeLeft('00:00:00:00');
                } else {
                    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                    const minutes = Math.floor((difference / 1000 / 60) % 60);
                    const seconds = Math.floor((difference / 1000) % 60);
                    
                    // Format with leading zeros for a digital clock look
                    const formatNum = (num) => String(num).padStart(2, '0');
                    setTimeLeft(`${formatNum(days)}d : ${formatNum(hours)}h : ${formatNum(minutes)}m : ${formatNum(seconds)}s`);
                }
            };

            updateTimer();
            const timerInterval = setInterval(updateTimer, 1000);

            return () => clearInterval(timerInterval); 
        } else {
            setShouldShow(false);
        }
    }, [user]);

    if (!shouldShow) return null;

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-sm border mb-4 transition-all duration-300
            ${isExpired 
                ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
            }`}
        >
            {/* Background glowing effect */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50
                ${isExpired ? 'bg-red-300' : 'bg-blue-300'}`}>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 sm:p-5 gap-4">
                
                {/* Left Side: Icon & Text */}
                <div className="flex items-start md:items-center gap-4 w-full md:w-auto">
                    <div className={`p-3 rounded-full shrink-0 shadow-sm
                        ${isExpired ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isExpired ? <ShieldAlert size={28} /> : <AlertTriangle size={28} />}
                    </div>
                    
                    <div>
                        <h3 className={`font-black text-lg tracking-tight
                            ${isExpired ? 'text-red-700' : 'text-blue-900'}`}>
                            {isExpired ? 'Account Deactivation Alert!' : 'Action Required: Upgrade Account'}
                        </h3>
                        <p className={`text-xs sm:text-sm mt-1 font-medium max-w-xl
                            ${isExpired ? 'text-red-600' : 'text-blue-700/80'}`}>
                            {isExpired 
                                ? "Your 30-day trial period has ended. Please top-up immediately to keep your ID active and continue earning." 
                                : "Your $10 trial package is expiring soon. Upgrade your package before the timer runs out to avoid ID deactivation."}
                        </p>
                    </div>
                </div>
                
                {/* Right Side: Timer & Button */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 md:gap-2 border-t md:border-t-0 border-blue-100/50 pt-3 md:pt-0">
                    
                    <div className={`flex items-center gap-1.5 font-black text-lg sm:text-xl tracking-wider
                        ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                        {!isExpired && <Clock size={18} className="animate-pulse" />}
                        <span>{isExpired ? 'TIME EXPIRED' : timeLeft}</span>
                    </div>

                    <button 
                         className={`px-6 py-2 text-sm font-bold text-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 w-full md:w-auto
                            ${isExpired 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            }`}
                    >
                        Upgrade Now
                    </button>
                </div>

            </div>
        </div>
    );
};

export default UpgradeTimerBanner;